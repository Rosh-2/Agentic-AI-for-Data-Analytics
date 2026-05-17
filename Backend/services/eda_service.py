import pandas as pd
import numpy as np
import math

def perform_eda(df: pd.DataFrame):
    """
    Perform Automated Exploratory Data Analysis on the given DataFrame.
    """
    # Basic dataset stats
    total_rows = len(df)
    total_columns = len(df.columns)
    duplicate_rows = int(df.duplicated().sum())
    
    # Identify numerical and categorical columns
    numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    
    # Missing values
    missing_values = df.isnull().sum().to_dict()
    total_missing = int(sum(missing_values.values()))
    
    # Target column candidates
    # Common names for target variables
    target_names = ['target', 'churn', 'label', 'outcome', 'y']
    target_candidates = []
    
    for col in df.columns:
        if col.lower() in target_names:
            target_candidates.append(col)
            
    # If no explicit name match, look for categorical columns with 2 to 10 unique values
    if not target_candidates:
        for col in categorical_cols:
            n_unique = df[col].nunique()
            if 2 <= n_unique <= 10:
                target_candidates.append(col)
                
    # If still none, look for integer columns with few unique values
    if not target_candidates:
         for col in numerical_cols:
             if df[col].nunique() <= 5:
                 target_candidates.append(col)
                 
    target_variable = target_candidates[0] if target_candidates else None
    
    # Numerical Analysis
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

    # Categorical Analysis
    categorical_analysis = {}
    for col in categorical_cols:
        unique_vals = df[col].nunique()
        freq_counts = df[col].value_counts().head(5).to_dict()
        
        categorical_analysis[col] = {
            "unique_values": int(unique_vals),
            "top_frequencies": freq_counts
        }

    return {
        "summary": {
            "total_rows": total_rows,
            "total_columns": total_columns,
            "duplicate_rows": duplicate_rows,
            "numerical_columns_count": len(numerical_cols),
            "categorical_columns_count": len(categorical_cols),
            "total_missing": total_missing,
            "target_variable": target_variable
        },
        "details": {
            "numerical_cols": numerical_cols,
            "categorical_cols": categorical_cols,
            "missing_values": missing_values,
        },
        "analysis": {
            "numerical": numerical_analysis,
            "categorical": categorical_analysis
        }
    }
