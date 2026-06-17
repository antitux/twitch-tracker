from flask import Flask, render_template, jsonify, request, make_response
import requests
import os
import time

app = Flask(__name__)

# Configuration
CLIENT_ID = os.getenv('CLIENT_ID')
ACCESS_TOKEN = os.getenv('ACCESS_TOKEN')
USER_ID = os.getenv('USER_ID')

def get_followed_channels(client_id, token, user_id):
    """Get list of channels the user follows"""
    url = f"https://api.twitch.tv/helix/channels/followed"
    headers = {
        "Client-ID": client_id,
        "Authorization": f"Bearer {token}"
    }
    params = {"user_id": user_id, "first": 100}
    
    all_follows = []
    while True:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code != 200:
            break
            
        data = response.json()
        all_follows.extend(data["data"])
        
        if "pagination" in data and "cursor" in data["pagination"]:
            params["after"] = data["pagination"]["cursor"]
        else:
            break
    
    return all_follows

def get_live_streams(client_id, token, user_ids):
    """Check which channels are currently live"""
    url = "https://api.twitch.tv/helix/streams"
    headers = {
        "Client-ID": client_id,
        "Authorization": f"Bearer {token}"
    }
    
    live_streams = []
    for i in range(0, len(user_ids), 100):
        batch = user_ids[i:i+100]
        params = {"user_id": batch}
        response = requests.get(url, headers=headers, params=params)
        live_streams.extend(response.json()["data"])
    
    return live_streams

def get_live_usernames():
    """Get sorted list of live usernames"""
    follows = get_followed_channels(CLIENT_ID, ACCESS_TOKEN, USER_ID)
    broadcaster_ids = [f["broadcaster_id"] for f in follows]
    
    live_streams = get_live_streams(CLIENT_ID, ACCESS_TOKEN, broadcaster_ids)
    
    if live_streams:
        live_streams.sort(key=lambda x: x['viewer_count'], reverse=True)
        return [stream['user_login'] for stream in live_streams]
    
    return []

@app.context_processor
def inject_cache_bust():
    """Inject cache busting timestamp into all templates"""
    return {'cache_bust': int(time.time())}

@app.route('/')
def index():
    usernames = get_live_usernames()
    hide_header = request.args.get('hide_header', '').lower() in [
        'true', '1', 'yes'
    ]
    
    if usernames:
        parent_domain = os.getenv('PARENT_DOMAIN', 'localhost')
        response = make_response(render_template(
            'streams.html',
            usernames=usernames,
            count=len(usernames),
            parent_domain=parent_domain,
            hide_header=hide_header
        ))
    else:
        response = make_response(render_template('no_streams.html'))
    
    # Add cache control headers
    response.headers['Cache-Control'] = (
        'no-cache, no-store, must-revalidate'
    )
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    
    return response

@app.route('/api/live-streams')
def api_live_streams():
    """API endpoint to check current live streams"""
    usernames = get_live_usernames()
    
    return jsonify({
        'usernames': usernames,
        'count': len(usernames)
    })

if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_DEBUG', '').lower() in ('1', 'true', 'yes', 'on')
    app.run(debug=debug_mode, port=5000)