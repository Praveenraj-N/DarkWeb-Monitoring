# backend/app/crawler.py
import requests
from bs4 import BeautifulSoup
from .schemas import SampleCreate
from . import crud
from .alerts import send_telegram_alert

import os

TOR_SOCKS = os.getenv("TOR_SOCKS", "socks5h://127.0.0.1:9050")
USE_TOR = os.getenv("USE_TOR", "false").lower() == "true"

session = requests.Session()
if USE_TOR:
    session.proxies.update({
        "http": TOR_SOCKS,
        "https": TOR_SOCKS,
    })

HEADERS = {"User-Agent": "DarkwebMonitorBot/2.0 (+https://github.com/yourname)"}

# Define your sensitive keywords
KEYWORDS = [
    "password", "leak", "ssn", "credit card", "cvv", "credentials",
    "account", "bank", "exploit", "ransomware", "database dump"
]

def fetch_url(url: str, timeout=30):
    try:
        r = session.get(url, headers=HEADERS, timeout=timeout)
        r.raise_for_status()
        return r.text
    except Exception as e:
        print("fetch error", e)
        return None

def parse_and_store(url: str, source: str, db):
    html = fetch_url(url)
    if not html:
        return None

    soup = BeautifulSoup(html, "html.parser")
    title = soup.title.string if soup.title else url
    text = soup.get_text(separator=" ", strip=True)

    # Store result
    sample = SampleCreate(
        source=source,
        url=url,
        title=title[:250],
        content=text[:30000],
        extra_metadata={"length": len(text)},
    )
    obj = crud.create_sample(db, sample)

    # Check for keyword matches
    matched = [k for k in KEYWORDS if k.lower() in text.lower()]
    if matched:
        alert_message = (
            f"🚨 <b>Keyword(s) found:</b> {', '.join(matched)}\n"
            f"<b>URL:</b> {url}\n"
            f"<b>Title:</b> {title}"
        )
        send_telegram_alert(alert_message)
        print(f"⚠ Alert triggered for {url}: {matched}")

    return obj
