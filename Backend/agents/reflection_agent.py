class ReflectionAgent:
    """
    Evaluates outputs and triggers retries intelligently.
    Uses rule-based heuristics to determine if quality thresholds are met.
    """

    @staticmethod
    def evaluate_model(state: dict) -> dict:
        """
        Checks if model accuracy or R2 is >= 0.75.
        """
        if "models" not in state:
            return {"retry": False}
            
        if "classification" in state["models"]:
            cls_model = state["models"]["classification"]
            if cls_model.get("status") == "completed":
                accuracy = cls_model.get("accuracy", 0)
                if accuracy < 0.75:
                    return {
                        "retry": True,
                        "reason": f"Classification Accuracy ({accuracy*100:.1f}%) below 75% threshold.",
                        "suggestion": "LogisticRegression"
                    }
                    
        if "regression" in state["models"]:
            reg_model = state["models"]["regression"]
            if reg_model.get("status") == "completed":
                r2 = reg_model.get("r2_score", 0)
                if r2 < 0.75:
                    return {
                        "retry": True,
                        "reason": f"Regression R2 Score ({r2*100:.1f}%) below 75% threshold.",
                        "suggestion": "LinearRegression"
                    }
                    
        return {"retry": False}

    @staticmethod
    def evaluate_insights(state: dict) -> dict:
        """
        Checks if generated insights are detailed enough.
        """
        insights = state.get("insights", "")
        if not insights or "❌" in insights or "⚠️" in insights:
            return {"retry": False} # Don't retry on api errors
            
        # Very simple heuristic: if it's less than 150 characters, it's too generic/short
        if len(insights) < 150:
            return {
                "retry": True,
                "reason": "Insights are too brief and generic.",
                "suggestion": "Please provide deeper, highly detailed strategic insights. Ensure you explain the 'why' and exactly what actions to take."
            }
            
        return {"retry": False}
