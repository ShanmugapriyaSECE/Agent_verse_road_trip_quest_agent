import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("OPENWEATHER_API_KEY")

def test_weather(city="Munnar"):
    if not API_KEY:
        print("Error: OPENWEATHER_API_KEY is not set in your .env file.")
        return

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {"q": city, "appid": API_KEY, "units": "metric"}
    
    try:
        response = requests.get(url, params=params, timeout=30)
        print("Status code:", response.status_code)
        data = response.json()
        print("Response:", data)

        if response.status_code == 401:
            print("\n--- Troubleshooting 401 Unauthorized ---")
            print("1. If you just created this API key on OpenWeatherMap, it can take 10 to 60 minutes to activate.")
            print("2. Verify that your OPENWEATHER_API_KEY in .env matches the key from https://home.openweathermap.org/api_keys")
            print("3. Ensure your OpenWeatherMap account email has been verified.")
    except requests.RequestException as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_weather()