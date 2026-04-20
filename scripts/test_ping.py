import httpx
import asyncio

async def test_ping():
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            res = await client.get("http://localhost:8000/")
            print(f"Status Code: {res.status_code}")
            print(f"Response: {res.text}")
    except Exception as e:
        print(f"Error pinging server: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_ping())
