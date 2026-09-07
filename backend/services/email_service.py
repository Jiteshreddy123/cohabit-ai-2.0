import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings
import logging

log = logging.getLogger(__name__)

def send_reset_password_email(to_email: str, reset_token: str):
    """
    Sends a password reset email using the configured SMTP server.
    If SMTP settings are missing, logs the link instead.
    """
    frontend_url = settings.FRONTEND_URL.rstrip('/')
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"

    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        log.warning(f"SMTP credentials missing. Mock email sent to {to_email}. Reset link: {reset_link}")
        print(f"\n[MOCK EMAIL to {to_email}]\nReset your password here: {reset_link}\n")
        return

    subject = "Cohabit-AI Administrator Password Reset"
    
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #14b8a6;">Cohabit-AI</h2>
        <p>Hello,</p>
        <p>We received a request to reset your administrator password.</p>
        <p>Please click the button below to choose a new password. This link will expire in 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_link}" style="background-color: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666; font-size: 14px;">{reset_link}</p>
        <br/>
        <p>If you did not request this, you can safely ignore this email.</p>
      </body>
    </html>
    """

    msg = MIMEMultipart()
    msg['From'] = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(html_content, 'html'))

    try:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        log.info(f"Password reset email sent successfully to {to_email}")
    except Exception as e:
        log.error(f"Failed to send email to {to_email}: {e}")
        raise RuntimeError("Failed to send password reset email. Please contact support.")
