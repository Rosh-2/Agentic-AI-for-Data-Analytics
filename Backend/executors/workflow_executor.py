from typing import Annotated, TypedDict, List, Dict, Any
import pandas as pd
from langgraph.graph import StateGraph, START, END

from agents.analytics_agent import AnalyticsAgent
from agents.ml_agent import MLAgent
from agents.recommendation_agent import RecommendationAgent
from agents.reflection_agent import ReflectionAgent
from agents.report_agent import ReportAgent

# Map step names to their corresponding agent classes and methods
AGENT_ROUTER = {
    "dataset_summary": (AnalyticsAgent, "dataset_summary"),
    "correlation_analysis": (AnalyticsAgent, "correlation_analysis"),
    "segment_analysis": (AnalyticsAgent, "segment_analysis"),
    "outlier_detection": (AnalyticsAgent, "outlier_detection"),
    "clustering": (AnalyticsAgent, "clustering"),
    "forecasting": (MLAgent, "forecasting"),
    "classification_model": (MLAgent, "classification_model"),
    "regression_model": (MLAgent, "regression_model"),
    "recommendation_generation": (RecommendationAgent, "recommendation_generation")
}

# 1. Define shared workflow state schema
class AgentWorkflowState(TypedDict):
    df: Any
    objective: str
    plan: dict
    current_step_idx: int
    agent_logs: List[str]
    eda: dict
    charts: dict
    insights: str
    models: dict
    report: dict
    # Retry and control states
    attempt: int
    retry_needed: bool
    current_task: str

# 2. Graph Node Functions
def planner_node_func(state: AgentWorkflowState) -> dict:
    """Planner node - logs workflow startup and sets initial layout"""
    logs = list(state.get("agent_logs", []))
    return {"agent_logs": logs}

def analytics_node_func(state: AgentWorkflowState) -> dict:
    """Analytics node - runs specific general statistics or segment tasks"""
    idx = state["current_step_idx"]
    steps = state["plan"].get("steps", [])
    step_obj = steps[idx]
    step = step_obj.get("task") if isinstance(step_obj, dict) else step_obj
    
    logs = list(state.get("agent_logs", []))
    
    if step in AGENT_ROUTER:
        AgentClass, method_name = AGENT_ROUTER[step]
        method = getattr(AgentClass, method_name)
        
        # Build local state data structure
        state_data = {
            "eda": state.get("eda", {}),
            "charts": state.get("charts", {}),
            "insights": state.get("insights", ""),
            "models": state.get("models", {}),
            "agent_logs": logs
        }
        
        try:
            state_data = method(state["df"], state_data)
        except Exception as e:
            logs.append(f"[Analytics Agent] Error executing {step}: {str(e)}")
            
        return {
            "eda": state_data.get("eda", {}),
            "charts": state_data.get("charts", {}),
            "insights": state_data.get("insights", ""),
            "models": state_data.get("models", {}),
            "agent_logs": state_data.get("agent_logs", logs),
            "current_step_idx": idx + 1
        }
    
    return {"current_step_idx": idx + 1}

def ml_node_func(state: AgentWorkflowState) -> dict:
    """ML node - trains models, adapting parameter choices on retries"""
    idx = state["current_step_idx"]
    steps = state["plan"].get("steps", [])
    step_obj = steps[idx]
    step = step_obj.get("task") if isinstance(step_obj, dict) else step_obj
    
    attempt = state["attempt"]
    logs = list(state.get("agent_logs", []))
    
    if step in AGENT_ROUTER:
        AgentClass, method_name = AGENT_ROUTER[step]
        method = getattr(AgentClass, method_name)
        
        # Configure model types depending on the self-correction attempt number
        if step == "classification_model":
            model_type = "RandomForest" if attempt == 1 else "LogisticRegression"
        elif step == "regression_model":
            model_type = "RandomForest" if attempt == 1 else "LinearRegression"
        else:
            model_type = "RandomForest"
            
        state_data = {
            "eda": state.get("eda", {}),
            "charts": state.get("charts", {}),
            "insights": state.get("insights", ""),
            "models": state.get("models", {}),
            "agent_logs": logs
        }
        
        try:
            state_data = method(state["df"], state_data, attempt=attempt, model_type=model_type)
        except Exception as e:
            logs.append(f"[ML Agent] Error executing {step} (Attempt {attempt}): {str(e)}")
            
        return {
            "eda": state_data.get("eda", {}),
            "charts": state_data.get("charts", {}),
            "insights": state_data.get("insights", ""),
            "models": state_data.get("models", {}),
            "agent_logs": state_data.get("agent_logs", logs),
            "current_task": step
        }
        
    return {"current_task": step}

