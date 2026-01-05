import os
import requests
from dotenv import load_dotenv

# ✅ Load .env properly
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

def send_telegram_alert(message: str):
    """Send formatted Telegram alert message."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print(f"[WARN] Telegram bot token or chat ID missing in .env")
        print(f"[DEBUG] BOT_TOKEN={TELEGRAM_BOT_TOKEN}, CHAT_ID={TELEGRAM_CHAT_ID}")
        return False

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "HTML"
    }

    try:
        r = requests.post(url, json=payload)
        if r.status_code == 200:
            print("[TELEGRAM] ✅ Message sent successfully.")
            return True
        else:
            print(f"[TELEGRAM] ❌ Failed to send ({r.status_code}): {r.text}")
    except Exception as e:
        print(f"[TELEGRAM] ❌ Error: {e}")
    return False
