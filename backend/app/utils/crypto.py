from cryptography.fernet import Fernet
from app.config import settings

# Initialize cipher suite using the encryption key from config
cipher_suite = Fernet(settings.ENCRYPTION_KEY.encode())

def encrypt_token(token: str) -> str:
    """
    Encrypts a plaintext token string securely before storing in the database.
    """
    if not token:
        return token
    return cipher_suite.encrypt(token.encode()).decode()

def decrypt_token(encrypted_token: str) -> str:
    """
    Decrypts an encrypted token string retrieved from the database back to plaintext.
    """
    if not encrypted_token:
        return encrypted_token
    return cipher_suite.decrypt(encrypted_token.encode()).decode()
