from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    AGENCY_ADMIN = "agency_admin"
    CLIENT_MANAGER = "client_manager"
    VIEWER = "viewer"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default=UserRole.CLIENT_MANAGER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    client = relationship("Client", back_populates="users")

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    subdomain = Column(String, unique=True, index=True, nullable=True)
    branding = Column(JSON, nullable=True) # {logo: url, primary_color: hex}
    
    # CRM Fields
    industry = Column(String, nullable=True) # e.g. "E-commerce", "Fashion"
    contact_email = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    internal_status = Column(String, default="active") # active, paused, lead
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    users = relationship("User", back_populates="client")
    tokens = relationship("PlatformToken", back_populates="client")
    posts = relationship("Post", back_populates="client")

class PlatformToken(Base):
    __tablename__ = "platform_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    platform = Column(String) # instagram, facebook, linkedin, youtube
    platform_id = Column(String) # e.g. Page ID or Channel ID
    account_name = Column(String, nullable=True) # e.g. "Astra Agency Page"
    
    # Encrypted fields
    access_token = Column(String)
    refresh_token = Column(String, nullable=True)
    
    expires_at = Column(DateTime(timezone=True), nullable=True)
    scopes = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    client = relationship("Client", back_populates="tokens")
