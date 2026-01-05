# backend/app/tasks.py

from apscheduler.schedulers.background import BackgroundScheduler
from .crawler import parse_and_store
from .database import SessionLocal
from .alerts import send_telegram_alert
from . import crud

# Initialize scheduler
scheduler = BackgroundScheduler()

# Example targets (you can add more dynamically later)
SCHEDULED_TARGETS = [
    {'url': 'https://example.com', 'source': 'manual'},
    {'url': 'https://pastebin.com/raw/example', 'source': 'paste'},
]

# Sensitive keywords to detect
KEYWORDS = [
    'password', 'credit card', 'leak', 'ssn', 'credentials',
    'bank', 'exploit', 'ransomware', 'private key', 'data breach'
]


def run_scan_task(target: dict, db):
    """Runs a single scan task for one target and triggers alerts if needed."""
    try:
        print(f"🔍 Scanning target: {target['url']} ({target.get('source', 'unknown')})")

        obj = parse_and_store(target['url'], target.get('source', 'unknown'), db)
        if not obj:
            print(f"[WARN] No data returned for {target['url']}")
            return

        # Convert content to lowercase for search
        content_lower = (obj.content or "").lower()

        # Keyword matching
        matched = [k for k in KEYWORDS if k in content_lower]

        if matched:
            # Update the database entry (optional)
            try:
                crud.flag_sample(db, obj.id, True)
            except Exception:
                pass  # skip if crud.flag_sample doesn't exist yet

            # Create and send Telegram alert
            alert_msg = (
                f"🚨 <b>Alert:</b> Sensitive keywords found!\n"
                f"<b>Keywords:</b> {', '.join(matched)}\n"
                f"<b>URL:</b> {obj.url}\n"
                f"<b>Source:</b> {target.get('source', 'unknown').title()}"
            )
            send_telegram_alert(alert_msg)
            print(f"[ALERT] Telegram alert sent for {obj.url}")

        else:
            print(f"[OK] No sensitive data found at {obj.url}")

    except Exception as e:
        print(f"[ERROR] Task failed for {target.get('url')}: {e}")


def scheduled_job():
    """Runs periodic scanning job for all scheduled targets."""
    db = SessionLocal()
    try:
        for target in SCHEDULED_TARGETS:
            run_scan_task(target, db)
    finally:
        db.close()


def start_scheduler():
    """Starts the background scheduler to periodically scan."""
    scheduler.add_job(
        scheduled_job,
        'interval',
        minutes=10,
        id='scan_job',
        replace_existing=True
    )
    scheduler.start()
    print("✅ Scheduler started: scanning every 10 minutes.")
