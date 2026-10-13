import os
import re
import requests

from flask import Flask, redirect, request, session, jsonify
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

app.secret_key = os.environ["FLASK_SECRET_KEY"]

STEAM_API_KEY = os.environ["STEAM_API_KEY"]

STEAM_OPENID_URL = "https://steamcommunity.com/openid/login"


@app.route("/")
def home():
    return """
    <h1>My Steam Website</h1>

    <a href="/login/steam">
        <button>Login with Steam</button>
    </a>
    """


@app.route("/login/steam")
def steam_login():

    callback_url = request.host_url.rstrip("/") + "/login/steam/callback"

    params = {
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.mode": "checkid_setup",
        "openid.return_to": callback_url,
        "openid.realm": request.host_url.rstrip("/"),
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    }

    response = requests.Request(
        "GET",
        STEAM_OPENID_URL,
        params=params
    ).prepare()

    return redirect(response.url)


@app.route("/login/steam/callback")
def steam_callback():

    params = request.args.to_dict()

    if params.get("openid.mode") != "id_res":
        return "Steam login failed", 400

    # Verify the response with Steam
    verify_params = params.copy()
    verify_params["openid.mode"] = "check_authentication"

    response = requests.post(
        STEAM_OPENID_URL,
        data=verify_params,
        timeout=10
    )

    if "is_valid:true" not in response.text:
        return "Invalid Steam login", 401

    # Extract SteamID64
    claimed_id = params.get("openid.claimed_id", "")

    match = re.search(r"/id/(\d+)$", claimed_id)

    if not match:
        return "Could not find Steam ID", 400

    steam_id = match.group(1)

    session["steam_id"] = steam_id

    return redirect("/games")

@app.route("/games")
def games():

    steam_id = session.get("steam_id")

    if not steam_id:
        return redirect("/")

    try:
        response = requests.get(
            "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/",
            params={
                "key": STEAM_API_KEY,
                "steamid": steam_id,
                "include_appinfo": 1,
                "include_played_free_games": 1,
            },
            timeout=10
        )

        response.raise_for_status()

        steam_data = response.json()

        payload = {
            "steamid": steam_id,
            "game_count": steam_data.get("response", {}).get("game_count", 0),
            "games": steam_data.get("response", {}).get("games", [])
        }


        return redirect(f"http://localhost:3000/games?steamid={steam_id}")

    except requests.RequestException as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

@app.route("/logout")
def logout():

    session.clear()

    return redirect("/")


if __name__ == "__main__":
    app.run(debug=True)
