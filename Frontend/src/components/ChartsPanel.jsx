import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell 
} from 'recharts'
import { BarChart2, Hash, AlertTriangle } from 'lucide-react'

export default function ChartsPanel({ charts }) {
  if (!charts) return null;

  const { histograms, bar_charts, missing_values } = charts;

  // Custom colors for charts
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* 1. Missing Values Chart */}
      {missing_values && missing_values.length > 0 && (
        <ChartCard title="Missing Values per Column" icon={<AlertTriangle className="w-4 h-4" />}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={missing_values} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="missing" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* 2. Numerical Distributions (Histograms) */}
      {Object.entries(histograms).map(([colName, data], index) => (
        <ChartCard key={`hist-${colName}`} title={`Distribution: ${colName}`} icon={<Hash className="w-4 h-4" />}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" angle={-30} textAnchor="end" height={50} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      ))}

      {/* 3. Categorical Distributions (Bar Charts) */}
      {Object.entries(bar_charts).map(([colName, data], index) => (
        <ChartCard key={`bar-${colName}`} title={`Categories: ${colName}`} icon={<BarChart2 className="w-4 h-4" />}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 40 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" fill={COLORS[(index + 2) % COLORS.length]} radius={[0, 4, 4, 0]}>
                {data.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[(index + i) % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      ))}
    </div>
  )
}

function ChartCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[400px]">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
        <div className="text-slate-400">{icon}</div>
        <h4 className="font-semibold text-slate-800 text-sm truncate">{title}</h4>
      </div>
      <div className="p-4 flex-1">
        {children}
      </div>
    </div>
  )
}
