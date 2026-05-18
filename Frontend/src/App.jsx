import { useState } from 'react'
import { Activity, RefreshCcw, Target } from 'lucide-react'
import FileUpload from './components/FileUpload'
import DashboardLayout from './components/DashboardLayout'

function App() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleReset = () => {
    setDashboardData(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans h-screen overflow-hidden">
      
      {/* Premium Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50 shrink-0">
        <div className="flex items-center">
          <Activity className="w-6 h-6 text-indigo-600 mr-2" />
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Agentic AI Analytics</h1>
        </div>

        {/* Workspace Controls */}
        <div className="flex items-center gap-4">
          {dashboardData && (
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <RefreshCcw className="w-4 h-4" /> Start Over
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace (Takes 100% of Screen Width) */}
      <div className="flex flex-1 overflow-hidden bg-slate-50">
        
        {/* Content Panel (Independently Scrollable) */}
        <main className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-8 scrollbar-thin">
          {!dashboardData && (
            <>
              <div className="text-center mb-4 mt-8 space-y-4">
                <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                  Automated Dataset Understanding
                </h2>
                <p className="text-base text-slate-500 max-w-xl mx-auto font-medium">
                  Upload any dataset to instantly execute dynamic statistical EDA, quantitative clusters, Scikit-Learn predictions, and expert strategic briefings.
                </p>
              </div>
              <div className="w-full max-w-3xl mx-auto">
                <FileUpload 
                  setData={setDashboardData} 
                  setLoading={setLoading} 
                  setError={setError} 
                  loading={loading} 
                />
                {error && (
                  <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 font-semibold text-sm">
                    {error}
                  </div>
                )}
              </div>
            </>
          )}

          {dashboardData && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Active Goal Display */}
              {dashboardData.intent && dashboardData.intent.task !== 'general_eda' && (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                  <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600 border border-indigo-200">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-900 text-sm">Current Goal: {dashboardData.intent.task.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                    <p className="text-xs text-indigo-700 mt-1 font-semibold leading-relaxed">
                      {dashboardData.objective || "Targeted analysis based on your requirements."}
                    </p>
                  </div>
                </div>
              )}
              <DashboardLayout dashboardData={dashboardData} />
            </div>
          )}
        </main>
      </div>

    </div>
  )
}

export default App
