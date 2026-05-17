import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

AVAILABLE_TASKS = [
    "dataset_summary",
    "correlation_analysis",
    "segment_analysis",
    "outlier_detection",
    "clustering",
    "forecasting",
    "classification_model",
    "regression_model",
    "recommendation_generation"
]

def generate_plan(goal: str) -> dict:
    """
    Given a business objective, generate the required analytics workflow steps.
    """
    if not goal or not goal.strip():
        # Default plan if no goal provided
        return {
            "goal": "general exploratory data analysis",
            "steps": [
                {"task": "dataset_summary", "priority": 1},
                {"task": "correlation_analysis", "priority": 2},
                {"task": "segment_analysis", "priority": 3},
                {"task": "outlier_detection", "priority": 4},
                {"task": "recommendation_generation", "priority": 5}
            ]
        }
        
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("Warning: GROQ_API_KEY is not set. Defaulting to general plan.")
        return {
            "goal": goal,
            "steps": [
                {"task": "dataset_summary", "priority": 1},
                {"task": "correlation_analysis", "priority": 2},
                {"task": "segment_analysis", "priority": 3},
                {"task": "recommendation_generation", "priority": 4}
            ]
        }
        
    try:
        client = Groq(api_key=api_key)
        
        prompt = f"""
        You are a planner agent for an advanced, domain-agnostic AI analytics platform.
        
        Given a business objective, generate the required analytics workflow steps.
        
        Business Objective: "{goal}"
        
        TASK GUIDELINES:
        - If the objective involves predicting a continuous quantity (e.g. sales value, price, temperature, costs, ratings), include "regression_model".
        - If the objective involves predicting a discrete category (e.g. churn, fraud, spam, defect status, disease class), include "classification_model".
        - If the objective involves finding natural groupings or user cohorts, include "clustering".
        - If the objective involves trend projection over time, include "forecasting".
        
        Only select from this list of available tasks:
        {json.dumps(AVAILABLE_TASKS, indent=2)}
        
        Return ONLY structured JSON in the following format:
        {{
          "goal": "standardized interpretation of the objective",
          "steps": [
            {{
              "task": "dataset_summary",
              "priority": 1
            }},
            {{
              "task": "another_task",
              "priority": 2
            }}
          ]
        }}
        
        The first step should always be "dataset_summary", and the last step should usually be "recommendation_generation".
        Do not include any markdown formatting, just the raw JSON.
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
            max_tokens=250,
            response_format={"type": "json_object"}
        )
        
        response_text = chat_completion.choices[0].message.content
        plan = json.loads(response_text)
        
        # Ensure only valid tasks are included
        valid_steps = []
        priority = 1
        has_summary = False
        has_rec = False
        
        raw_steps = plan.get("steps", [])
        
        for step in raw_steps:
            task_name = step.get("task")
            if task_name in AVAILABLE_TASKS:
                if task_name == "dataset_summary": has_summary = True
                if task_name == "recommendation_generation": has_rec = True
                valid_steps.append({"task": task_name, "priority": priority})
                priority += 1
                
        # Ensure dataset_summary is first and recommendation_generation is last if missing
        if not has_summary:
            valid_steps.insert(0, {"task": "dataset_summary", "priority": 0})
        if not has_rec:
            valid_steps.append({"task": "recommendation_generation", "priority": 99})
            
        # Fix priorities
        for i, step in enumerate(valid_steps):
            step["priority"] = i + 1
            
        plan["steps"] = valid_steps
        return plan
        
    except Exception as e:
        print(f"Error generating plan: {e}")
        return {
            "goal": goal,
            "steps": [
                {"task": "dataset_summary", "priority": 1},
                {"task": "correlation_analysis", "priority": 2},
                {"task": "segment_analysis", "priority": 3},
                {"task": "recommendation_generation", "priority": 4}
            ]
        }
