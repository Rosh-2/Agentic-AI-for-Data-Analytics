import React, { useEffect, useState } from 'react'
import { Calendar, Trash2, Database, ChevronLeft, ChevronRight, FileText, Loader2, RefreshCw } from 'lucide-react'
import axios from 'axios'

export default function HistorySidebar({ token, onSelectBriefing, refreshTrigger, onDeleted }) {
  const [isOpen, setIsOpen] = useState(true)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchingDetails, setFetchingDetails] = useState(null)

  const fetchHistory = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await axios.get('http://localhost:8000/api/history', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHistory(res.data)
    } catch (err) {
      console.error("Failed to load analytics history:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [token, refreshTrigger])

  const handleSelect = async (id) => {
    setFetchingDetails(id)
    try {
      const res = await axios.get(`http://localhost:8000/api/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      onSelectBriefing(res.data)
    } catch (err) {
      console.error("Failed to fetch history details:", err)
      alert("Failed to load historical briefing details.")
    } finally {
      setFetchingDetails(null)
    }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm("Are you sure you want to delete this historical briefing?")) return
    
    try {
      await axios.delete(`http://localhost:8000/api/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHistory(prev => prev.filter(item => item.id !== id))
      if (onDeleted) onDeleted(id)
    } catch (err) {
      console.error("Failed to delete history record:", err)
      alert("Failed to delete history record.")
    }
  }

  const formatDate = (epoch) => {
    const d = new Date(epoch * 1000)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`relative flex transition-all duration-500 ease-in-out shrink-0 h-full ${isOpen ? 'w-80' : 'w-0'}`}>
      
      {/* Dynamic Slide Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-6 -left-4 z-40 bg-white border border-slate-200 rounded-full p-1.5 shadow-md text-slate-600 hover:text-indigo-650 hover:bg-slate-50 transition-all focus:outline-none"
        title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Sidebar Content Panel */}
      <div className={`h-full w-full bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Database className="w-4.5 h-4.5 text-indigo-400" />
            <span className="font-bold text-sm uppercase tracking-wider">Previous Briefings</span>
          </div>
          <button 
            onClick={fetchHistory}
            className="text-slate-400 hover:text-white transition-colors" 
            title="Refresh history"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Sidebar Body List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
          {loading && history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs font-medium">Fetching history database...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
              <div className="p-3 bg-slate-850 rounded-2xl border border-slate-800 text-slate-600">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No history found</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Runs will automatically appear here once datasets are analyzed.</p>
              </div>
            </div>
          ) : (
            history.map((item) => {
              const isFetchingThis = fetchingDetails === item.id
              return (
                <div
                  key={item.id}
                  onClick={() => !isFetchingThis && handleSelect(item.id)}
                  className={`group relative bg-slate-850 border border-slate-800/80 rounded-xl p-4 cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800 transition-all select-none flex flex-col justify-between gap-2 shadow-sm
                    ${isFetchingThis ? 'opacity-70 pointer-events-none' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 overflow-hidden">
                      <h4 className="text-xs font-bold text-slate-200 capitalize truncate" title={item.objective}>
                        {item.objective.replace('_', ' ')}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatDate(item.created_at)}
                      </p>
                    </div>

                    {/* Delete Trigger */}
                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      title="Delete run"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isFetchingThis && (
                    <div className="absolute inset-0 bg-slate-900/40 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
