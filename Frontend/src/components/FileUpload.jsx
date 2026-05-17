import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, File, Loader2, Target } from 'lucide-react'
import axios from 'axios'

export default function FileUpload({ setData, setLoading, setError, loading, token }) {
  const [objective, setObjective] = useState('')

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    if (objective.trim()) {
      formData.append('objective', objective.trim())
    }

    try {
      // Pass JWT session authorization
      const response = await axios.post('http://localhost:8000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      })
      setData(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred while uploading the file.')
    } finally {
      setLoading(false)
    }
  }, [setData, setLoading, setError, objective, token])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false
  })

  return (
    <div className="w-full space-y-6">
      {/* Business Objective Input */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 transition-all focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400">
        <label htmlFor="objective" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-500" />
          Business Objective (Optional)
        </label>
        <input
          type="text"
          id="objective"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          disabled={loading}
          placeholder="e.g., Find reasons for customer churn, Forecast sales, etc."
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-colors disabled:opacity-50"
        />
        <p className="mt-2 text-xs text-slate-500">
          Providing a goal allows the AI to perform targeted analysis instead of generic EDA.
        </p>
      </div>

      {/* File Dropzone */}
      <div 
        {...getRootProps()} 
        className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out flex flex-col items-center justify-center p-12 cursor-pointer
          ${isDragActive 
            ? 'border-indigo-500 bg-indigo-50/50 shadow-inner' 
            : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50 shadow-sm hover:shadow-md'
          }
          ${loading ? 'opacity-70 pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {loading ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <Target className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-lg font-medium text-slate-700">Autonomous Agents are working...</p>
          <div className="flex flex-col items-center space-y-1">
             <p className="text-sm text-indigo-600 animate-pulse font-medium">1. Planner Agent designing workflow...</p>
             <p className="text-sm text-slate-400">2. Analytics Engine executing steps...</p>
             <p className="text-sm text-slate-400">3. Recommendation Engine generating insights...</p>
          </div>
        </div>
      ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className={`p-4 rounded-full ${isDragActive ? 'bg-indigo-100' : 'bg-slate-100'}`}>
              <UploadCloud className={`w-10 h-10 ${isDragActive ? 'text-indigo-600' : 'text-slate-500'}`} />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-700">
                {isDragActive ? 'Drop your CSV here' : 'Click or drag a CSV file to upload'}
              </p>
              <p className="text-sm text-slate-500 mt-2 flex items-center justify-center gap-2">
                <File className="w-4 h-4" /> CSV files only
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
