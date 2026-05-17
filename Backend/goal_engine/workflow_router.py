import pandas as pd
from services.eda_service import perform_eda

def run_churn_analysis(df: pd.DataFrame, intent: dict) -> dict:
    eda_results = perform_eda(df)
    # Override target if intent specified one
    if intent.get("target"):
        eda_results["summary"]["target_variable"] = intent["target"]
    eda_results["summary"]["analysis_type"] = "Churn Analysis"
    return eda_results

def run_forecasting(df: pd.DataFrame, intent: dict) -> dict:
    eda_results = perform_eda(df)
    if intent.get("target"):
        eda_results["summary"]["target_variable"] = intent["target"]
    eda_results["summary"]["analysis_type"] = "Forecasting"
    return eda_results

def run_anomaly_detection(df: pd.DataFrame, intent: dict) -> dict:
    eda_results = perform_eda(df)
    if intent.get("target"):
        eda_results["summary"]["target_variable"] = intent["target"]
    eda_results["summary"]["analysis_type"] = "Anomaly Detection"
    return eda_results

def run_general_eda(df: pd.DataFrame, intent: dict) -> dict:
    eda_results = perform_eda(df)
    if intent.get("target"):
        eda_results["summary"]["target_variable"] = intent["target"]
    eda_results["summary"]["analysis_type"] = "General Exploratory Data Analysis"
    return eda_results

def route_workflow(intent: dict, df: pd.DataFrame) -> dict:
    """
    Routes the analysis request to the appropriate workflow based on intent.
    """
    task = intent.get("task", "").lower()
    
    if "churn" in task:
        return run_churn_analysis(df, intent)
    elif "forecast" in task:
        return run_forecasting(df, intent)
    elif "anomaly" in task:
        return run_anomaly_detection(df, intent)
    else:
        return run_general_eda(df, intent)
