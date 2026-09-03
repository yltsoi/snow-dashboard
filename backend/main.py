import json
import re
import subprocess

from collections import Counter
from datetime import datetime, timedelta
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from mock_data import CHANGES, CHANGES_BY_NUMBER, BASE_DATE
try:
    from .mock_data import CHANGES, CHANGES_BY_NUMBER, BASE_DATE
except ImportError:
    # fallback for tunning this file directly without package context
    from mock_data import CHANGES, CHANGES_BY_NUMBER, BASE_DATE

app = FastAPI(title="ServiceNow Change Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

OPEN_STATES = {"New", "Assess", "Authorize", "Scheduled", "Implement", "Review"}
LOG_FILE = Path( "/tmp/frontend-actions.log")


class LogEntry(BaseModel):
    level: str = "INFO"
    message: str
    context: dict = {}

@app.post("/api/log")
def frontend_log(entry: LogEntry):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ctx = f" {entry.context}" if entry.context else ""
    line = f"[{ts}] [{entry.level.upper()}]{entry.message}{ctx}\n"
    with LOG_FILE.open("a") as f:
        f.write(line)
    return {"ok": True}



@app.get("/api/changes")
def list_changes(
    state: str = Query(None),
    risk: str = Query(None),
    search: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    results = CHANGES
    if state:
        results = [ c for c in results if c["state"].lower() == state.lower()]
    if risk:
        results = [c for c in results if c["risk"].lower() == risk.lower()]   
    if search:
        q = search.lower()
        results = [
            c for c in results
            if q in c["number"].lower() or q in c["short_description"].lower()
        ]    
    total = len(results)
    start = (page - 1) * page_size
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "data": results[start: start + page_size],
    }

@app.get("/api/changes/{number}")
def get_change(number: str):
    change = CHANGES_BY_NUMBER.get(number.upper())
    if not change:
        raise HTTPException(status_code=404, detail="Change not found")
    return change

@app.get("/api/stats/summary")
def summary():
    total = len(CHANGES)
    open_count = sum( 1 for c in CHANGES if c["state"] in OPEN_STATES)
    high_risk = sum( 1 for c in CHANGES if c["risk"] == "High")
    upcoming = sum(
        1 for c in CHANGES
        if c["state"] in { "Scheduled", "Authorized"}
        and c.get("start_date")
        and datetime.fromisoformat(c["start_date"]) > BASE_DATE
    )
    return {"total": total, "open": open_count, "high_risk": high_risk, "upcoming": upcoming }

@app.get("/api/stats/volume")
def volume(days: int = Query(30, ge=1, le=90)):
    cutoff = BASE_DATE - timedelta(days=days)
    day_counts: Counter = Counter()

    print( f"CHANGES: {len(CHANGES)}")
    for c in CHANGES:
        opened = datetime.fromisoformat(c["opened_at"])
        if opened >= cutoff:
            day_counts[opened.strftime("%Y-%m-%d")] += 1

    result = []
    for i in range(days):
        day = cutoff + timedelta(days= i + 1)
        day_str = day.strftime("%Y-%m-%d")
        result.append({"date": day_str, "count": day_counts.get(day_str, 0)})
    return result

@app.get("/api/stats/by-status")
def by_status():
    counts = Counter(c["state"] for c in CHANGES )
    return [{"state": k, "count": v} for k, v in counts.most_common()]

@app.get("/api/stats/by-risk")
def by_risk():
    counts = Counter(c["risk"] for c in CHANGES )
    return [{"risk": k, "count": v} for k, v in counts.most_common()]

SKILLS = [
    { "id": "check_date_completeness", "name": "Date Completeness"},
    { "id": "check_implementor_assignment", "name": "Implementor Assignment"},
]

def _check_date_completeness(start_date: str, end_date: str) -> dict:
    s, e = start_date.strip(), end_date.strip()
    missing = [name for name, val in [("start_date", s), ("end_date", e)] if not val]
    if not missing:
        return {
                "passed": True, 
                "finding": "Both start_date and end_date are present",
                "recommendation": ""
                }
    fields = " and ".join(missing)
    plural = "are" if len(missing) > 1 else "is"
    return {
        "passed": False,
        "finding": f"{fields} {plural} missing.",
        "recommendation": f"Set {fields} before authorising the change"
    }

def _check_implementor(assigned_to: str) -> dict:
    name = assigned_to.strip()
    if not name:
        return {"passed": False,
                "finding": "Assign a named implementor before scheduling"}
    return 


@app.post("/api/changes/{number}/assess")
def assess_change(number: str):

    skills = [
        {"id": "check_date_completeness", "name": "Date Completeness" },
        {"id": "check_implementor_assignment", "name": "Implementator Assignment" },
    ]

    overall = "FAIL"
    summary = "PASS"

    return {"skills": skills,  "overall": overall , "summary": summary}


'''
@app.post("/api/changes/{number}/assess")
def assess_change(number: str):
    change = CHANGES_BY_NUMBER.get(number.upper())
    if not change:
        raise HTTPException(status_code=404, detail="Change not found")
    
    skills = [
        {"id": "check_date_completeness", "name": "Date Completeness",
         **_check_date_completeness(change.get("start_date", ""), change.get("end_date", ""))},
        {"id": "check_implementor_assignment", "name": "Implementator Assignment", 
        **_check_implementor(change.get("assigned_to", ""))},
    ]
    overall = "PASS" if all(s["passed"] for s in skills ) else  "FAIL"

    context = json.dumps({
        "change_number": number.upper(),
        "change" : {k: change.get(k) for k in
                    ("short_description", "state", "risk", "assigned_to",
                      "start_date", "end_date", "opened_at")},
        "tasks"  : change.get("tasks", []),
        "checks" : skills,
        "overall": overall,
        
    }, indent=2)

    prompt = (
        "You are a ServiceNow Change Management quality assessor. \n\n"
        f"Here are the automated check results for change {number.upper()}:\n\n"
        f"{context}\n\n"
        "Write a concise 1-3 sentence plain-English summary suitable for a dashboard."
        "Focus on any failures and what the Implementor should do next"
        "Reply with ONLY the summary text - no JSON, no markdown"
    )

    summary = f"Overall result: {overall}."
    try:
        proc = subprocess.run(
            ["/usr/local/bin/claude" , "-p", prompt],
            capture_output=True, text=True, timeout=60,
        )
        if proc.returncode == 0 and proc.stdout.strip():
            summary = proc.stdout.strip()
    except subprocess.TimeoutExpired:
        pass

    return {"skills": skills, "overall": overall, "summary": summary}
'''




# Serve React build - must be restister all /api/routes
STATIC_DIR = Path(__file__).parent.parent / "frontend" / "dist"

if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name = "assets")
    
    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        return FileResponse(STATIC_DIR / "index.html")