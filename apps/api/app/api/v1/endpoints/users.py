from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.core.rbac import require_roles
from app.models.user import User
from app.schemas.user import UserRead
from app.schemas.auth import UserInToken

router = APIRouter()

@router.get("/me", response_model=UserInToken)
def get_me(current_user: User = Depends(get_current_user)):
    roles = [r.name for r in current_user.roles]
    return UserInToken(
        id=str(current_user.id),
        full_name=current_user.full_name,
        email=current_user.email,
        roles=roles
    )

@router.get("/", response_model=list[UserRead])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN"))
):
    users = db.query(User).all()
    user_schemas = []
    for u in users:
        roles = [r.name for r in u.roles]
        user_schemas.append(
            UserRead(
                id=str(u.id),
                full_name=u.full_name,
                email=u.email,
                roles=roles,
                is_active=u.is_active
            )
        )
    return user_schemas
