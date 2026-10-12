import requests

from config.api_config import API_URL, API_KEY


HEADERS = {
    "X-API-Key": API_KEY
}


def get(endpoint):
    response = requests.get(
        f"{API_URL}{endpoint}",
        headers=HEADERS
    )
    response.raise_for_status()
    return response.json()


def post(endpoint, data):
    response = requests.post(
        f"{API_URL}{endpoint}",
        headers=HEADERS,
        json=data
    )
    response.raise_for_status()
    return response.json()


def put(endpoint, data):
    response = requests.put(
        f"{API_URL}{endpoint}",
        headers=HEADERS,
        json=data
    )
    response.raise_for_status()
    return response.json()


def delete(endpoint):
    response = requests.delete(
        f"{API_URL}{endpoint}",
        headers=HEADERS
    )
    response.raise_for_status()
    return response.json()