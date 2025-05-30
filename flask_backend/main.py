# Local Imports
from dotenv import load_dotenv
from requests import post, get

# Builtin Imports
import os
import base64
import json
import urllib.parse

# Load environment variables from .env file
load_dotenv()

# Initializing local environment variables
client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")
redirect_uri = "http://127.0.0.1:5000/callback"
scope = "user-read-private user-read-email"

def get_token():
    auth_string = client_id + ":" + client_secret
    auth_bytes = auth_string.encode('utf-8')
    auth_base64 = str(base64.b64encode(auth_bytes), 'utf-8')

    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": "Basic " + auth_base64,
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {"grant_type": "client_credentials"}
    result = post(url, headers=headers, data=data)
    json_result = json.loads(result.content)
    token = json_result["access_token"]
    return token

def get_auth_header(token):
    return {"Authorization": "Bearer " + token}

def search_for_artist(token, artist_name):
    url = "https://api.spotify.com/v1/search"
    headers = get_auth_header(token)
    params = {
        "q": artist_name,
        "type": "artist",
        "limit": 1
    }
    response = get(url, headers=headers, params=params)
    json_result = json.loads(response.content)['artists']['items']
    if len(json_result) == 0:
        print("No artist found.")
        return None
    return json_result[0]

def get_songs_by_artist(token, artist_id):
    url = f"https://api.spotify.com/v1/artists/{artist_id}/top-tracks?country=US"
    headers = get_auth_header(token)
    params = {"market": "US"}
    response = get(url, headers=headers, params=params)
    json_result = json.loads(response.content)['tracks']
    return json_result

def format_songs(songs):
    for idx, song in enumerate(songs):
        artists = []
        for artist in song['artists']:
            artists.append(artist['name'])

        # Join the list of names with commas
        artist_names = ", ".join(artists)
        print(f"{idx + 1}. {song['name']} | {artist_names}")

def get_user_profile(access_token):
    url = "https://api.spotify.com/v1/me"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    response = get(url, headers=headers)
    if response.status_code != 200:
        print("Failed to get user profile:", response.status_code, response.text)
        return None
    return response.json()


token = get_token()
result = search_for_artist(token, "awolnation")
artist_id = result['id'] if result else None
format_songs(get_songs_by_artist(token, artist_id) if artist_id else "Artist not found.")