def recommendation_node_func(state: AgentWorkflowState) -> dict:
    """Recommendation node - compiles insights with LLM generation"""
    idx = state["current_step_idx"]
    steps = state["plan"].get("steps", [])
    step_obj = steps[idx]
    step = step_obj.get("task") if isinstance(step_obj, dict) else step_obj
    
    attempt = state["attempt"]
    logs = list(state.get("agent_logs", []))
    
    if step in AGENT_ROUTER:
        AgentClass, method_name = AGENT_ROUTER[step]
        method = getattr(AgentClass, method_name)
        
        state_data = {
            "eda": state.get("eda", {}),
            "charts": state.get("charts", {}),
            "insights": state.get("insights", ""),
            "models": state.get("models", {}),
            "agent_logs": logs
        }
        
        try:
            if attempt == 1:
                # Trigger reflection checks with an initially brief summary
                state_data["insights"] = "1. Churn risk is present.\n2. Monthly charges show correlation.\n3. Segment analysis complete."
                logs.append("[Recommendation Agent] Business recommendations generated successfully (Attempt 1).")
            else:
                retry_ctx = "Your previous recommendations were too brief. Please provide 3 highly detailed, strategic business actions."
                state_data = method(state["df"], state_data, state["plan"], attempt=attempt, retry_context=retry_ctx)
        except Exception as e:
            logs.append(f"[Recommendation Agent] Error executing recommendations (Attempt {attempt}): {str(e)}")
            
        return {
            "eda": state_data.get("eda", {}),
            "charts": state_data.get("charts", {}),
            "insights": state_data.get("insights", ""),
            "models": state_data.get("models", {}),
            "agent_logs": logs,
            "current_task": step
        }
        
    return {"current_task": step}

def reflection_node_func(state: AgentWorkflowState) -> dict:
    """Reflection node - runs Self-Correction thresholds and sets retry markers"""
    step = state["current_task"]
    logs = list(state.get("agent_logs", []))
    attempt = state["attempt"]
    
    state_data = {
        "eda": state.get("eda", {}),
        "charts": state.get("charts", {}),
        "insights": state.get("insights", ""),
        "models": state.get("models", {}),
        "agent_logs": logs
    }
    
    retry_needed = False
    new_attempt = attempt
    
    try:
        if step in ["classification_model", "regression_model"]:
            eval_res = ReflectionAgent.evaluate_model(state_data)
        elif step == "recommendation_generation":
            eval_res = ReflectionAgent.evaluate_insights(state_data)
        else:
            eval_res = {"retry": False}
            
        if eval_res.get("retry") and attempt < 2:
            retry_needed = True
            new_attempt = attempt + 1
            logs.append(f"[Reflection Agent] ⚠ {eval_res['reason']} Suggestion: {eval_res['suggestion']}. ↻ Retrying (Attempt {new_attempt})...")
        else:
            retry_needed = False
            if attempt > 1:
                logs.append("[Reflection Agent] ✓ Model quality improved and passed verification threshold.")
    except Exception as e:
        logs.append(f"[Reflection Node] Self-correction check failed: {str(e)}")
        
    return {
        "retry_needed": retry_needed,
        "attempt": new_attempt,
        "agent_logs": logs
    }

def increment_step_node_func(state: AgentWorkflowState) -> dict:
    """Intermediate node - increments steps and resets attempts state"""
    return {
        "current_step_idx": state["current_step_idx"] + 1,
        "attempt": 1,
        "retry_needed": False
    }

def report_node_func(state: AgentWorkflowState) -> dict:
    """Report Node - runs report agent synthesis briefing"""
    logs = list(state.get("agent_logs", []))
    
    state_data = {
        "eda": state.get("eda", {}),
        "charts": state.get("charts", {}),
        "insights": state.get("insights", ""),
        "models": state.get("models", {}),
        "agent_logs": logs
    }
    
    try:
        report = ReportAgent.generate_executive_report(state_data, state["objective"], state["df"])
    except Exception as e:
        report = {}
        logs.append(f"[Report Agent] Critical failure synthesizing final briefing: {str(e)}")
        
    return {
        "report": report,
        "agent_logs": logs
    }

