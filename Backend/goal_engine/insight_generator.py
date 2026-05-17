import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

def generate_goal_insights(intent: dict, eda_summary: dict, chart_data: dict = None) -> str:
    """
    Generate AI Insights focused specifically on the user's business objective.
    """
    api_key = os.getenv("GROQ_API_KEY")
    
    if not api_key:
        return "⚠️ GROQ_API_KEY is not set in the .env file. Please add your API key to enable AI Insights."
        
    try:
        client = Groq(api_key=api_key)
        
        # Prepare context from EDA summary
        summary = eda_summary.get("summary", {})
        analysis = eda_summary.get("analysis", {})
        numerical_analysis = analysis.get("numerical", {})
        categorical_analysis = analysis.get("categorical", {})
        
        top_categories = {k: v.get('top_frequencies') for k, v in categorical_analysis.items()}
        anomalies = {k: v.get('outliers') for k, v in numerical_analysis.items() if v.get('outliers', 0) > 0}
        distributions = {k: {"mean": v.get("mean"), "std": v.get("std")} for k, v in numerical_analysis.items()}
        
        correlation_info = "None"
        if chart_data and "correlation" in chart_data:
            max_corr = chart_data["correlation"].get("max_score", 0)
            correlation_info = f"Max correlation score found: {max_corr:.2f}"
            
        task = intent.get("task", "general analysis")
        target = intent.get("target", summary.get("target_variable") or "None specified")
        focus = ", ".join(intent.get("focus", []))
        
        prompt = f"""
        You are an expert Data Scientist powering an intelligent enterprise analytics platform.
        I have uploaded a dataset and performed an automated Exploratory Data Analysis.
        
        The user has a specific BUSINESS OBJECTIVE:
        - Analysis Task: {task}
        - Target Variable: {target}
        - Focus Areas: {focus}
        
        Dataset Overview:
        - Total Rows: {summary.get('total_rows')}
        - Total Columns: {summary.get('total_columns')}
        - Duplicate Rows: {summary.get('duplicate_rows')}
        - Total Missing Values: {summary.get('total_missing')}
        
        Deeper Analytics:
        - Top Categories: {top_categories}
        - Numerical Distributions (Mean/Std): {distributions}
        - Anomalies/Outliers Detected: {anomalies}
        - Key Correlations: {correlation_info}
        
        Based ONLY on this information, generate exactly 3 concise, highly professional business insights
        that SPECIFICALLY answer or relate to the user's business objective (Task: {task}, Target: {target}).
        
        Do NOT generate generic data facts unless they relate to the goal. Write like a senior data analyst reporting to a stakeholder.
        
        Format your response EXACTLY as a numbered list with no introductory or concluding fluff.
        Example format:
        1. [Insight 1]
        2. [Insight 2]
        3. [Insight 3]
        """
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.1-8b-instant",
            temperature=0.4,
            max_tokens=256
        )
        
        return chat_completion.choices[0].message.content
        
    except Exception as e:
        return f"❌ Failed to generate AI insights due to an error: {str(e)}"
