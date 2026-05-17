import React from 'react'
import { FileText, Download, ShieldAlert, Sparkles, TrendingUp, Loader2, ArrowUpRight, Percent, Landmark } from 'lucide-react'

export default function ExecutiveReport({ report, objective, models, onDownloadPDF, onDownloadMarkdown, isDownloading }) {
  if (!report) return null;

  const { executive_summary, insights, recommendations, risk_summary, business_impact } = report;
  
  // Extract generalized and backward compatible metrics
  const val_opp = business_impact?.estimated_target_opportunity ?? business_impact?.estimated_high_risk_customers ?? 0;
  const val_impact = business_impact?.estimated_financial_impact ?? business_impact?.potential_revenue_at_risk ?? 0.0;
  const val_score = business_impact?.strategic_optimization_index ?? business_impact?.retention_opportunity_score ?? 80;

  const getConfidenceColor = (confidence) => {
    switch (confidence?.toLowerCase()) {
      case 'high': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  }

  // Support both classification and regression feature importance dynamically
  const feature_importance = models?.classification?.feature_importance || models?.regression?.feature_importance || [];

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Report Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-100">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-850">Executive Decision Briefing</h3>
            <p className="text-xs text-slate-500 font-medium">Autonomously synthesized from multi-agent deep analytics</p>
          </div>
        </div>
        
        {/* Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onDownloadMarkdown}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4" /> Export Markdown
          </button>
          
          <button
            onClick={onDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Download PDF Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generalized Executive KPI Cards */}
      {business_impact && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Estimated Target Opportunity */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-850 rounded-2xl border border-slate-850 p-6 shadow-md flex items-center justify-between text-white relative overflow-hidden group">
            <div className="space-y-1 z-10">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Estimated Target Opportunity</span>
              <h3 className="text-3xl font-extrabold tracking-tight">
                {val_opp?.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-400 font-medium">High-impact segments or values identified</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-indigo-400 z-10">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-600/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>

          {/* Card 2: Estimated Financial Impact */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-850 rounded-2xl border border-slate-850 p-6 shadow-md flex items-center justify-between text-white relative overflow-hidden group">
            <div className="space-y-1 z-10">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">Estimated Financial Impact</span>
              <h3 className="text-3xl font-extrabold tracking-tight text-rose-100">
                ${val_impact?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-slate-400 font-medium">Projected variance exposure based on ticket metrics</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-rose-400 z-10">
              <Landmark className="w-6 h-6" />
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-600/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>

          {/* Card 3: Strategic Optimization Index */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-850 rounded-2xl border border-slate-850 p-6 shadow-md flex items-center justify-between text-white relative overflow-hidden group">
            <div className="space-y-1 z-10">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Strategic Optimization Index</span>
              <h3 className="text-3xl font-extrabold tracking-tight text-emerald-100">
                {val_score}/100
              </h3>
              <p className="text-xs text-slate-400 font-medium">Viability rating computed from model metrics</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-emerald-400 z-10">
              <Percent className="w-6 h-6" />
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-600/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        </div>
      )}

      {/* Narrative & Feature Importance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Executive Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:col-span-2 flex flex-col justify-center">
          <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            1. Executive Strategy Narrative
          </h4>
          <p className="text-sm text-slate-650 leading-relaxed font-semibold">
            {executive_summary || "No executive summary compiled."}
          </p>
        </div>

        {/* Dynamic Visual Top Predictive Drivers */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Top Predictive Drivers (Model Importance)
          </h4>
          {feature_importance && feature_importance.length > 0 ? (
            <div className="space-y-4">
              {feature_importance.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="capitalize">{item.feature.replace('_', ' ')}</span>
                    <span className="text-indigo-600">{Math.round(item.importance * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                      style={{ width: `${item.importance * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Train an analytical model to inspect drivers.</p>
          )}
        </div>
      </div>

      {/* 2. Key Quantitative Insights */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          2. Key Quantitative Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights && insights.map((insight, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-sm text-slate-700 font-medium leading-relaxed">
                {insight}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Strategic Recommendations */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 px-1 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          3. Evidence-Linked Action Plan
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations && recommendations.map((rec, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Strategy {idx + 1}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getConfidenceColor(rec.confidence)}`}>
                    {rec.confidence} Confidence
                  </span>
                </div>
                
                <h5 className="font-bold text-slate-850 leading-snug text-sm">
                  {rec.action}
                </h5>
              </div>

              {/* Collapsible Explainability Accordion ("Why This Recommendation?") */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <details className="group/details">
                  <summary className="text-[11px] font-bold text-indigo-600 cursor-pointer select-none flex items-center justify-between list-none uppercase tracking-wider">
                    <span>Why This Insight?</span>
                    <span className="text-slate-400 group-open/details:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed font-normal italic">
                    "{rec.why_this_insight || 'Backed by multiple overlapping metrics from data profile.'}"
                  </p>
                </details>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-50 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Empirical Evidence</span>
                <p className="text-[11px] text-slate-500 font-normal italic">
                  "{rec.evidence}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Strategic Risks & Opportunities */}
      <div className="bg-rose-50/50 rounded-xl border border-rose-100 p-6">
        <h4 className="text-sm font-bold text-rose-800 mb-3 flex items-center gap-2 uppercase tracking-wider">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          4. Strategic Risks & Opportunities
        </h4>
        <p className="text-sm text-rose-750 leading-relaxed font-semibold">
          {risk_summary || "No critical risks compiled."}
        </p>
      </div>

    </div>
  )
}
