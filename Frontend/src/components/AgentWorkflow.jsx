import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Clock, BrainCircuit, Activity, LineChart, FileText, Database, Terminal, Loader2, ShieldCheck, Sparkles } from 'lucide-react'

export default function AgentWorkflow({ plan, agentLogs, onSimulationComplete }) {
  const [visibleLogs, setVisibleLogs] = useState([]);
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(true);
  const terminalEndRef = useRef(null);

  if (!plan || !plan.steps) return null;

  const agents = [
    { id: "Planner", name: "Planner Agent", icon: <BrainCircuit className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-100" },
    { id: "Analytics", name: "Analytics Agent", icon: <Activity className="w-5 h-5" />, color: "text-indigo-600", bg: "bg-indigo-100" },
    { id: "ML", name: "ML Agent", icon: <LineChart className="w-5 h-5" />, color: "text-amber-600", bg: "bg-amber-100" },
    { id: "Reflection", name: "Reflection Agent", icon: <ShieldCheck className="w-5 h-5" />, color: "text-rose-600", bg: "bg-rose-100" },
    { id: "Recommendation", name: "Recommendation Agent", icon: <FileText className="w-5 h-5" />, color: "text-purple-600", bg: "bg-purple-100" }
  ];

  // Simulation effect
  useEffect(() => {
    if (!agentLogs || agentLogs.length === 0) {
      setIsSimulating(false);
      if (onSimulationComplete) onSimulationComplete();
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < agentLogs.length) {
        const log = agentLogs[currentIndex];
        setVisibleLogs(prev => [...prev, log]);
        
        // Infer active agent based on log text
        if (log.includes("[Analytics Agent]")) setCurrentAgentIndex(1);
        else if (log.includes("[ML Agent]")) setCurrentAgentIndex(2);
        else if (log.includes("[Reflection Agent]")) setCurrentAgentIndex(3);
        else if (log.includes("[Recommendation Agent]")) setCurrentAgentIndex(4);
        
        currentIndex++;
      } else {
        clearInterval(interval);
        setCurrentAgentIndex(5); // All done
        setTimeout(() => {
          setIsSimulating(false);
          if (onSimulationComplete) onSimulationComplete();
        }, 1200);
      }
    }, 180); // 180ms per log for visual effect (snappy, realistic scrolling)

    return () => clearInterval(interval);
  }, [agentLogs, onSimulationComplete]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [visibleLogs]);

  const getIconForStep = (step) => {
    switch (step) {
      case 'dataset_summary': return <Database className="w-4 h-4" />;
      case 'correlation_analysis': return <Activity className="w-4 h-4" />;
      case 'segment_analysis': return <LineChart className="w-4 h-4" />;
      case 'recommendation_generation': return <FileText className="w-4 h-4" />;
      default: return <BrainCircuit className="w-4 h-4" />;
    }
  }

  const formatStepName = (step) => {
    return step.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  return (
    <div className="w-full space-y-6 mb-8">
      
      {/* Agent Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {agents.map((agent, idx) => {
          const isCompleted = currentAgentIndex > idx || (!isSimulating && currentAgentIndex === 5);
          const isRunning = currentAgentIndex === idx && isSimulating;
          const isPending = currentAgentIndex < idx && isSimulating;

          return (
            <div key={agent.id} className={`bg-white rounded-xl border p-4 shadow-sm flex items-center justify-between transition-colors duration-300 ${isRunning ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${agent.bg} ${agent.color}`}>
                  {agent.icon}
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">{agent.name}</p>
                  <p className={`font-semibold text-sm ${isRunning ? 'text-indigo-600' : 'text-slate-800'}`}>
                    {isCompleted && "Completed"}
                    {isRunning && "Running"}
                    {isPending && "Pending"}
                  </p>
                </div>
              </div>
              {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {isRunning && <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />}
              {isPending && <Clock className="w-5 h-5 text-slate-300" />}
            </div>
          )
        })}
      </div>

      {/* Execution Plan (Static from Planner) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-800">Autonomous Execution Plan</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-4">
            {plan.steps
              .sort((a, b) => (a.priority || 0) - (b.priority || 0))
              .map((stepObj, index) => {
                const step = typeof stepObj === 'string' ? stepObj : stepObj.task;
                return (
                  <div key={index} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      {getIconForStep(step)}
                      {formatStepName(step)}
                    </span>
                    {index < plan.steps.length - 1 && (
                      <div className="h-px w-4 bg-slate-300 ml-2"></div>
                    )}
                  </div>
                );
            })}
          </div>
        </div>
      </div>

      {/* Agent Logs Terminal */}
      <div className="bg-slate-900 rounded-xl shadow-inner overflow-hidden border border-slate-800">
        <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-mono text-slate-300">Agent Execution Logs & Self-Correction Monitor</span>
          </div>
          {visibleLogs.some(log => log.includes("↻ Retrying")) && (
            <span className="text-rose-400 text-[10px] font-mono animate-pulse flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Autonomous Self-Correction Active
            </span>
          )}
        </div>
        <div className="p-4 h-56 overflow-y-auto font-mono text-xs flex flex-col gap-1.5 text-slate-300 scrollbar-thin scrollbar-thumb-slate-800">
          {visibleLogs.map((log, i) => {
            let colorClass = "text-slate-300";
            if (log.includes("[Planner Agent]")) colorClass = "text-blue-400";
            if (log.includes("[Analytics Agent]")) colorClass = "text-indigo-400";
            if (log.includes("[ML Agent]")) colorClass = "text-amber-400";
            if (log.includes("[Reflection Agent]")) {
              colorClass = log.includes("⚠") ? "text-rose-400 font-semibold bg-rose-950/20 px-2 py-0.5 rounded border border-rose-900/30" : "text-emerald-400 font-semibold";
            }
            if (log.includes("[Recommendation Agent]")) colorClass = "text-purple-400";
            if (log.includes("Error") || log.includes("Failed")) colorClass = "text-red-400 font-bold";

            return (
              <div key={i} className={`animate-in fade-in slide-in-from-left-2 duration-300 flex items-start gap-1.5 ${colorClass}`}>
                <span className="text-slate-600 select-none">{'>'}</span>
                <span>{log}</span>
              </div>
            )
          })}
          <div ref={terminalEndRef} />
          {isSimulating && (
            <div className="animate-pulse text-slate-500 mt-1">
              <span className="mr-2">{'>'}</span>_
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
