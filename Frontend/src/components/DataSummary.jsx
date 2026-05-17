import { Layers, Columns, AlertCircle, Database } from 'lucide-react'

export default function DataSummary({ data }) {
  if (!data) return null;

  const { rows, columns, datatypes, missing_values, sample_preview } = data;
  const sampleHeaders = sample_preview.length > 0 ? Object.keys(sample_preview[0]) : [];

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Rows" 
          value={rows.toLocaleString()} 
          icon={<Layers className="w-5 h-5 text-blue-600" />}
          colorClass="bg-blue-50 border-blue-100"
        />
        <MetricCard 
          title="Total Columns" 
          value={columns.toLocaleString()} 
          icon={<Columns className="w-5 h-5 text-emerald-600" />}
          colorClass="bg-emerald-50 border-emerald-100"
        />
        <MetricCard 
          title="Total Missing Values" 
          value={Object.values(missing_values).reduce((a, b) => a + b, 0).toLocaleString()} 
          icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
          colorClass="bg-amber-50 border-amber-100"
        />
        <MetricCard 
          title="Features Detected" 
          value={Object.keys(datatypes).length} 
          icon={<Database className="w-5 h-5 text-purple-600" />}
          colorClass="bg-purple-50 border-purple-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden col-span-1">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h4 className="font-semibold text-slate-800">Column Schema</h4>
          </div>
          <div className="p-0 max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-white sticky top-0 shadow-sm">
                <tr>
                  <th className="px-6 py-3 font-medium">Column</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Missing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.keys(datatypes).map((col) => (
                  <tr key={col} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-700">{col}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                        {datatypes[col]}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {missing_values[col] > 0 ? (
                        <span className="text-red-600 font-medium">{missing_values[col]}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden col-span-1 lg:col-span-2">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h4 className="font-semibold text-slate-800">Sample Preview (Top 5)</h4>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-500 uppercase bg-white">
                <tr>
                  {sampleHeaders.map(header => (
                    <th key={header} className="px-6 py-3 font-medium">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sample_preview.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    {sampleHeaders.map(header => (
                      <td key={`${idx}-${header}`} className="px-6 py-3 text-slate-600">
                        {row[header] === null ? (
                          <span className="text-slate-400 italic">null</span>
                        ) : (
                          String(row[header])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, colorClass }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4 transition-transform hover:-translate-y-1 duration-300">
      <div className={`p-3 rounded-lg border ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
      </div>
    </div>
  )
}
