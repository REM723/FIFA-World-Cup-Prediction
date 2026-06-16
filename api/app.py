from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
from model import (
    get_top_teams,
    get_team_flags,
    match_probabilities,
    generate_match_score,
    simulate_group_stage,
    get_qualified_teams,
    run_knockout_silent,
    monte_carlo,
    GROUPS_2026,
    get_df,
)
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

OUTPUTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'outputs')


# ---------------------------------------------------------------------------
# Team data
# ---------------------------------------------------------------------------

@app.get('/api/teams')
def teams():
    return jsonify(get_top_teams(48))


@app.get('/api/groups')
def groups():
    flags = get_team_flags()

    def flag(name):
        return flags.get(name.strip().lower(), '')

    result = {}
    for group, team_list in GROUPS_2026.items():
        result[group] = [
            {'name': t, 'flag_url': flag(t)}
            for t in team_list
        ]
    return jsonify(result)


# ---------------------------------------------------------------------------
# Predictions (from CSV or live Monte Carlo)
# ---------------------------------------------------------------------------

@app.get('/api/predictions')
def predictions():
    csv_path = os.path.join(OUTPUTS_DIR, 'final_world_cup_2026_predictions.csv')
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        flags = get_team_flags()
        records = []
        for _, row in df.iterrows():
            name_clean = str(row['Team']).strip().lower()
            records.append({
                'team':        row['Team'],
                'titles':      int(row['Titles']),
                'probability': round(float(row['Title Probability (%)']), 2),
                'flag_url':    flags.get(name_clean, ''),
            })
        return jsonify(records)
    return jsonify([])


@app.post('/api/simulate/monte-carlo')
def run_monte_carlo():
    body = request.get_json(silent=True) or {}
    n = min(int(body.get('n', 1000)), 5000)
    results = monte_carlo(n=n)

    flags = get_team_flags()
    for r in results:
        r['flag_url'] = flags.get(r['team'].strip().lower(), '')

    return jsonify(results)


# ---------------------------------------------------------------------------
# Match predictor
# ---------------------------------------------------------------------------

@app.post('/api/match/predict')
def predict_match():
    body = request.get_json(silent=True) or {}
    team_a = body.get('team_a', '')
    team_b = body.get('team_b', '')
    if not team_a or not team_b:
        return jsonify({'error': 'team_a and team_b required'}), 400

    p_a, p_draw, p_b = match_probabilities(team_a, team_b)
    scores = [generate_match_score(team_a, team_b) for _ in range(5)]

    return jsonify({
        'team_a':   team_a,
        'team_b':   team_b,
        'prob_a':   round(p_a * 100, 1),
        'prob_draw': round(p_draw * 100, 1),
        'prob_b':   round(p_b * 100, 1),
        'sample_scores': [{'a': s[0], 'b': s[1]} for s in scores],
    })


# ---------------------------------------------------------------------------
# Full tournament simulation
# ---------------------------------------------------------------------------

@app.post('/api/simulate/tournament')
def simulate_tournament():
    group_results = simulate_group_stage(GROUPS_2026)
    qualified     = get_qualified_teams(group_results)
    champion, rounds_log = run_knockout_silent(qualified)

    flags = get_team_flags()

    def enrich(t):
        return {'name': t, 'flag_url': flags.get(t.strip().lower(), '')}

    enriched_groups = {}
    for g, standings in group_results.items():
        enriched_groups[g] = [
            {**s, 'flag_url': flags.get(s['team'].strip().lower(), '')}
            for s in standings
        ]

    enriched_rounds = {}
    for rname, matches in rounds_log.items():
        enriched_rounds[rname] = [
            {
                'team1':   m['team1'],
                'team2':   m['team2'],
                'winner':  m['winner'],
                'flag1':   flags.get(m['team1'].strip().lower(), ''),
                'flag2':   flags.get(m['team2'].strip().lower(), ''),
                'flag_w':  flags.get(m['winner'].strip().lower(), ''),
            }
            for m in matches
        ]

    return jsonify({
        'champion':     champion,
        'champion_flag': flags.get(champion.strip().lower(), ''),
        'groups':       enriched_groups,
        'knockout':     enriched_rounds,
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
