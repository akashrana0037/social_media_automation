from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional, List, Dict, Any

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None

class UserOut(UserBase):
    id: int
    is_active: bool
    client_id: Optional[int] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ClientBase(BaseModel):
    name: str
    subdomain: Optional[str] = None
    branding: Optional[Dict[str, Any]] = None

class ClientCreate(ClientBase):
    pass

class ClientOut(ClientBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None
