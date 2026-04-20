import uvicorn

if __name__ == "__main__":
    try:
        from app.main import app
        print("Imports successful!")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error starting app: {e}")
