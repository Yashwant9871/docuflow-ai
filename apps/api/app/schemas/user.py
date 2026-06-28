from pydantic import BaseModel, ConfigDict
import uuid

class UserRead(BaseModel):
    id: str
    full_name: str
    email: str
    roles: list[str]
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
