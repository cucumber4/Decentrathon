from fastapi import APIRouter, Depends
from utils.dependencies import is_admin

router = APIRouter()


@router.get("/admin/dashboard")
def admin_dashboard(user: dict = Depends(is_admin)):
    return {"message": "Добро пожаловать в панель администратора!"}
