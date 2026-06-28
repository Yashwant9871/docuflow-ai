from pydantic import BaseModel, EmailStr, ConfigDict

class LoginRequest(BaseModel):
    email: str
    password: str

class UserInToken(BaseModel):
    id: str
    full_name: str
    email: str
    roles: list[str]

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserInToken

class RefreshRequest(BaseModel):
    refresh_token: str
