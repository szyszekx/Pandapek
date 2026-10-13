import os
import re
from datetime import datetime
import requests
from flask import Flask, redirect, render_template_string, request, session

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "super-tajny-klucz-dev")

# --- KONFIGURACJA ---
STEAM_API_KEY = os.environ.get("STEAM_API_KEY", "5BE45F5BF9DB499F75FCB9DDB800439D")  # Wpisz swój klucz ze Steam
FASTAPI_BACKEND_URL = os.environ.get(
    "FASTAPI_BACKEND_URL",
    "http://localhost:8000"
)
FASTAPI_API_KEY = os.environ.get(
    "FASTAPI_API_KEY",
    "hbQ-nPTsNHJmrGMS_1sf78Qtj7JjimX5x6pxidtVGXA"
)

STEAM_OPENID_URL = "https://steamcommunity.com/openid/login"
PLATFORM_STEAM_ID = 1  # ID platformy Steam w bazie FastAPI

PLATFORM_STEAM_ID = 1


def clean_html(text: str) -> str:
    """Usuwa znaczniki HTML (np. <br>, <b>) z opisów gier."""
    if not text:
        return ""
    return re.sub(r"<.*?>", "", text).strip()


def fetch_steam_store_details(appid: int) -> dict:
    """Pobiera pełne, prawdziwe dane ze Sklepu Steam w języku polskim."""
    url = f"https://store.steampowered.com/api/appdetails?appids={appid}&l=polish"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    try:
        res = requests.get(url, headers=headers, timeout=8)
        if res.status_code == 200:
            data = res.json().get(str(appid), {})
            if data.get("success"):
                game_data = data.get("data", {})

                raw_desc = game_data.get("short_description") or game_data.get(
                    "detailed_description", ""
                )
                opis = clean_html(raw_desc)[:250] or "Brak opisu"

                devs = ", ".join(game_data.get("developers", [])) or "Nieznany"
                pubs = ", ".join(game_data.get("publishers", [])) or "Nieznany"

                genres_list = [
                    g.get("description")
                    for g in game_data.get("genres", [])
                    if g.get("description")
                ]
                gatunek = ", ".join(genres_list) if genres_list else "Inne"

                rel_date = (
                    game_data.get("release_date", {}).get("date")
                    or "2026-01-01"
                )

                req_age = game_data.get("required_age", 0)
                kategoria_wiekowa = (
                    f"PEGI {req_age}+" if req_age > 0 else "Brak"
                )

                metacritic = game_data.get("metacritic", {}).get("score", 0)
                srednia_ocen = (
                    round(metacritic / 10.0, 1) if metacritic else 0.0
                )

                return {
                    "Opis": opis,
                    "Producent": devs[:50],
                    "Wydawca": pubs[:50],
                    "gatunek": gatunek[:50],
                    "data_premiery": rel_date[:50],
                    "kategoriaWiekowa": kategoria_wiekowa[:20],
                    "srednia_ocen": srednia_ocen,
                }
    except Exception as e:
        print(f"[!] Błąd pobierania ze Sklepu Steam dla AppID {appid}: {e}")

    return {
        "Opis": "Brak opisu ze Sklepu Steam",
        "Producent": "Steam",
        "Wydawca": "Steam",
        "gatunek": "Inne",
        "data_premiery": "2026-01-01",
        "kategoriaWiekowa": "Brak",
        "srednia_ocen": 0.0,
    }


# --- POMOCNICZE FUNKCJE HTTP ---
def get_headers():
    return {
        "x-api-key": FASTAPI_API_KEY,
        "Content-Type": "application/json"
    }


def api_get(endpoint, params=None):
    try:
        res = requests.get(f"{FASTAPI_BACKEND_URL}{endpoint}", headers=get_headers(), params=params, timeout=10)
        return res.json() if res.status_code == 200 else None
    except requests.RequestException as e:
        print(f"[!] Błąd GET {endpoint}: {e}")
        return None


def api_post(endpoint, data):
    try:
        res = requests.post(f"{FASTAPI_BACKEND_URL}{endpoint}", json=data, headers=get_headers(), timeout=10)
        if res.status_code in (200, 201):
            return res.json()
        print(f"[!] Błąd POST {endpoint} ({res.status_code}): {res.text}")
        return None
    except requests.RequestException as e:
        print(f"[!] Wyjątek POST {endpoint}: {e}")
        return None


