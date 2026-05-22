import React, { useState } from 'react'
import KPICards from './KPICards'
import AIInsights from './AIInsights'
import ChartsPanel from './ChartsPanel'
import AgentWorkflow from './AgentWorkflow'
import ExecutiveReport from './ExecutiveReport'
import { LayoutDashboard, FileText, Loader2 } from 'lucide-react'
import axios from 'axios'

export default function DashboardLayout({ dashboardData }) {
  const [isSimulationComplete, setIsSimulationComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDownloading, setIsDownloading] = useState(false);

  if (!dashboardData) return null;

  const { eda, charts, insights, plan, agent_logs, report, objective, models } = dashboardData;

  const handleDownloadPDF = async () => {
    if (!report) return;
    setIsDownloading(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiBaseUrl}/api/download-pdf`, {
        report: report,
        objective: objective || "General EDA"
      }, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Executive_Decision_Briefing.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert("Failed to download PDF report. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }

  const handleDownloadMarkdown = () => {
    if (!report) return;
    const { executive_summary, insights: insList, recommendations, risk_summary } = report;
    
    const mdContent = `# Executive Decision Briefing

**Business Objective:** ${objective || "General Analytics"}
*Compiled autonomously by Multi-Agent Analytics Platform*

---

## 1. Executive Summary
${executive_summary || "No summary compiled."}

## 2. Key Quantitative Insights
${insList ? insList.map((ins, i) => `${i + 1}. ${ins}`).join('\n') : "No quantitative insights compiled."}

## 3. Evidence-Linked Strategic Recommendations
${recommendations ? recommendations.map((rec, i) => `### Strategy ${i + 1}: ${rec.action}
* **Confidence Level:** ${rec.confidence}
* **Analytical Evidence:** ${rec.evidence}
`).join('\n') : "No recommendations compiled."}

## 4. Risk & Revenue Opportunity Summary
${risk_summary || "No risk analysis compiled."}

---
*CONFIDENTIAL - Intended for Internal Executive Review only.*
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Executive_Decision_Briefing.md");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out w-full">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dataset Intelligence Studio</h2>
          <p className="text-sm text-slate-500 mt-1">Autonomous Multi-Agent Analytics & Intelligence Platform</p>
        </div>

        {/* Tab Controls (Only render when simulation is complete) */}
        {isSimulationComplete && (
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-sm self-start">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Interactive Dashboard
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'report' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <FileText className="w-4 h-4" /> Executive Briefing
            </button>
          </div>
        )}
      </div>
      
      {plan && (
        <AgentWorkflow 
          plan={plan} 
          agentLogs={agent_logs} 
          onSimulationComplete={() => setIsSimulationComplete(true)} 
        />
      )}
      
      {isSimulationComplete && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Tab 1: Interactive Dashboard */}
          {activeTab === 'dashboard' && (
            <div>
              <KPICards summary={eda?.summary} />
              <AIInsights insights={insights} intent={objective} />
              <ChartsPanel charts={charts} />
              
              {/* Correlation Matrix */}
              {charts?.correlation?.matrix && charts.correlation.matrix.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="font-semibold text-slate-800">Correlation Matrix (Numerical Features)</h4>
                  </div>
                  <div className="overflow-x-auto p-0">
                    <table className="w-full text-xs text-left whitespace-nowrap">
                      <thead className="text-slate-500 uppercase bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 font-medium bg-slate-100 sticky left-0 z-10">Feature</th>
                          {charts.correlation.matrix.map((row) => (
                            <th key={`th-${row.name}`} className="px-4 py-3 font-medium text-center">
                              {row.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {charts.correlation.matrix.map((row) => (
                          <tr key={`tr-${row.name}`} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-700 bg-white sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                              {row.name}
                            </td>
                            {charts.correlation.matrix.map((col) => {
                              const val = row[col.name];
                              const isHigh = Math.abs(val) >= 0.8 && row.name !== col.name;
                              const isMod = Math.abs(val) >= 0.5 && Math.abs(val) < 0.8;
                              
                              return (
                                <td key={`td-${row.name}-${col.name}`} className="px-4 py-3 text-center border-l border-slate-100">
                                  <span className={`inline-block px-2 py-1 rounded w-full text-center
                                    ${isHigh ? 'bg-red-100 text-red-700 font-bold' : 
                                      isMod ? 'bg-amber-50 text-amber-700' : 'text-slate-400'}`}>
                                    {val.toFixed(2)}
                                  </span>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Executive Report */}
          {activeTab === 'report' && (
            <ExecutiveReport
              report={report}
              objective={objective}
              models={models}
              onDownloadPDF={handleDownloadPDF}
              onDownloadMarkdown={handleDownloadMarkdown}
              isDownloading={isDownloading}
            />
          )}

        </div>
      )}
    </div>
  )
}
