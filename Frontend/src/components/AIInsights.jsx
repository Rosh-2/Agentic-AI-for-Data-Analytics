import { Sparkles } from 'lucide-react'

export default function AIInsights({ insights, intent }) {
  if (!insights) return null;

  // Since insights might contain markdown bullet points from Groq, 
  // we can simply split by newline and render it cleanly if we don't have a markdown parser.
  const lines = insights.split('\n').filter(line => line.trim().length > 0);
  
  const isGoalBased = intent && intent.task !== 'general_eda';
  const title = isGoalBased ? "Goal-Based AI Insights" : "AI Generated Insights";

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-xl border border-indigo-500/30 overflow-hidden relative mb-8">
      {/* Decorative background blur */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"></div>

      <div className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-400/30">
            <Sparkles className="w-5 h-5 text-indigo-300" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
        </div>

        <div className="space-y-4">
          {lines.map((line, idx) => {
            // Very simple markdown cleanup for bullet points
            const cleanLine = line.replace(/^[\*\-\#]+\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1');
            if (line.includes('GROQ_API_KEY is not set') || line.includes('Failed to generate')) {
               return (
                 <div key={idx} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm">
                   {cleanLine}
                 </div>
               )
            }
            return (
              <div key={idx} className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                 <div className="min-w-2 mt-2 w-2 h-2 rounded-full bg-indigo-400"></div>
                 <p className="text-indigo-50 text-sm leading-relaxed">{cleanLine}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
