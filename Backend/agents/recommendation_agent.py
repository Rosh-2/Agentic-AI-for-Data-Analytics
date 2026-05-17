import os
from groq import Groq
from dotenv import load_dotenv
import pandas as pd

load_dotenv()

class RecommendationAgent:
    """
    Converts analytics into business recommendations, strategic actions, and executive insights.
    Uses LLM heavily.
    """
    
    @staticmethod
    def recommendation_generation(df: pd.DataFrame, state: dict, plan: dict, attempt: int = 1, retry_context: str = None) -> dict:
        log_msg = f"[Recommendation Agent] Analyzing compiled state to generate strategic insights (Attempt {attempt})..."
        state.setdefault("agent_logs", []).append(log_msg)
        
        api_key = os.getenv("GROQ_API_KEY")
        
        if not api_key:
            state["insights"] = "⚠️ GROQ_API_KEY is not set in the .env file. Please add your API key to enable AI Insights."
            state["agent_logs"].append("[Recommendation Agent] Failed: GROQ_API_KEY not set.")
            return state
            
        try:
            client = Groq(api_key=api_key)
            
            eda = state.get("eda", {})
            summary = eda.get("summary", {})
            analysis = eda.get("analysis", {})
            
            goal = plan.get("goal", "general analysis")
            target = summary.get("target_variable", "None specified")
            
            models_info = ""
            if "models" in state:
                if "classification" in state["models"]:
                    cls_model = state["models"]["classification"]
                    if cls_model.get("status") == "completed":
                        models_info += f"\n- Classification Model trained on '{target}'. Accuracy: {cls_model.get('accuracy', 0)*100:.1f}%. Top features: {cls_model.get('feature_importance')}"
                if "regression" in state["models"]:
                    reg_model = state["models"]["regression"]
                    if reg_model.get("status") == "completed":
                        models_info += f"\n- Regression Model trained on '{target}'. R2 Score: {reg_model.get('r2_score', 0)*100:.1f}%. Top features: {reg_model.get('feature_importance')}"
                        
            prompt = f"""
            You are an expert Recommendation Agent powering an advanced, domain-agnostic autonomous analytics platform.
            An autonomous multi-agent system has just finished executing an analytics workflow.
            
            BUSINESS OBJECTIVE: {goal}
            TARGET VARIABLE: {target}
            
            DATASET SUMMARY:
            - Total Rows: {summary.get('total_rows')}
            - Total Columns: {summary.get('total_columns')}
            - Missing Values: {summary.get('total_missing')}
            
            DEEP ANALYTICS EXTRACTED:
            - Numerical Analysis Available: {'Yes' if 'numerical' in analysis else 'No'}
            - Categorical Analysis Available: {'Yes' if 'categorical' in analysis else 'No'}
            - Correlations Found: {'Yes' if 'charts' in state and 'correlation' in state['charts'] else 'No'}
            - Predictive Models Run: {models_info if models_info else 'None'}
            
            Based ONLY on this information (and the implications of these analytical results), generate exactly 3 concise, highly professional, domain-agnostic business recommendations that specifically address the BUSINESS OBJECTIVE.
            
            CRITICAL STYLE GUIDELINES:
            - DO NOT use generic phrases like "implement a targeted retention strategy" or "you should focus on customers who...".
            - DO NOT assume specific domains like churn or subscription unless indicated by the objective or target.
            - ALWAYS lead directly with crisp, metric-oriented analytical conclusions.
            - Ensure each recommendation combines a data finding (evidence) with a direct strategic action.
            - Keep each point short, professional, and highly executive-focused (under 30 words per point).
            - Example: "Short-term cohorts with fees above 80 units correlate with a 2.1x target outcome spike. Optimize renewal contract structures."
            
            Format your response EXACTLY as a numbered list with no introductory or concluding fluff.
            """
            
            if attempt > 1 and retry_context:
                prompt += f"\n\nCRITICAL RETRY INSTRUCTION:\n{retry_context}\nMake sure your new recommendations completely address this feedback."
                # To simulate/ensure it doesn't trigger another brief response, we will also inject mock text if needed,
                # but Groq will output longer if we instruct it so.
                
            state["agent_logs"].append("[Recommendation Agent] Prompting LLM with aggregated multi-agent state...")
            
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.1-8b-instant",
                temperature=0.5,
                max_tokens=256
            )
            
            response_text = chat_completion.choices[0].message.content
            
            # Simple simulation for testing: if we are testing insight reflection, 
            # let's make sure it satisfies the length check on retry.
            state["insights"] = response_text
            state["agent_logs"].append("[Recommendation Agent] Business recommendations generated successfully.")
            
        except Exception as e:
            state["insights"] = f"❌ Failed to generate AI insights due to an error: {str(e)}"
            state["agent_logs"].append(f"[Recommendation Agent] Error during insight generation: {e}")
            
        return state
