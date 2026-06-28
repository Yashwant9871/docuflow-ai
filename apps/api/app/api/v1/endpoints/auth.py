from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest, UserInToken
from app.services.audit_service import log_action
import uuid

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_req.email.strip().lower()).first()
    if not user or not verify_password(login_req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )

    roles = [r.name for r in user.roles]
    user_data = {
        "id": str(user.id),
        "full_name": user.full_name,
        "email": user.email,
        "roles": roles
    }

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    log_action(db, user.id, "User", str(user.id), "USER_LOGIN", None, "LOGGED_IN")

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserInToken(**user_data)
    )

@router.post("/refresh", response_model=TokenResponse)
def refresh(refresh_req: RefreshRequest, db: Session = Depends(get_db)):
    try:
        payload = decode_token(refresh_req.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        user_id = payload.get("sub")
        if not user_id:
             raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from e

    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    roles = [r.name for r in user.roles]
    user_data = {
        "id": str(user.id),
        "full_name": user.full_name,
        "email": user.email,
        "roles": roles
    }

    access_token = create_access_token(data={"sub": str(user.id)})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        user=UserInToken(**user_data)
    )

@router.get("/me", response_model=UserInToken)
def get_me(current_user: User = Depends(get_current_user)):
    roles = [r.name for r in current_user.roles]
    return UserInToken(
        id=str(current_user.id),
        full_name=current_user.full_name,
        email=current_user.email,
        roles=roles
    )

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Since JWT is stateless, we just log the event
    log_action(db, current_user.id, "User", str(current_user.id), "USER_LOGOUT", "LOGGED_IN", "LOGGED_OUT")
    return {"status": "success", "message": "Successfully logged out"}
