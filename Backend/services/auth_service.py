import os
import json
import hmac
import hashlib
import base64
import time

SECRET_KEY = os.getenv("JWT_SECRET", "enterprise-analytics-secret-key-19385")
DB_FILE = os.path.join(os.path.dirname(__file__), "users.json")

def _load_users() -> dict:
    if not os.path.exists(DB_FILE):
        return {}
    try:
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    except:
        return {}

def _save_users(users: dict):
    try:
        with open(DB_FILE, 'w') as f:
            json.dump(users, f, indent=2)
    except Exception as e:
        print(f"Error saving user database: {e}")

# Password Cryptography
def hash_password(password: str) -> str:
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return f"{base64.b64encode(salt).decode('utf-8')}:{base64.b64encode(key).decode('utf-8')}"

def verify_password(password: str, hashed: str) -> bool:
    try:
        salt_b64, key_b64 = hashed.split(":")
        salt = base64.b64decode(salt_b64)
        key = base64.b64decode(key_b64)
        new_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        return hmac.compare_digest(key, new_key)
    except:
        return False

# Base64url utilities
def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).replace(b'=', b'').decode('utf-8')

def base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)

# Cryptographically-signed JWT Engine (HS256)
def create_jwt(payload: dict, expires_in_seconds: int = 86400) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64url_encode(json.dumps(header).encode('utf-8'))
    
    # Inject expiration
    full_payload = payload.copy()
    full_payload["exp"] = int(time.time()) + expires_in_seconds
    payload_b64 = base64url_encode(json.dumps(full_payload).encode('utf-8'))
    
    signature_base = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(SECRET_KEY.encode('utf-8'), signature_base, hashlib.sha256).digest()
    signature_b64 = base64url_encode(signature)
    
    return f"{header_b64}.{payload_b64}.{signature_b64}"

def decode_jwt(token: str) -> dict:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, signature_b64 = parts
        
        signature_base = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_signature = hmac.new(SECRET_KEY.encode('utf-8'), signature_base, hashlib.sha256).digest()
        expected_signature_b64 = base64url_encode(expected_signature)
        
        if not hmac.compare_digest(signature_b64.encode('utf-8'), expected_signature_b64.encode('utf-8')):
            return None
            
        payload = json.loads(base64url_decode(payload_b64).decode('utf-8'))
        if payload.get("exp", 0) < time.time():
            return None # Expired session
            
        return payload
    except Exception as e:
        print(f"Token decoding error: {e}")
        return None

# Public Services
def register_user(username: str, email: str, password: str) -> dict:
    users = _load_users()
    clean_username = username.strip().lower()
    
    if not clean_username or not password:
        return {"success": False, "message": "Username and password are required."}
        
    if clean_username in users:
        return {"success": False, "message": "Username is already registered."}
        
    users[clean_username] = {
        "username": username,
        "email": email,
        "password": hash_password(password),
        "created_at": int(time.time())
    }
    _save_users(users)
    return {"success": True, "message": "User registered successfully."}

def authenticate_user(username: str, password: str) -> dict:
    users = _load_users()
    clean_username = username.strip().lower()
    
    if clean_username not in users:
        return {"success": False, "message": "Invalid username or password."}
        
    user_record = users[clean_username]
    if not verify_password(password, user_record["password"]):
        return {"success": False, "message": "Invalid username or password."}
        
    # Generate token
    token_payload = {
        "username": user_record["username"],
        "email": user_record["email"]
    }
    token = create_jwt(token_payload)
    
    return {
        "success": True,
        "token": token,
        "user": {
            "username": user_record["username"],
            "email": user_record["email"]
        }
    }