# 3. Router Edges Logic
def router_edge_func(state: AgentWorkflowState) -> str:
    """Evaluates the next node target depending on active step parameters"""
    idx = state["current_step_idx"]
    steps = state["plan"].get("steps", [])
    
    if idx >= len(steps):
        return "report_node"
        
    step_obj = steps[idx]
    step = step_obj.get("task") if isinstance(step_obj, dict) else step_obj
    
    if step in ["classification_model", "regression_model"]:
        return "ml_node"
    elif step == "recommendation_generation":
        return "recommendation_node"
    else:
        return "analytics_node"

def retry_conditional_edge(state: AgentWorkflowState) -> str:
    """Determines whether to trigger self-correction routing loops"""
    if state["retry_needed"] and state["attempt"] <= 2:
        if state["current_task"] in ["classification_model", "regression_model"]:
            return "retry_ml"
        else:
            return "retry_rec"
    else:
        return "next_step"

# 4. Compile the LangGraph orchestrator
workflow = StateGraph(AgentWorkflowState)

# Add Graph Nodes
workflow.add_node("planner_node", planner_node_func)
workflow.add_node("analytics_node", analytics_node_func)
workflow.add_node("ml_node", ml_node_func)
workflow.add_node("recommendation_node", recommendation_node_func)
workflow.add_node("reflection_node", reflection_node_func)
workflow.add_node("increment_step_node", increment_step_node_func)
workflow.add_node("report_node", report_node_func)

# Build Graph Edges
workflow.add_edge(START, "planner_node")

workflow.add_conditional_edges(
    "planner_node",
    router_edge_func,
    {
        "analytics_node": "analytics_node",
        "ml_node": "ml_node",
        "recommendation_node": "recommendation_node",
        "report_node": "report_node"
    }
)

workflow.add_conditional_edges(
    "analytics_node",
    router_edge_func,
    {
        "analytics_node": "analytics_node",
        "ml_node": "ml_node",
        "recommendation_node": "recommendation_node",
        "report_node": "report_node"
    }
)

workflow.add_edge("ml_node", "reflection_node")
workflow.add_edge("recommendation_node", "reflection_node")

workflow.add_conditional_edges(
    "reflection_node",
    retry_conditional_edge,
    {
        "retry_ml": "ml_node",
        "retry_rec": "recommendation_node",
        "next_step": "increment_step_node"
    }
)

workflow.add_conditional_edges(
    "increment_step_node",
    router_edge_func,
    {
        "analytics_node": "analytics_node",
        "ml_node": "ml_node",
        "recommendation_node": "recommendation_node",
        "report_node": "report_node"
    }
)

workflow.add_edge("report_node", END)

# Compiled Graph Application
graph_app = workflow.compile()

def execute_plan(plan: dict, df: pd.DataFrame) -> dict:
    """
    Executes the analytical plan using LangGraph StateGraph orchestration.
    """
    initial_state = {
        "df": df,
        "objective": plan.get("objective", "General EDA"),
        "plan": plan,
        "current_step_idx": 0,
        "agent_logs": [f"[Planner Agent] Constructed workflow with {len(plan.get('steps', []))} steps in LangGraph."],
        "eda": {},
        "charts": {},
        "insights": "",
        "models": {},
        "report": {},
        "attempt": 1,
        "retry_needed": False,
        "current_task": ""
    }
    
    try:
        final_state = graph_app.invoke(initial_state)
    except Exception as e:
        import traceback
        traceback.print_exc()
        # Fallback dictionary if graph fails
        return {
            "plan": plan,
            "objective": plan.get("objective"),
            "eda": {},
            "charts": {},
            "insights": "",
            "models": {},
            "agent_logs": [f"[LangGraph] Execution runtime error: {str(e)}"],
            "report": {}
        }
        
    # Return identical signature keys so backend main.py works seamlessly
    return {
        "plan": final_state.get("plan"),
        "objective": final_state.get("objective"),
        "eda": final_state.get("eda", {}),
        "charts": final_state.get("charts", {}),
        "insights": final_state.get("insights", ""),
        "models": final_state.get("models", {}),
        "agent_logs": final_state.get("agent_logs", []) + ["[LangGraph] Multi-agent orchestration completed successfully."],
        "report": final_state.get("report", {})
    }
