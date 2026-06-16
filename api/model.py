import pandas as pd
import numpy as np
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
OUTPUTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'outputs')

# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------

def load_data():
    national_teams = pd.read_csv(os.path.join(DATA_DIR, 'national_teams.csv'))

    corrections = {
        'France': 1250000000,
        'England': 1500000000,
        'Spain':   1200000000,
    }
    for team, value in corrections.items():
        national_teams.loc[national_teams['name'] == team, 'total_market_value'] = value

    from sklearn.preprocessing import MinMaxScaler
    scaler = MinMaxScaler()

    df = national_teams.copy()
    df['total_market_value'] = df['total_market_value'].fillna(0)

    max_ranking = df['fifa_ranking'].max()
    df['inverse_fifa'] = (max_ranking - df['fifa_ranking']) + 1

    df['norm_fifa'] = scaler.fit_transform(df[['inverse_fifa']])
    df['norm_value'] = scaler.fit_transform(df[['total_market_value']])

    df['team_rating'] = df['norm_fifa'] * 0.4 + df['norm_value'] * 0.6

    name_map = {
        'czech republic':    'czechia',
        'republic of ireland': 'ireland',
        'united states':     'usa',
        'south korea':       'republic of korea',
        'ivory coast':       "côte d'ivoire",
        'netherlands':       'netherlands',
        'turkiye':           'turkiye',
    }

    def clean_name(n):
        n = str(n).strip().lower()
        return name_map.get(n, n)

    df['name_clean'] = df['name'].apply(clean_name)
    return df


_df_ratings = None

def get_df():
    global _df_ratings
    if _df_ratings is None:
        _df_ratings = load_data()
    return _df_ratings


def _rating_dict():
    df = get_df()
    return dict(zip(df['name_clean'], df['team_rating']))


_RATING_DICT = None
_DEFAULT_RATING = None

def _ensure_dicts():
    global _RATING_DICT, _DEFAULT_RATING
    if _RATING_DICT is None:
        _RATING_DICT = _rating_dict()
        _DEFAULT_RATING = float(np.median(list(_RATING_DICT.values())))


# ---------------------------------------------------------------------------
# Groups
# ---------------------------------------------------------------------------

GROUPS_2026 = {
    'Group A': ['Mexico',      'South Africa',           'South Korea',  'Czechia'],
    'Group B': ['Canada',      'Switzerland',            'Qatar',        'Bosnia and Herzegovina'],
    'Group C': ['Brazil',      'Morocco',                'Haiti',        'Scotland'],
    'Group D': ['USA',         'Paraguay',               'Australia',    'Turkiye'],
    'Group E': ['Germany',     'Curacao',                'Ivory Coast',  'Ecuador'],
    'Group F': ['Netherlands', 'Japan',                  'Tunisia',      'Sweden'],
    'Group G': ['Belgium',     'Egypt',                  'Iran',         'New Zealand'],
    'Group H': ['Spain',       'Cabo Verde',             'Saudi Arabia', 'Uruguay'],
    'Group I': ['France',      'Senegal',                'Norway',       'Iraq'],
    'Group J': ['Argentina',   'Algeria',                'Austria',      'Jordan'],
    'Group K': ['Portugal',    'Uzbekistan',             'Colombia',     'Congo DR'],
    'Group L': ['England',     'Croatia',                'Ghana',        'Panama'],
}

HOSTS = {'usa', 'canada', 'mexico'}

# ---------------------------------------------------------------------------
# Core model
# ---------------------------------------------------------------------------

def get_rating(team_name):
    _ensure_dicts()
    return _RATING_DICT.get(str(team_name).strip().lower(), _DEFAULT_RATING)


def apply_home_advantage(team_name, rating):
    if str(team_name).strip().lower() in HOSTS:
        return rating * 1.05
    return rating


def match_probabilities(team_a, team_b):
    rating_a = apply_home_advantage(team_a, get_rating(team_a))
    rating_b = apply_home_advantage(team_b, get_rating(team_b))

    diff  = rating_a - rating_b
    gamma = 5

    prob_a_base = 1 / (1 + np.exp(-gamma * diff))
    prob_draw   = 0.28 * np.exp(-abs(gamma * diff))
    prob_a      = prob_a_base * (1 - prob_draw)
    prob_b      = (1 - prob_a_base) * (1 - prob_draw)

    return float(prob_a), float(prob_draw), float(prob_b)


def generate_match_score(team_a, team_b):
    p_a, p_draw, p_b = match_probabilities(team_a, team_b)

    result = np.random.choice(['A', 'DRAW', 'B'], p=[p_a, p_draw, p_b])

    if result == 'DRAW':
        goals = int(np.random.choice([0, 1, 2, 3], p=[0.20, 0.45, 0.25, 0.10]))
        return goals, goals

    if result == 'A':
        ga = int(np.random.choice([1, 2, 3, 4, 5], p=[0.30, 0.35, 0.20, 0.10, 0.05]))
        gb = int(np.random.randint(0, ga))
        return ga, gb

    gb = int(np.random.choice([1, 2, 3, 4, 5], p=[0.30, 0.35, 0.20, 0.10, 0.05]))
    ga = int(np.random.randint(0, gb))
    return ga, gb


