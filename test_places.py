import os
import requests
from dotenv import load_dotenv

load_dotenv()
GEOAPIFY_API_KEY = os.getenv("GEOAPIFY_API_KEY")


def find_geoapify_pois(lat, lon, radius_m=20000, category="tourism.attraction,tourism.sights,natural.water,leisure.park.nature_reserve"):
    """
    Uses Geoapify Places API - good for general attractions, sights, and (later) food/restaurants.
    Geoapify has no dedicated 'waterfall' category, so this is broadened to catch attractions/sights too.
    """
    url = "https://api.geoapify.com/v2/places"
    params = {
        "categories": category,
        "filter": f"circle:{lon},{lat},{radius_m}",
        "limit": 20,
        "apiKey": GEOAPIFY_API_KEY
    }
    response = requests.get(url, params=params, timeout=30)
    response.raise_for_status()
    return response.json()


def find_overpass_waterfalls(lat, lon, radius_m=15000):
    """
    Uses Overpass API (raw OpenStreetMap data) - node search for waterway=waterfall.
    Lightweight node query runs in < 2 seconds without timing out.
    """
    query = f"""
    [out:json][timeout:15];
    node["waterway"="waterfall"](around:{radius_m},{lat},{lon});
    out body;
    """
    headers = {
        "User-Agent": "AgentVerseRoadTrip/1.0 (https://github.com/ShanmugapriyaSECE/road_trip_quest_agent)"
    }
    
    endpoints = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.private.coffee/api/interpreter",
    ]
    
    last_error = None
    for endpoint in endpoints:
        try:
            response = requests.get(
                endpoint,
                params={"data": query},
                headers=headers,
                timeout=15
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            last_error = e
            print(f"Notice: Overpass endpoint {endpoint} failed ({e}), trying mirror...")
    
    print(f"Warning: All Overpass API endpoints failed. Last error: {last_error}")
    return {"elements": []}


def print_geoapify_results(data):
    print(f"\n=== Geoapify: {len(data['features'])} attractions/sights found ===")
    if not data["features"]:
        print("  (none found in this radius/category set)")
    for feature in data["features"]:
        props = feature["properties"]
        name = props.get("name", "Unnamed")
        address = props.get("formatted", "")
        print(f"- {name} — {address}")


def print_overpass_results(data):
    elements = data.get("elements", [])
    print(f"\n=== Overpass: {len(elements)} waterfalls found ===")
    if not elements:
        print("  (none found in this radius)")
    for el in elements:
        name = el.get("tags", {}).get("name", "Unnamed")
        lat = el.get("lat") or el.get("center", {}).get("lat")
        lon = el.get("lon") or el.get("center", {}).get("lon")
        print(f"- {name} @ ({lat}, {lon})")


if __name__ == "__main__":
    # Munnar coordinates
    MUNNAR_LAT = 10.0889
    MUNNAR_LON = 77.0595

    if not GEOAPIFY_API_KEY:
        print("WARNING: GEOAPIFY_API_KEY is missing from .env — skipping Geoapify test.")
    else:
        geoapify_data = find_geoapify_pois(MUNNAR_LAT, MUNNAR_LON)
        print_geoapify_results(geoapify_data)

    overpass_data = find_overpass_waterfalls(MUNNAR_LAT, MUNNAR_LON)
    print_overpass_results(overpass_data)