# --- GŁÓWNA LOGIKA SYNCHRONIZACJI STEAM ---
def sync_steam_user_and_games(steam_id: str) -> int | None:
    """Synchronizuje użytkownika, powiązanie konta, gry ze Steam oraz bibliotekę."""
    print(f"\n================ ROZPOCZYNANIE SYNCHRONIZACJI STEAM ID: {steam_id} ================")
    target_login = f"{steam_id}"

    # 1. Odnajdź lub utwórz użytkownika w FastAPI
    user_id = None
    all_users = api_get("/api/users") or []
    for u in all_users:
        if u.get("login") == target_login:
            user_id = u.get("id_User") or u.get("id")
            print(f"[+] Odnaleziono istniejącego użytkownika ID: {user_id}")
            break

    if not user_id:
        print("[*] Tworzenie nowego użytkownika w FastAPI...")
        # Obliczamy kolejne ID dla użytkownika
        user_ids = [u.get("id_User") or u.get("id") or 0 for u in all_users]
        next_user_id = (max(user_ids) + 1) if user_ids else 1

        new_user = api_post("/api/users", {
            "id_User": next_user_id,  # Dodano wymagane pole
            "login": target_login,
            "haslo": "STEAM_AUTH_NO_PASSWORD",
            "data_zalozenia": datetime.now().strftime("%Y-%m-%d")
        })
        if new_user:
            user_id = new_user.get("id_User") or new_user.get("id") or next_user_id
            print(f"[+] Utworzono użytkownika ID: {user_id}")

    if not user_id:
        print("[!] KRYTYCZNY BŁĄD: Nie udało się uzyskać user_id z FastAPI.")
        return None

    # 2. Powiąż konto ze Steam
    print("[*] Sprawdzanie powiązania konta...")
    api_post("/api/account-links", {
        "id_User": user_id,
        "id_Platformy": PLATFORM_STEAM_ID,
        "id_zewnetrzne": str(steam_id)
    })

    # 3. Pobierz gry użytkownika z Web API Steam
    if STEAM_API_KEY == "TWOJ_STEAM_API_KEY":
        print("[!] OSTRZEŻENIE: Brak STEAM_API_KEY. Pomijanie pobierania gier ze Steam.")
        return user_id

    print("[*] Pobieranie gier ze Steam API...")
    steam_url = "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/"
    try:
        s_res = requests.get(steam_url, params={
            "key": STEAM_API_KEY,
            "steamid": steam_id,
            "include_appinfo": 1,
            "include_played_free_games": 1,
        }, timeout=10)

        if s_res.status_code != 200:
            print(f"[!] Błąd Steam API: {s_res.status_code}")
            return user_id

        steam_games = s_res.json().get("response", {}).get("games", [])
        print(f"[+] Steam zwrócił {len(steam_games)} gier.")
    except Exception as e:
        print(f"[!] Błąd połączenia ze Steam API: {e}")
        return user_id

    # Ograniczenie dla wydajności (pierwsze 20 gier)
    steam_games = steam_games[:20]

    # 4. Pobierz stan bazy danych
    existing_games = api_get("/api/games") or []
    games_map = {g.get("Nazwa"): (g.get("id_Gra") or g.get("id")) for g in existing_games["items"] if g.get("Nazwa")}

    existing_library = api_get("/api/library") or []
    library_set = {
        (item.get("id_User"), item.get("id_Gra"))
        for item in existing_library
    }

    # Wyznaczanie startowych ID dla gier i biblioteki
    game_ids = [g.get("id_Gra") or g.get("id") or 0 for g in existing_games["items"]]
    next_game_id = (max(game_ids) + 1) if game_ids else 1

    lib_ids = [l.get("id_biblioteki") or l.get("id") or 0 for l in existing_library]
    next_lib_id = (max(lib_ids) + 1) if lib_ids else 1

    # 5. Iteracja i zapis do bazy danych
    added_count = 0
    for g_info in steam_games:
        game_name = g_info.get("name")
        appid = g_info.get("appid")
        if not game_name:
            continue

        # A. Upewnij się, że gra istnieje w tabeli Gry
        game_id = games_map.get(game_name)
        if not game_id:
            print(f"[*] Pobieranie danych ze Steam Store API dla '{game_name}' (AppID: {appid})...")

            # Pobieramy metadane ze sklepu
            details = fetch_steam_store_details(appid) if appid else {}

            created_game = api_post("/api/games", {
                "id_Gra": next_game_id,
                "Nazwa": game_name,
                "Opis": details.get("Opis"),
                "Producent": details.get("Producent"),
                "Wydawca": details.get("Wydawca"),
                "gatunek": details.get("gatunek"),
                "data_premiery": details.get("data_premiery"),
                "kategoriaWiekowa": details.get("kategoriaWiekowa"),
                "srednia_ocen": details.get("srednia_ocen"),
                "app_id": appid
            })
            if created_game:
                game_id = created_game.get("id_Gra") or created_game.get("id") or next_game_id
                games_map[game_name] = game_id
                next_game_id += 1

        # B. Upewnij się, że gra jest w bibliotece użytkownika
        if game_id and (user_id, game_id) not in library_set:
            lib_res = api_post("/api/library", {
                "id_biblioteki": next_lib_id,
                "id_User": user_id,
                "id_Gra": game_id,
                "id_Platformy": PLATFORM_STEAM_ID
            })
            if lib_res:
                library_set.add((user_id, game_id))
                next_lib_id += 1
                added_count += 1

    print(f"================ SYNCHRONIZACJA ZAKOŃCZONA: Dodano {added_count} nowych gier ================\n")
    return user_id


