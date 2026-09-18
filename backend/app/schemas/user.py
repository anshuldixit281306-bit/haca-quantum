"""
Pydantic schemas for user authentication and user data.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    """Schema used when creating a new user."""

    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    role: str = Field(default="learner", pattern="^(admin|learner)$")


class UserLogin(BaseModel):
    """Schema used for user login."""

    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)
    role: str = Field(default="learner", pattern="^(admin|learner)$")


class UserResponse(BaseModel):
    """Public user information."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    role: str
    created_at: datetime


class Token(BaseModel):
    """JWT authentication response."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Decoded JWT payload."""

    user_id: int | None = None