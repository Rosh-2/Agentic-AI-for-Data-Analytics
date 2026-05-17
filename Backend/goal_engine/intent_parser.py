import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

def parse_intent(goal: str) -> dict:
    """
    Parse the user's business objective using Groq LLM and extract a structured intent.
    Returns a dictionary with 'task', 'target', and 'focus'.
    """
    if not goal or not goal.strip():
        return {
            "task": "general_eda",
            "target": None,
            "focus": ["overview", "distributions", "missing values"]
        }
        
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("Warning: GROQ_API_KEY is not set. Defaulting to general EDA.")
        return {
            "task": "general_eda",
            "target": None,
            "focus": ["overview"]
        }
        
    try:
        client = Groq(api_key=api_key)
        
        prompt = f"""
        You are an intelligent data analysis router. 
        Analyze the following business objective provided by a user: "{goal}"
        
        Extract the intent into a JSON structure with exactly these keys:
        - "task": A string representing the type of analysis (e.g., "churn_analysis", "forecasting", "anomaly_detection", "segmentation", "general_eda").
        - "target": The main variable or metric they want to analyze or predict (e.g., "Churn", "Sales", "Revenue", "Fraud"). If none is obvious, use null.
        - "focus": A list of 2-3 specific analytical focus areas (e.g., ["correlations", "high-risk groups", "feature importance"]).
        
        Return ONLY valid JSON. Do not include markdown blocks, backticks, or any other text.
        """
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You output JSON only."
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.1-8b-instant",
            temperature=0.1,
            max_tokens=150,
            response_format={"type": "json_object"}
        )
        
        response_text = chat_completion.choices[0].message.content
        intent = json.loads(response_text)
        return intent
        
    except Exception as e:
        print(f"Error parsing intent: {e}")
        return {
            "task": "general_eda",
            "target": None,
            "focus": ["overview"]
        }
