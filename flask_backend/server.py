from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from dotenv import load_dotenv
import os
import base64
import requests
import urllib.parse

# Load environment variables
load_dotenv()

# Flask app setup
app = Flask(__name__)
CORS(app)

# Spotify credentials
client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")
redirect_uri = "http://127.0.0.1:5000/callback"  # Flask backend callback URL
scope = "user-read-private user-read-email user-top-read"

# === Step 1: Provide Login URL ===
@app.route("/login-url")
def login_url():
    auth_url = "https://accounts.spotify.com/authorize"
    params = {
        "client_id": client_id,
        "response_type": "code",
        "redirect_uri": redirect_uri,
        "scope": scope
    }
    query_string = urllib.parse.urlencode(params)
    return jsonify({"url": f"{auth_url}?{query_string}"})

# React frontend base URL 
react_frontend_url = "http://localhost:5173"

# === Step 2: Handle Spotify Callback and Return Top Tracks ===
@app.route("/callback")
def callback():
    code = request.args.get("code")
    if not code:
        return jsonify({"error": "Missing code"}), 400

    token_data = exchange_code_for_token(code)
    if not token_data:
        return jsonify({"error": "Failed to get token"}), 400

    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")

    top_tracks = get_user_top_tracks(access_token)
    if top_tracks is None:
        return jsonify({"error": "Failed to fetch top tracks"}), 500

    # Prepare data to send to React app (consider what data you want to send)
    # For simplicity, encode tokens and tracks as query params (beware URL length limits!)
    # Usually better to store tokens in server-side session or send a token and fetch tracks separately.

    # Example: pass access token only
    params = {
        "access_token": access_token
        # Optionally, add more info here, or store on server and use session cookie
    }
    query_str = urllib.parse.urlencode(params)

    # Redirect user to React app with tokens in query string
    return redirect(f"{react_frontend_url}/top-tracks?{query_str}")


# === Helper: Exchange code for token ===
def exchange_code_for_token(code):
    url = "https://accounts.spotify.com/api/token"
    auth_str = f"{client_id}:{client_secret}"
    auth_bytes = auth_str.encode("utf-8")
    auth_b64 = base64.b64encode(auth_bytes).decode("utf-8")

    headers = {
        "Authorization": f"Basic {auth_b64}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri
    }

    res = requests.post(url, headers=headers, data=data)
    if res.status_code != 200:
        print("Token error:", res.status_code, res.text)
        return None
    return res.json()


# === Helper: Get user's top tracks with album image ===
def get_user_top_tracks(access_token):
    url = "https://api.spotify.com/v1/me/top/tracks?limit=10"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    res = requests.get(url, headers=headers)
    if res.status_code != 200:
        print("Top tracks error:", res.status_code, res.text)
        return None

    data = res.json()
    tracks = []
    for item in data.get("items", []):
        track_info = {
            "name": item["name"],
            "artist": item["artists"][0]["name"],
            "albumImage": item["album"]["images"][0]["url"] if item["album"]["images"] else ""

        }
        tracks.append(track_info)
    return tracks


# === Run server ===
if __name__ == "__main__":
    app.run(debug=True)
