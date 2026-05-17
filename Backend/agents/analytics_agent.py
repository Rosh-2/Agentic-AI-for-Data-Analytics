import pandas as pd
import numpy as np
import math

class AnalyticsAgent:
    """
    Handles EDA, correlations, segmentation, trend analysis, and outliers.
    Uses pandas and numpy. Minimal LLM usage.
    """
    
    @staticmethod
    def dataset_summary(df: pd.DataFrame, state: dict) -> dict:
        state.setdefault("agent_logs", []).append("[Analytics Agent] Performing dataset summary and schema inference...")
        total_rows = len(df)
        total_columns = len(df.columns)
        duplicate_rows = int(df.duplicated().sum())
        
        numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        
        missing_values = df.isnull().sum().to_dict()
        total_missing = int(sum(missing_values.values()))
        
        target_candidates = []
        target_names = ['target', 'churn', 'label', 'outcome', 'y', 'sales', 'revenue']
        for col in df.columns:
            if col.lower() in target_names:
                target_candidates.append(col)
                
        if not target_candidates:
            for col in categorical_cols:
                if 2 <= df[col].nunique() <= 10:
                    target_candidates.append(col)
                    
        target_variable = target_candidates[0] if target_candidates else None

        state.setdefault("eda", {})
        state["eda"]["summary"] = {
            "total_rows": total_rows,
            "total_columns": total_columns,
            "duplicate_rows": duplicate_rows,
            "numerical_columns_count": len(numerical_cols),
            "categorical_columns_count": len(categorical_cols),
            "total_missing": total_missing,
            "target_variable": target_variable
        }
        
        state["eda"]["details"] = {
            "numerical_cols": numerical_cols,
            "categorical_cols": categorical_cols,
            "missing_values": missing_values,
        }
        return state

    @staticmethod
    def correlation_analysis(df: pd.DataFrame, state: dict) -> dict:
        state.setdefault("agent_logs", []).append("[Analytics Agent] Calculating feature correlations...")
        details = state.get("eda", {}).get("details", {})
        numerical_cols = details.get("numerical_cols", df.select_dtypes(include=[np.number]).columns.tolist())
        
        if len(numerical_cols) > 1:
            corr_matrix = df[numerical_cols].corr()
            corr_data = []
            max_corr_score = 0
            
            for i in range(len(numerical_cols)):
                row = {"name": numerical_cols[i]}
                for j in range(len(numerical_cols)):
                    val = float(corr_matrix.iloc[i, j])
                    if np.isnan(val):
                        val = 0.0
                    row[numerical_cols[j]] = val
                    if i != j and abs(val) > abs(max_corr_score):
                        max_corr_score = abs(val)
                corr_data.append(row)
                
            state.setdefault("charts", {})
            state["charts"]["correlation"] = {
                "matrix": corr_data,
                "max_score": max_corr_score
            }
        return state

    @staticmethod
    def segment_analysis(df: pd.DataFrame, state: dict) -> dict:
        state.setdefault("agent_logs", []).append("[Analytics Agent] Segmenting categorical groups...")
        details = state.get("eda", {}).get("details", {})
        categorical_cols = details.get("categorical_cols", df.select_dtypes(include=['object', 'category']).columns.tolist())
        
        categorical_analysis = {}
        for col in categorical_cols:
            unique_vals = df[col].nunique()
            freq_counts = df[col].value_counts().head(5).to_dict()
            categorical_analysis[col] = {
                "unique_values": int(unique_vals),
                "top_frequencies": freq_counts
            }
            
        state.setdefault("eda", {}).setdefault("analysis", {})
        state["eda"]["analysis"]["categorical"] = categorical_analysis
        return state

    @staticmethod
    def outlier_detection(df: pd.DataFrame, state: dict) -> dict:
        state.setdefault("agent_logs", []).append("[Analytics Agent] Detecting statistical outliers...")
        details = state.get("eda", {}).get("details", {})
        numerical_cols = details.get("numerical_cols", df.select_dtypes(include=[np.number]).columns.tolist())
        
        numerical_analysis = {}
        for col in numerical_cols:
            col_data = df[col].dropna()
            if len(col_data) > 0:
                q1 = col_data.quantile(0.25)
                q3 = col_data.quantile(0.75)
                iqr = q3 - q1
                lower_bound = q1 - 1.5 * iqr
                upper_bound = q3 + 1.5 * iqr
                outliers = int(((col_data < lower_bound) | (col_data > upper_bound)).sum())
                
                numerical_analysis[col] = {
                    "mean": float(col_data.mean()) if not math.isnan(col_data.mean()) else None,
                    "median": float(col_data.median()) if not math.isnan(col_data.median()) else None,
                    "std": float(col_data.std()) if not math.isnan(col_data.std()) else None,
                    "outliers": outliers
                }
                
        state.setdefault("eda", {}).setdefault("analysis", {})
        state["eda"]["analysis"]["numerical"] = numerical_analysis
        return state

    @staticmethod
    def clustering(df: pd.DataFrame, state: dict) -> dict:
        state.setdefault("agent_logs", []).append("[Analytics Agent] Performing dynamic cluster analysis...")
        try:
            from sklearn.cluster import KMeans
            df_clean = df.copy().dropna()
            num_cols = df_clean.select_dtypes(include=[np.number]).columns.tolist()
            if len(num_cols) >= 2:
                X = df_clean[num_cols].head(150)
                kmeans = KMeans(n_clusters=3, random_state=42, n_init='auto')
                kmeans.fit(X)
                labels = kmeans.labels_
                
                state.setdefault("charts", {})
                state["charts"]["clustering"] = {
                    "status": "completed",
                    "clusters_count": 3,
                    "cluster_sizes": [int((labels == i).sum()) for i in range(3)]
                }
                state["agent_logs"].append("[Analytics Agent] Dynamic cluster analysis completed successfully.")
            else:
                state["agent_logs"].append("[Analytics Agent] Skipping clustering: Not enough numerical columns.")
        except Exception as e:
            state["agent_logs"].append(f"[Analytics Agent] Outlier/Clustering skip: {e}")
        return state
