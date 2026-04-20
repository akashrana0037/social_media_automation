import requests

url = "https://unbiased-sponge-workable.ngrok-free.app/api/clients/"
try:
    res = requests.get(url)
    print(f"Status: {res.status_code}")
    print(res.text)
except Exception as e:
    print(f"Error: {e}")
