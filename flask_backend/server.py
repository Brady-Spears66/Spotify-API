from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from dotenv import load_dotenv
import os
import base64
import requests
import urllib.parse

load_dotenv()

app = Flask(__name__)
# Allow your frontend URL for CORS
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")
redirect_uri = "http://127.0.0.1:5000/callback"
scope = "user-read-private user-read-email user-top-read"

react_frontend_url = "http://localhost:5173"

@app.route("/login-url")
def login_url():
    auth_url = "https://accounts.spotify.com/authorize"
    params = {
        "client_id": client_id,
        "response_type": "code",
        "redirect_uri": redirect_uri,
        "scope": scope,
        "show_dialog": "true"
    }
    query_string = urllib.parse.urlencode(params)
    return jsonify({"url": f"{auth_url}?{query_string}"})


@app.route("/callback")
def callback():
    code = request.args.get("code")
    if not code:
        return jsonify({"error": "Missing code"}), 400

    token_data = exchange_code_for_token(code)
    if not token_data:
        return jsonify({"error": "Failed to get token"}), 400

    params = {
        "access_token": token_data.get("access_token"),
        "refresh_token": token_data.get("refresh_token"),
        "expires_in": token_data.get("expires_in", 3600)
    }
    query_str = urllib.parse.urlencode(params)

    return redirect(f"{react_frontend_url}/?{query_str}")


@app.route("/refresh-access-token")
def refresh_access_token():
    refresh_token = request.args.get("refresh_token")
    if not refresh_token:
        return jsonify({"error": "Missing refresh token"}), 400

    url = "https://accounts.spotify.com/api/token"
    auth_str = f"{client_id}:{client_secret}"
    auth_b64 = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")

    headers = {
        "Authorization": f"Basic {auth_b64}",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    data = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token
    }

    res = requests.post(url, headers=headers, data=data)
    if res.status_code != 200:
        # Safe JSON parsing for error responses
        try:
            error_details = res.json()
        except requests.exceptions.JSONDecodeError:
            error_details = {"message": res.text or "Unknown error"}
        return jsonify({"error": "Failed to refresh token", "details": error_details}), 400

    return jsonify(res.json())


@app.route("/top-tracks")
def top_tracks():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 400

    access_token = auth_header.split(" ")[1]
    
    # Get time_range from query parameters, default to medium_term
    time_range = request.args.get("time_range", "medium_term")
    
    # Validate time_range parameter
    valid_time_ranges = ["short_term", "medium_term", "long_term"]
    if time_range not in valid_time_ranges:
        return jsonify({"error": "Invalid time_range parameter"}), 400
    
    tracks = get_user_top_tracks(access_token, time_range)
    if not tracks:
        return jsonify({"error": "Failed to fetch top tracks"}), 400

    return jsonify(tracks)


@app.route("/top-artists")
def top_artists():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 400

    access_token = auth_header.split(" ")[1]
    
    # Get time_range from query parameters, default to medium_term
    time_range = request.args.get("time_range", "medium_term")
    
    # Validate time_range parameter
    valid_time_ranges = ["short_term", "medium_term", "long_term"]
    if time_range not in valid_time_ranges:
        return jsonify({"error": "Invalid time_range parameter"}), 400
    
    artists = get_user_top_artists(access_token, time_range)
    if not artists:
        return jsonify({"error": "Failed to fetch top artists"}), 400

    return jsonify(artists)

@app.route("/search")
def search():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 400
    
    access_token = auth_header.split(" ")[1]

    # Get search query and type from the query parameters
    query = request.args.get("q", "").strip()
    search_type = request.args.get("type", "artist,album,track").strip()
    limit = request.args.get("limit", "10").strip()

    if not query:
        return jsonify({"error": "Missing search query"}), 400
    
    # Validate search types
    valid_types = ["artist", "album", "track", "playlist"]
    types = [t.strip() for t in search_type.split(",")]
    for t in types:
        if t not in valid_types:
            return jsonify({"error": f"Invalid search type: {t}"}), 400
    
    search_results = search_spotify(access_token, query, search_type, limit)
    if search_results is None:
        return jsonify({"error": "Failed to fetch search results"}), 400
    
    return jsonify(search_results)

