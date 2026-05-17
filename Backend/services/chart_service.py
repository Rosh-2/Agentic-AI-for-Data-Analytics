import pandas as pd
import numpy as np

def generate_chart_data(df: pd.DataFrame, eda_details: dict):
    """
    Generate JSON-serializable data structures for frontend charting (Recharts).
    """
    numerical_cols = eda_details["numerical_cols"]
    categorical_cols = eda_details["categorical_cols"]
    missing_values = eda_details["missing_values"]
    
    chart_data = {
        "histograms": {},
        "bar_charts": {},
        "correlation": {},
        "missing_values": []
    }
    
    # 1. Missing Values Bar Chart Data
    for col, count in missing_values.items():
        chart_data["missing_values"].append({"name": col, "missing": int(count)})
        
    # Sort by missing values descending
    chart_data["missing_values"] = sorted(chart_data["missing_values"], key=lambda x: x["missing"], reverse=True)[:15] # Top 15

    # 2. Histograms for Numerical Data
    for col in numerical_cols[:5]:  # Limit to top 5 numerical columns to save payload size
        col_data = df[col].dropna()
        if len(col_data) > 0:
            # We can create ~10 bins for histograms
            counts, bin_edges = np.histogram(col_data, bins=10)
            hist_data = []
            for i in range(len(counts)):
                range_str = f"{bin_edges[i]:.1f}-{bin_edges[i+1]:.1f}"
                hist_data.append({"name": range_str, "count": int(counts[i])})
            chart_data["histograms"][col] = hist_data

    # 3. Bar Charts for Categorical Data
    for col in categorical_cols[:5]: # Limit to top 5 categorical
        counts = df[col].value_counts().head(10) # Top 10 categories
        bar_data = [{"name": str(k), "count": int(v)} for k, v in counts.items()]
        chart_data["bar_charts"][col] = bar_data

    # 4. Correlation Heatmap & High Correlation Score
    if len(numerical_cols) > 1:
        corr_matrix = df[numerical_cols].corr()
        
        # Prepare data for a heatmap (Recharts doesn't have a native heatmap, 
        # but we can use ScatterChart or pass it to Plotly if needed. 
        # We will format it as a matrix of values).
        heatmap_data = []
        for i, row_col in enumerate(numerical_cols):
            row_data = {"name": row_col}
            for j, col_col in enumerate(numerical_cols):
                val = corr_matrix.loc[row_col, col_col]
                row_data[col_col] = float(val) if not np.isnan(val) else 0.0
            heatmap_data.append(row_data)
            
        chart_data["correlation"]["matrix"] = heatmap_data
        
        # Find max correlation score (ignoring self-correlation of 1.0)
        max_corr = 0.0
        for i in range(len(numerical_cols)):
            for j in range(i + 1, len(numerical_cols)):
                val = abs(corr_matrix.iloc[i, j])
                if not np.isnan(val) and val > max_corr:
                    max_corr = val
        chart_data["correlation"]["max_score"] = float(max_corr)
    else:
        chart_data["correlation"]["matrix"] = []
        chart_data["correlation"]["max_score"] = 0.0

    return chart_data
