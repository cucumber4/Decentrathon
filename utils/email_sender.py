import smtplib
from email.mime.text import MIMEText

SMTP_SERVER = "smtp.mailgun.org"  # адрес вашего SMTP-сервера
SMTP_PORT = 587  # порт, например, 587 для TLS
SMTP_USER = "postmaster@sandbox23f8c85e30af44caa4967c81a2d7bdea.mailgun.org"  # ваш email
SMTP_PASSWORD = "ee613421a651256cd9f5ff9e52bc33a3-ac3d5f74-f0ea5080"  # пароль от email


def send_verification_email(recipient_email: str, code: str):
    subject = "Ваш код подтверждения регистрации"
    body = f"Ваш код подтверждения: {code}"
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = recipient_email

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)


send_verification_email('gogoreferenc@gmail.com', '546532')