# ---------------------------------------------------------------------------
# Group stage
# ---------------------------------------------------------------------------

def simulate_group_stage(groups):
    all_groups = {}

    for group_name, teams in groups.items():
        table = {t: {'points': 0, 'gf': 0, 'ga': 0, 'gd': 0,
                     'wins': 0, 'draws': 0, 'losses': 0} for t in teams}

        for i in range(len(teams)):
            for j in range(i + 1, len(teams)):
                t1, t2 = teams[i], teams[j]
                g1, g2 = generate_match_score(t1, t2)

                table[t1]['gf'] += g1
                table[t1]['ga'] += g2
                table[t2]['gf'] += g2
                table[t2]['ga'] += g1

                if g1 > g2:
                    table[t1]['points'] += 3
                    table[t1]['wins']   += 1
                    table[t2]['losses'] += 1
                elif g2 > g1:
                    table[t2]['points'] += 3
                    table[t2]['wins']   += 1
                    table[t1]['losses'] += 1
                else:
                    table[t1]['points'] += 1
                    table[t2]['points'] += 1
                    table[t1]['draws']  += 1
                    table[t2]['draws']  += 1

        for t in teams:
            table[t]['gd'] = table[t]['gf'] - table[t]['ga']

        standings = sorted(
            table.items(),
            key=lambda x: (x[1]['points'], x[1]['gd'], x[1]['gf']),
            reverse=True,
        )

        all_groups[group_name] = [
            {'team': t, **stats} for t, stats in standings
        ]

    return all_groups


# ---------------------------------------------------------------------------
# Knockout
# ---------------------------------------------------------------------------

def simulate_knockout_match(team1, team2):
    p1, _, p2 = match_probabilities(team1, team2)
    total = p1 + p2
    return np.random.choice([team1, team2], p=[p1 / total, p2 / total])


def get_qualified_teams(group_results):
    df = get_df()
    first_place  = []
    second_place = []
    third_place  = []

    for group, standings in group_results.items():
        first_place.append(standings[0]['team'])
        second_place.append(standings[1]['team'])

        t3 = standings[2]
        rating = float(df[df['name_clean'] == t3['team'].lower()]['team_rating'].values[0]) \
            if t3['team'].lower() in df['name_clean'].values else 0.0
        third_place.append({'team': t3['team'], 'points': t3['points'], 'rating': rating})

    third_df = pd.DataFrame(third_place).sort_values(
        by=['points', 'rating'], ascending=False
    )
    best_thirds = list(third_df['team'].head(8))

    return first_place + second_place + best_thirds


def run_knockout_silent(qualified_teams):
    teams = qualified_teams[:]
    np.random.shuffle(teams)

    rounds_log = {}
    round_names = ['Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Final']
    round_idx = 0

    while len(teams) > 1:
        rname = round_names[round_idx] if round_idx < len(round_names) else f'Round {round_idx+1}'
        matches = []
        winners = []
        for i in range(0, len(teams), 2):
            w = simulate_knockout_match(teams[i], teams[i + 1])
            matches.append({'team1': teams[i], 'team2': teams[i + 1], 'winner': w})
            winners.append(w)
        rounds_log[rname] = matches
        teams = winners
        round_idx += 1

    return teams[0], rounds_log


# ---------------------------------------------------------------------------
# Monte Carlo
# ---------------------------------------------------------------------------

def monte_carlo(groups=None, n=1000):
    if groups is None:
        groups = GROUPS_2026

    champions = {}
    for _ in range(n):
        group_results = simulate_group_stage(groups)
        qualified     = get_qualified_teams(group_results)
        champion, _   = run_knockout_silent(qualified)
        champions[champion] = champions.get(champion, 0) + 1

    results = [
        {'team': t, 'titles': c, 'probability': round(c / n * 100, 2)}
        for t, c in sorted(champions.items(), key=lambda x: -x[1])
    ]
    return results


# ---------------------------------------------------------------------------
# Helpers for API
# ---------------------------------------------------------------------------

def get_team_flags():
    """Return {name_clean: flag_url} mapping."""
    df = get_df()
    return dict(zip(df['name_clean'], df['team_image_url'].fillna('')))


def get_top_teams(n=48):
    df = get_df()
    top = df.sort_values('team_rating', ascending=False).head(n)
    records = []
    for _, row in top.iterrows():
        records.append({
            'name':        row['name'],
            'name_clean':  row['name_clean'],
            'rating':      round(float(row['team_rating']), 4),
            'fifa_ranking': int(row['fifa_ranking']) if not pd.isna(row['fifa_ranking']) else None,
            'market_value': float(row['total_market_value']) if not pd.isna(row['total_market_value']) else 0,
            'flag_url':    str(row.get('team_image_url', '')),
            'confederation': str(row.get('confederation', '')),
        })
    return records
