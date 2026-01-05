from dotenv import load_dotenv
import os

# ✅ Ensure .env loads from correct folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, ".env")
load_dotenv(dotenv_path=ENV_PATH)

print("[DEBUG] .env loaded from:", ENV_PATH)
print("[DEBUG] BOT_TOKEN:", os.getenv("TELEGRAM_BOT_TOKEN"))
print("[DEBUG] CHAT_ID:", os.getenv("TELEGRAM_CHAT_ID"))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from .database import SessionLocal, engine, Base
from . import models, crud, tasks, auth  # ✅ Added auth module here
from .alerts import send_telegram_alert
import uvicorn
import random, time
from datetime import datetime

# ✅ Create database tables
Base.metadata.create_all(bind=engine)

# ✅ Initialize FastAPI app first
app = FastAPI(title="Darkweb Monitor API", version="1.0")

# ✅ Add CORS middleware (to allow frontend access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include authentication routes
app.include_router(auth.router)  # <-- Added router connection

# ✅ Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ✅ Start the background scheduler (crawler)
@app.on_event("startup")
async def startup_event():
    tasks.start_scheduler()


# --------------------------------------------------------
# 🔍 Keyword Search Route (frontend integration)
# --------------------------------------------------------
@app.post("/api/search")
def keyword_search(payload: dict, db=Depends(get_db)):
    keyword = payload.get("keyword", "").lower().strip()
    if not keyword:
        return {"error": "No keyword provided"}

    print(f"🔍 Searching for keyword: {keyword}")

    # Example dataset — can later link to crawler/DB
    websites = [
        {"url": "https://example.com", "content": "This is a demo site"},
        {"url": "https://leaktest.com", "content": "User password leaked database"},
        {"url": "https://securebank.com", "content": "Welcome to Secure Bank"},
    ]

    results = []
    found_alerts = []

    for site in websites:
        found = keyword in site["content"].lower()
        result_entry = {
            "url": site["url"],
            "source": "manual",
            "found": found,
            "telegram_status": "",
        }

        # ✅ If keyword is found — send Telegram alert
        if found:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            msg = (
                f"🚨 <b>Keyword Detected!</b>\n"
                f"<b>Keyword:</b> <code>{keyword}</code>\n"
                f"<b>URL:</b> <a href='{site['url']}'>{site['url']}</a>\n"
                f"<b>Detected at:</b> {timestamp}"
            )
            print(f"[DEBUG] Sending Telegram alert: {msg}")
            send_telegram_alert(msg)
            found_alerts.append(site["url"])
            result_entry["telegram_status"] = "🚨 Alert sent"
        else:
            result_entry["telegram_status"] = "✅ No alert"

        results.append(result_entry)
        
    return {
        "keyword": keyword,
        "results": results,
        "alerted_sites": found_alerts,
    }


# --------------------------------------------------------
# 🧠 Darkweb Scan Simulation (with Telegram Alerts)
# --------------------------------------------------------
@app.post("/api/scan")
def start_scan(payload: dict, background_tasks: BackgroundTasks, db=Depends(get_db)):
    """Simulated background darkweb scan with Telegram alerts."""
    url = payload.get("url")
    source = payload.get("source", "manual")

    if not url:
        return {"error": "No URL provided"}

    print(f"🕵 Starting scan for {url} ({source})...")
    background_tasks.add_task(run_fake_analysis, url, source)
    return {"status": "Scan started — analyzing target."}


def run_fake_analysis(url, source):
    """Simulate scanning process with random keyword detections."""
    from app.alerts import send_telegram_alert
    print(f"🔍 Analyzing {url}...")
    time.sleep(3)  # simulate delay

    fake_keywords = ["password", "credit card", "ssn", "data leak"]
    found_keyword = random.choice([None, "password", "credit card", None, None])

    if found_keyword:
        alert = (
            f"🚨 <b>Scan Alert!</b>\n"
            f"<b>Keyword:</b> {found_keyword}\n"
            f"<b>URL:</b> <a href='{url}'>{url}</a>\n"
            f"<b>Source:</b> {source}\n"
            f"<b>Status:</b> Sensitive data found!"
        )
        send_telegram_alert(alert)
        print(f"✅ Telegram alert sent for {url}")
    else:
        print(f"✅ {url} appears safe after scan.")


# --------------------------------------------------------
# 🌐 WebSocket Support for Live Updates
# --------------------------------------------------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for conn in self.active_connections:
            await conn.send_json(message)


manager = ConnectionManager()


@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.post("/api/push")
async def push_update(payload: dict):
    await manager.broadcast(payload)
    return {"ok": True}


# ✅ Run server manually
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
