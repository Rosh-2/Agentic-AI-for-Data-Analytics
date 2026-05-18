import os
import sqlite3
import json
import uuid
import time
import urllib.request
import urllib.parse

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()

IS_SUPABASE_ACTIVE = bool(SUPABASE_URL and SUPABASE_KEY)
SQLITE_DB = os.path.join(os.path.dirname(__file__), "database.db")

# Initialize Local SQLite Fallback
def _init_sqlite():
    try:
        conn = sqlite3.connect(SQLITE_DB)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS history (
                id TEXT PRIMARY KEY,
                username TEXT,
                objective TEXT,
                plan TEXT,
                eda TEXT,
                charts TEXT,
                insights TEXT,
                models TEXT,
                agent_logs TEXT,
                report TEXT,
                created_at INTEGER
            )
        """)
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Failed to initialize SQLite: {e}")

_init_sqlite()

# Supabase REST Client
def _supabase_req(method: str, path: str, body: dict = None, filters: dict = None) -> list:
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    if filters:
        url += "?" + urllib.parse.urlencode(filters)
        
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    data = json.dumps(body).encode('utf-8') if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as res:
            return json.loads(res.read().decode('utf-8'))
    except Exception as e:
        print(f"Supabase {method} {path} error: {e}")
        return []

# --- PUBLIC INTERFACE ---

def save_analysis(
    objective: str, 
    plan: dict, 
    eda: dict, 
    charts: dict, 
    insights: str, 
    models: dict, 
    agent_logs: list, 
    report: dict
) -> str:
    analysis_id = str(uuid.uuid4())
    created_at = int(time.time())
    username = "default"
    
    plan_str = json.dumps(plan)
    eda_str = json.dumps(eda)
    charts_str = json.dumps(charts)
    models_str = json.dumps(models)
    agent_logs_str = json.dumps(agent_logs)
    report_str = json.dumps(report)
    
    if IS_SUPABASE_ACTIVE:
        body = {
            "id": analysis_id,
            "username": username,
            "objective": objective,
            "plan": plan_str,
            "eda": eda_str,
            "charts": charts_str,
            "insights": insights,
            "models": models_str,
            "agent_logs": agent_logs_str,
            "report": report_str,
            "created_at": created_at
        }
        _supabase_req("POST", "history", body=body)
    else:
        conn = sqlite3.connect(SQLITE_DB)
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO history (id, username, objective, plan, eda, charts, insights, models, agent_logs, report, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (analysis_id, username, objective, plan_str, eda_str, charts_str, insights, models_str, agent_logs_str, report_str, created_at)
        )
        conn.commit()
        conn.close()
        
    return analysis_id

def get_user_history() -> list:
    username = "default"
    if IS_SUPABASE_ACTIVE:
        res = _supabase_req("GET", "history", filters={"username": f"eq.{username}", "select": "id,objective,created_at"})
        return sorted(res, key=lambda x: x.get("created_at", 0), reverse=True)
    else:
        conn = sqlite3.connect(SQLITE_DB)
        cursor = conn.cursor()
        cursor.execute("SELECT id, objective, created_at FROM history WHERE username = ? ORDER BY created_at DESC", (username,))
        rows = cursor.fetchall()
        conn.close()
        return [{"id": r[0], "objective": r[1], "created_at": r[2]} for r in rows]

def get_analysis(analysis_id: str) -> dict:
    if IS_SUPABASE_ACTIVE:
        res = _supabase_req("GET", "history", filters={"id": f"eq.{analysis_id}"})
        if not res:
            return None
        rec = res[0]
        try:
            return {
                "id": rec["id"],
                "objective": rec["objective"],
                "plan": json.loads(rec["plan"]),
                "eda": json.loads(rec["eda"]),
                "charts": json.loads(rec["charts"]),
                "insights": rec["insights"],
                "models": json.loads(rec["models"]),
                "agent_logs": json.loads(rec["agent_logs"]),
                "report": json.loads(rec["report"]),
                "created_at": rec["created_at"]
            }
        except Exception as e:
            print(f"JSON parsing error on Supabase history record: {e}")
            return None
    else:
        conn = sqlite3.connect(SQLITE_DB)
        cursor = conn.cursor()
        cursor.execute("SELECT id, objective, plan, eda, charts, insights, models, agent_logs, report, created_at FROM history WHERE id = ?", (analysis_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return {
                "id": row[0],
                "objective": row[1],
                "plan": json.loads(row[2]),
                "eda": json.loads(row[3]),
                "charts": json.loads(row[4]),
                "insights": row[5],
                "models": json.loads(row[6]),
                "agent_logs": json.loads(row[7]),
                "report": json.loads(row[8]),
                "created_at": row[9]
            }
        return None

def delete_analysis(analysis_id: str) -> bool:
    username = "default"
    if IS_SUPABASE_ACTIVE:
        res = _supabase_req("DELETE", "history", filters={"id": f"eq.{analysis_id}", "username": f"eq.{username}"})
        return True
    else:
        try:
            conn = sqlite3.connect(SQLITE_DB)
            cursor = conn.cursor()
            cursor.execute("DELETE FROM history WHERE id = ? AND username = ?", (analysis_id, username))
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"SQLite delete history error: {e}")
            return False