# --- WIDOKI HTML (FLASK) ---
INDEX_HTML = """
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8"><title>Biblioteka Gier</title>
    <style>
        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #1b2838; color: white; margin: 0; }
        .card { background: #171a21; padding: 40px; border-radius: 10px; text-align: center; width: 350px; }
        .steam-btn { display: inline-block; background-color: #2a475e; color: #c6d4df; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 5px; margin-top: 20px; }
        .steam-btn:hover { background-color: #66c0f4; color: #fff; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Menedżer Biblioteki</h1>
        <p>Zaloguj się przez Steam, aby zsynchronizować grę z bazą danych.</p>
        <a href="/login/steam" class="steam-btn">🟢 Zaloguj się przez Steam</a>
    </div>
</body>
</html>
"""

GAMES_HTML = """
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8"><title>Moja Biblioteka</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #1b2838; color: white; padding: 30px; margin: 0; }
        .header { display: flex; justify-content: space-between; align-items: center; background: #171a21; padding: 15px 30px; border-radius: 8px; margin-bottom: 20px; }
        .logout-btn { color: #c6d4df; text-decoration: none; background: #2a475e; padding: 8px 15px; border-radius: 4px; }
        .logout-btn:hover { background: #c23b22; color: #fff; }
        ul { list-style-type: none; padding: 0; }
        li { background: #2a475e; margin: 8px 0; padding: 12px 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Zalogowany Użytkownik ID: {{ user_id }}</h2>
        <a href="/logout" class="logout-btn">Wyloguj się</a>
    </div>
    <h3>Liczba gier w Twojej bibliotece: {{ user_games|length }}</h3>
    <ul>
        {% for item in user_games %}
            <li>Wpis Biblioteki ID: {{ item.id_biblioteki or item.id }} | ID Gry: {{ item.id_Gra }} | Platforma Steam (ID: {{ item.id_Platformy }})</li>
        {% else %}
            <li>Brak gier w bibliotece.</li>
        {% endfor %}
    </ul>
</body>
</html>
"""


# --- TRASY FLASK ---
@app.route("/")
def index():
    if "user_id" in session:
        return redirect("/games")
    return render_template_string(INDEX_HTML)


@app.route("/login/steam")
def login_steam():
    realm = request.host_url
    return_to = f"{realm}login/steam/callback"

    params = {
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.mode": "checkid_setup",
        "openid.return_to": return_to,
        "openid.realm": realm,
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    }

    return redirect(f"{STEAM_OPENID_URL}?{requests.compat.urlencode(params)}")


@app.route("/login/steam/callback")
def steam_callback():
    params = request.args.to_dict()

    if params.get("openid.mode") != "id_res":
        return "Błąd logowania Steam", 400

    verify_params = params.copy()
    verify_params["openid.mode"] = "check_authentication"

    res = requests.post(STEAM_OPENID_URL, data=verify_params, timeout=10)
    if "is_valid:true" not in res.text:
        return "Nieprawidłowa odpowiedź OpenID", 401

    claimed_id = params.get("openid.claimed_id", "")
    match = re.search(r"/id/(\d+)", claimed_id)
    if not match:
        return "Nie udało się odczytać Steam ID", 400

    steam_id = match.group(1)

    # Wywołanie nowej, bezpiecznej synchronizacji
    user_id = sync_steam_user_and_games(steam_id)

    if not user_id:
        return "Błąd podczas tworzenia/pobierania użytkownika w bazie danych.", 500

    session["user_id"] = user_id
    session["steam_id"] = steam_id

    return redirect("/games")


@app.route("/games")
def games():
    user_id = session.get("user_id")
    if not user_id:
        return redirect("/")

    all_library = api_get("/api/library") or []
    user_games = [g for g in all_library if g.get("id_User") == user_id]

    return render_template_string(GAMES_HTML, user_id=user_id, user_games=user_games)


@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")


if __name__ == "__main__":
    app.run(port=5000, debug=True)