from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import pandas as pd
import io

from services.chart_service import generate_chart_data
from agents.planner_agent import generate_plan
from executors.workflow_executor import execute_plan
from agents.report_agent import ReportAgent
from reports.pdf_generator import build_pdf_report
from services.auth_service import register_user, authenticate_user, decode_jwt
from services.database_service import save_analysis, get_user_history, get_analysis, delete_analysis

app = FastAPI(title="Agentic AI Analytics API")

# Configure CORS so the frontend can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PDFRequest(BaseModel):
    report: dict
    objective: str

class RegisterRequest(BaseModel):
    username: str
    email: str = ""
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

# Token Validation Dependency
async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    try:
        token_type, token = authorization.split(" ")
        if token_type.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = decode_jwt(token)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")

# --- AUTH ENDPOINTS ---
@app.post("/api/auth/register")
def auth_register(req: RegisterRequest):
    res = register_user(req.username, req.email, req.password)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res

@app.post("/api/auth/login")
def auth_login(req: LoginRequest):
    res = authenticate_user(req.username, req.password)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res

@app.get("/api/auth/me")
def auth_me(user: dict = Depends(get_current_user)):
    return user

# --- HISTORICAL BRIEFINGS ENDPOINTS ---
@app.get("/api/history")
def fetch_history(user: dict = Depends(get_current_user)):
    return get_user_history(user["username"])

@app.get("/api/history/{id}")
def fetch_analysis_detail(id: str, user: dict = Depends(get_current_user)):
    record = get_analysis(id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found.")
    return record

@app.delete("/api/history/{id}")
def remove_analysis_record(id: str, user: dict = Depends(get_current_user)):
    success = delete_analysis(user["username"], id)
    if not success:
        raise HTTPException(status_code=550, detail="Failed to delete history record.")
    return {"success": True}

# --- SECURED ANALYTICS ENDPOINTS ---
@app.post("/api/upload")
async def upload_csv(
    file: UploadFile = File(...), 
    objective: str = Form(None),
    authorization: str = Header(None)
):
    # Verify session JWT and fetch username
    user = await get_current_user(authorization)
    username = user.get("username")
    
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    try:
        # Read the uploaded file into memory
        contents = await file.read()
        
        # Parse the CSV with pandas
        df = pd.read_csv(io.BytesIO(contents))
        
        # 1. Planner Agent: Parse intent and generate execution plan
        plan = generate_plan(objective)
        
        # 2. Workflow Executor: Execute the plan sequentially
        state = execute_plan(plan, df)
        
        # 3. Augment with baseline charts (histograms, bar charts) if EDA details exist
        chart_data = state.get("charts", {})
        if "eda" in state and "details" in state["eda"]:
            base_charts = generate_chart_data(df, state["eda"]["details"])
            # Merge base charts (histograms, bar_charts, missing_values) into state charts
            for k, v in base_charts.items():
                if k not in chart_data:
                    chart_data[k] = v
        state["charts"] = chart_data

        # 4. Report Agent: Synthesize elite executive strategy briefing
        report = ReportAgent.generate_executive_report(state, objective, df)

        # 5. Persistent database entry
        save_analysis(
            username=username,
            objective=objective or "General EDA",
            plan=plan,
            eda=state.get("eda", {}),
            charts=state.get("charts", {}),
            insights=state.get("insights", ""),
            models=state.get("models", {}),
            agent_logs=state.get("agent_logs", []),
            report=report
        )

        # Build final response payload
        return {
            "plan": plan,
            "objective": objective,
            "eda": state.get("eda", {}),
            "charts": state.get("charts", {}),
            "insights": state.get("insights", ""),
            "models": state.get("models", {}),
            "agent_logs": state.get("agent_logs", []),
            "report": report
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/api/download-pdf")
async def download_pdf(req: PDFRequest, authorization: str = Header(None)):
    # Verify session JWT
    await get_current_user(authorization)
    
    try:
        pdf_buffer = build_pdf_report(req.report, req.objective)
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=Executive_Decision_Briefing.pdf"}
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "Welcome to Agentic AI Analytics API. Go to /docs for Swagger UI."}
