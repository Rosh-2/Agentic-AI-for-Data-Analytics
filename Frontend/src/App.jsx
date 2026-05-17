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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center">
          <Activity className="w-6 h-6 text-indigo-600 mr-2" />
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Agentic AI Analytics</h1>
        </div>
        {dashboardData && (
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" /> Start Over
          </button>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col gap-8">
        {!dashboardData && (
          <>
            <div className="text-center mb-4 mt-8">
              <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Automated Dataset Understanding
              </h2>
              <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                Upload your dataset to instantly generate comprehensive Exploratory Data Analysis, beautiful visualizations, and AI-powered insights.
              </p>
            </div>
            <div className="w-full max-w-3xl mx-auto">
              <FileUpload setData={setDashboardData} setLoading={setLoading} setError={setError} loading={loading} />
              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
            </div>
          </>
        )}

        {dashboardData && (
          <div className="space-y-6">
            {/* Active Goal Display */}
            {dashboardData.intent && dashboardData.intent.task !== 'general_eda' && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-4 shadow-sm">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-900">Current Goal: {dashboardData.intent.task.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                  <p className="text-sm text-indigo-700 mt-1">
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
  )
}

export default App
