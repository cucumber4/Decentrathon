from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer
from controllers.registration_router import router as register_router
from controllers.auth_router import router as auth_router
from controllers.admin_router import router as admin_router
from controllers.poll_router import router as poll_router
from controllers.vote_router import router as vote_router

app = FastAPI()

# Настраиваем OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/user/login")

# Подключаем маршруты
app.include_router(register_router, prefix="/user", tags=["User"])
app.include_router(auth_router, prefix="/user", tags=["Auth"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])
app.include_router(poll_router, prefix="/polls", tags=["Polls"])
app.include_router(vote_router, prefix="/vote", tags=["Votes"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
