import io
from fpdf import FPDF

def build_pdf_report(report_data: dict, objective: str) -> io.BytesIO:
    """
    Compiles report JSON into an elegant, print-ready PDF using FPDF2.
    """
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    
    # Brand Header Bar (Navy accent)
    pdf.set_fill_color(30, 41, 59) # Slate-800
    pdf.rect(0, 0, 210, 8, 'F')
    pdf.ln(8)
    
    # Title Section
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_text_color(15, 23, 42) # Slate-900
    pdf.cell(0, 10, "Executive Decision Briefing", ln=True)
    
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(100, 116, 139) # Slate-500
    pdf.cell(0, 5, f"Business Objective: {objective if objective else 'General EDA'}", ln=True)
    pdf.cell(0, 5, "Autonomously Synthesized by Multi-Agent Analytics Engine", ln=True)
    pdf.ln(6)
    
    # Horizontal Divider Line
    pdf.set_draw_color(226, 232, 240) # Gray-200
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(6)
    
    # 1. Executive Summary
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(30, 41, 59) # Slate-800
    pdf.cell(0, 8, "1. Executive Summary", ln=True)
    
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(71, 85, 105) # Slate-600
    pdf.multi_cell(0, 5, report_data.get("executive_summary", "No summary compiled."))
    pdf.ln(5)
    
    # 2. Key Insights
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 8, "2. Key Quantitative Insights", ln=True)
    
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(71, 85, 105)
    for insight in report_data.get("insights", []):
        pdf.multi_cell(0, 5.5, f"- {insight}")
    pdf.ln(6)
    
    # 3. Recommendations
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 8, "3. Strategic Recommendations (Evidence Linked)", ln=True)
    
    for idx, rec in enumerate(report_data.get("recommendations", []), 1):
        # Card header
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(79, 70, 229) # Indigo-600
        pdf.cell(0, 6, f"{idx}. {rec.get('action')}", ln=True)
        
        # Details
        pdf.set_font("Helvetica", "I", 9.5)
        pdf.set_text_color(100, 116, 139) # Slate-500
        pdf.multi_cell(0, 4.5, f"   Evidence: {rec.get('evidence')}  |  Confidence Level: {rec.get('confidence')}")
        
        # Explainability why_this_insight
        why_insight = rec.get("why_this_insight")
        if why_insight:
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(71, 85, 105) # Slate-600
            pdf.multi_cell(0, 4.5, f"   Explainability: {why_insight}")
        pdf.ln(3.5)
        
    pdf.ln(2)
    
    # 4. Risk Matrix
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 8, "4. Risk & Optimization Summary", ln=True)
    
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(185, 28, 28) # Red-700
    pdf.multi_cell(0, 5, report_data.get("risk_summary", "No risk analysis compiled."))
    pdf.ln(10)
    
    # Custom Brand Footer block
    pdf.set_fill_color(248, 250, 252) # Slate-50 background
    pdf.rect(10, pdf.get_y(), 190, 15, 'F')
    pdf.set_y(pdf.get_y() + 2)
    pdf.set_font("Helvetica", "I", 8.5)
    pdf.set_text_color(148, 163, 184) # Slate-400
    pdf.cell(0, 5, "CONFIDENTIALITY NOTICE: Intended for internal executive and stakeholder review only.", ln=True, align='C')
    pdf.cell(0, 5, "Compiled autonomously using scikit-learn models and LLM executive phrasing.", ln=True, align='C')
    
    # Output to bytes
    pdf_bytes = pdf.output()
    buffer = io.BytesIO(pdf_bytes)
    buffer.seek(0)
    return buffer