@app.route("/user-profile")
def get_user_profile():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 400

    access_token = auth_header.split(" ")[1]

    url = "https://api.spotify.com/v1/me/"
    headers = {"Authorization": f"Bearer {access_token}"}
    res = requests.get(url, headers=headers)
    if res.status_code != 200:
        print("User Profile error:", res.status_code, res.text)
        # Safe JSON parsing for error responses
        try:
            error_details = res.json()
        except requests.exceptions.JSONDecodeError:
            error_details = {"message": res.text or "Unknown error"}
        return jsonify({"error": "Failed to fetch user profile", "details": error_details}), res.status_code

    data = res.json()

    user = {
        "username": data["display_name"],
        "email": data["email"],
        "followers": data["followers"]['total'],
        "image": data["images"][0] if data["images"] else "",
        "country": data["country"]
    }

    return jsonify(user)


def exchange_code_for_token(code):
    url = "https://accounts.spotify.com/api/token"
    auth_str = f"{client_id}:{client_secret}"
    auth_b64 = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")

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


def get_user_top_tracks(access_token, time_range="medium_term"):
    url = f"https://api.spotify.com/v1/me/top/tracks?limit=50&time_range={time_range}"
    headers = {"Authorization": f"Bearer {access_token}"}
    res = requests.get(url, headers=headers)
    if res.status_code != 200:
        print("Top tracks error:", res.status_code, res.text)
        return None

    data = res.json()
    tracks = [{
        "name": item["name"],
        "artists": [artist['name'] for artist in item['artists']],
        "albumImage": item["album"]["images"][0]["url"] if item["album"]["images"] else "",
        "album": item["album"]["name"]  # Added album name
    } for item in data.get("items", [])]
    return tracks

def get_user_top_artists(access_token, time_range="medium_term"):
    url = f"https://api.spotify.com/v1/me/top/artists?limit=50&time_range={time_range}"
    headers = {"Authorization": f"Bearer {access_token}"}
    res = requests.get(url, headers=headers)
    if res.status_code != 200:
        print("Top artists error:", res.status_code, res.text)
        return None

    data = res.json()
    artists = [{
        "name": item["name"],
        "genres": item.get('genres', []),
        "image": item["images"][0]["url"] if item["images"] else "",
        "followers": item["followers"]["total"]  # Added followers count
    } for item in data.get("items", [])]
    return artists

def search_spotify(access_token, query, search_type, limit):
    # URL encode the query
    encoded_query = urllib.parse.quote(query)
    url = f"https://api.spotify.com/v1/search?q={encoded_query}&type={search_type}&limit={limit}"

    headers = {"Authorization": f"Bearer {access_token}"}
    res = requests.get(url, headers=headers)

    if res.status_code != 200:
        print("Search error:", res.status_code, res.text)
        return None
    data = res.json()

    # Format the response to match our expectations on the front end
    formatted_results = {}

    # Format artists
    if "artists" in data and data["artists"]["items"]:
        formatted_results["artists"] = [{
            "id": item["id"],
            "name": item["name"],
            "genres": item.get("genres", []),
            "image": item["images"][0]["url"] if item["images"] else "",
            "followers": item["followers"]["total"],
            "popularity": item["popularity"]
        } for item in data["artists"]["items"]]
    
    # Format albums
    if "albums" in data and data["albums"]["items"]:
        formatted_results["albums"] = [{
            "id": item["id"],
            "name": item["name"],
            "artists": [artist["name"] for artist in item["artists"]],
            "image": item["images"][0]["url"] if item["images"] else "",
            "release_date": item["release_date"],
            "total_tracks": item["total_tracks"],
            "album_type": item["album_type"]
        } for item in data["albums"]["items"]]

    # Format tracks
    if "tracks" in data and data["tracks"]["items"]:
        formatted_results["tracks"] = [{
            "id": item["id"],
            "name": item["name"],
            "artists": [artist["name"] for artist in item["artists"]],
            "album": item["album"]["name"],
            "albumImage": item["album"]["images"][0]["url"] if item["album"]["images"] else "",
            "duration_ms": item["duration_ms"],
            "explicit": item["explicit"],
            "preview__url": item.get("preview_url")
        } for item in data["tracks"]["items"]]
    
    print(formatted_results)

    return formatted_results

if __name__ == "__main__":
    app.run(debug=True)

