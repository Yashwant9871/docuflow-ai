from fastapi import Depends, HTTPException, status
from app.core.deps import get_current_user
from app.models.user import User

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        user_roles = [r.name for r in current_user.roles]
        
        # Admin can access everything
        if "ADMIN" in user_roles:
            return current_user
            
        # Check if user has any of the allowed roles
        for role in self.allowed_roles:
            if role in user_roles:
                return current_user
                
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied: Insufficient role permissions"
        )

def require_roles(*roles: str):
    return RoleChecker(list(roles))
