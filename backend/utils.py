
import socket
import ipaddress
import re
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
import io
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors

ADMIN_EMAIL = "admin@ehr.com"
TRUSTED_NETWORK = ipaddress.ip_network("192.168.1.0/24")
TRUST_THRESHOLD = 40

EMAIL_SENDER = "medtrustai@gmail.com"
EMAIL_PASSWORD = "eghm lxdy nwfn dily"
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

def get_client_ip_from_request(request):
    ip = request.remote_addr or "0.0.0.0"

    xff = request.headers.get("X-Forwarded-For")
    if xff:

        ip = xff.split(",")[0].strip()
    if ip.startswith("127.") or ip == "0.0.0.0":
        try:
            hostname = socket.gethostname()
            ip = socket.gethostbyname(hostname)
        except Exception:
            pass
    return ip

def is_ip_in_network(ip):
    try:
        addr = ipaddress.ip_address(ip)
        return addr in TRUSTED_NETWORK
    except Exception:
        return False

def send_otp_email(email, otp, name):
    try:
        if not email or "@" not in email:
            return False
        subject = "🔐 Verify your login - MedTrust AI"

        current_year = datetime.utcnow().year
        body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Login Verification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f4f7fa; color: #333333;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f7fa; padding: 40px 0;">
                <tr>
                    <td align="center">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
                            <tr>
                                <td style="padding: 30px 40px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); text-align: center;">
                                    <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #ffffff; letter-spacing: 1px;">MEDTRUST AI</h1>
                                    <p style="margin: 5px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">Secure Health Records</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px 40px;">
                                    <p style="margin: 0 0 16px 0; font-size: 16px; color: #334155;">Hi <strong>{name}</strong>,</p>
                                    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #475569;">
                                        A request to log in to your account was received. Use the code below to securely sign in.
                                    </p>
                                    <div style="background-color: #f0fdf4; border: 1px dashed #86efac; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; color: #15803d; letter-spacing: 6px; display: block;">{otp}</span>
                                    </div>
                                    <p style="margin: 0; font-size: 14px; color: #64748b; text-align: center;">
                                        This code expires in <strong>3 minutes</strong> for your security.
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="background-color: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;">
                                        If you didn't request this code, you can safely ignore this email.
                                    </p>
                                    <p style="margin: 0; font-size: 12px; color: #cbd5e1;">
                                        &copy; {current_year} MedTrust AI. Use responsibly.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    Returns BytesIO with professional medical report PDF.
    Uses ReportLab with professional styling.