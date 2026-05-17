import { Layers, Columns, AlertCircle, Database, Copy, Activity } from 'lucide-react'

export default function KPICards({ summary }) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <MetricCard 
        title="Total Rows" 
        value={summary.total_rows.toLocaleString()} 
        icon={<Layers className="w-5 h-5 text-blue-600" />}
        colorClass="bg-blue-50 border-blue-100"
      />
      <MetricCard 
        title="Duplicate Rows" 
        value={summary.duplicate_rows.toLocaleString()} 
        icon={<Copy className="w-5 h-5 text-slate-600" />}
        colorClass="bg-slate-50 border-slate-200"
      />
      <MetricCard 
        title="Missing Values" 
        value={summary.total_missing.toLocaleString()} 
        icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
        colorClass="bg-amber-50 border-amber-100"
      />
      <MetricCard 
        title="Features" 
        value={summary.total_columns} 
        icon={<Columns className="w-5 h-5 text-emerald-600" />}
        colorClass="bg-emerald-50 border-emerald-100"
      />
      <MetricCard 
        title="Target Candidate" 
        value={summary.target_variable || "None"} 
        icon={<Activity className="w-5 h-5 text-purple-600" />}
        colorClass="bg-purple-50 border-purple-100"
      />
    </div>
  )
}

function MetricCard({ title, value, icon, colorClass }) {
  return (
    <div className={`rounded-xl shadow-sm border p-5 flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300 ${colorClass}`}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <div className="p-2 rounded-lg bg-white/60 backdrop-blur-sm border border-white/20">
          {icon}
        </div>
      </div>
      <h4 className="text-2xl font-bold text-slate-800 truncate" title={String(value)}>
        {value}
      </h4>
    </div>
  )
}
