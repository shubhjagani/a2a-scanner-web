import { useState } from 'react'
import { Shield, Search, AlertTriangle, CheckCircle, Terminal, FileJson, Activity, Upload } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export default function App() {
  const [activeTab, setActiveTab] = useState('card') // 'card' | 'endpoint'
  const [input, setInput] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)

  const handleScan = async () => {
    if (!input) return
    setScanning(true)
    setResult(null)

    // Simulate scan delay
    await new Promise(r => setTimeout(r, 2000))

    // Mock Result
    setResult({
      score: 85,
      status: 'SAFE',
      issues: [
        { severity: 'medium', message: 'Missing "Rate-Limit" headers' },
        { severity: 'low', message: 'Description field is too short' }
      ],
      details: {
        url: input,
        timestamp: new Date().toISOString(),
        ssl: true
      }
    })
    setScanning(false)
  }

  return (
    <div className="min-h-screen bg-cyber-black text-gray-300 p-4 md:p-8 font-mono relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0.8)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] z-0 pointer-events-none opacity-20"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-2 border border-cyber-green/30 px-4 py-1 rounded bg-cyber-green-dim">
            <Shield className="w-6 h-6 text-cyber-green" />
            <span className="text-cyber-green font-bold tracking-widest text-sm">A2A SECURE</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 mt-4 tracking-tight">
            Agent Security Scanner
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Static analysis & endpoint verification for AI Agents. 
            Ensure your autonomous systems are secure.
          </p>
        </header>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-cyber-gray p-1 rounded-lg border border-gray-800 inline-flex">
            <button 
              onClick={() => setActiveTab('card')}
              className={cn(
                "px-6 py-2 rounded flex items-center gap-2 transition-all",
                activeTab === 'card' ? "bg-gray-800 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <FileJson className="w-4 h-4" /> Agent Card
            </button>
            <button 
              onClick={() => setActiveTab('endpoint')}
              className={cn(
                "px-6 py-2 rounded flex items-center gap-2 transition-all",
                activeTab === 'endpoint' ? "bg-gray-800 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <Activity className="w-4 h-4" /> Live Endpoint
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-cyber-gray border border-gray-800 rounded-xl p-6 shadow-2xl mb-8">
          <label className="block text-xs uppercase text-gray-500 mb-2 font-bold tracking-wider">
            {activeTab === 'card' ? 'Agent Manifest URL or JSON' : 'Agent API Endpoint'}
          </label>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={activeTab === 'card' ? "https://example.com/agent.json" : "https://api.agent.ai/v1/chat"}
                className="cyber-input pl-10 h-12"
              />
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            </div>
            <button 
              onClick={handleScan}
              disabled={scanning || !input}
              className={cn("cyber-button h-12 flex items-center justify-center gap-2 min-w-[140px]", scanning && "opacity-50 cursor-not-allowed")}
            >
              {scanning ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  SCANNING
                </>
              ) : (
                'SCAN TARGET'
              )}
            </button>
          </div>
          
          {activeTab === 'card' && (
             <div className="mt-4 border-t border-gray-800 pt-4 text-center">
                <span className="text-gray-600 text-sm">Or upload a manifest file directly</span>
                <button className="ml-3 text-sm text-cyber-green hover:underline inline-flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Upload JSON
                </button>
             </div>
          )}
        </div>

        {/* Results Area */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Score Card */}
                <div className="bg-cyber-gray border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <span className="text-gray-500 text-xs uppercase tracking-wider mb-2">Trust Score</span>
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="56" stroke="#333" strokeWidth="8" fill="none" />
                            <circle cx="64" cy="64" r="56" stroke={result.score > 80 ? "#00ff41" : "#ff003c"} strokeWidth="8" fill="none" strokeDasharray="351.86" strokeDashoffset={351.86 - (351.86 * result.score) / 100} className="transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-4xl font-bold text-white">{result.score}</span>
                            <span className="text-xs text-gray-500">/100</span>
                        </div>
                    </div>
                    <span className={cn("mt-4 px-3 py-1 rounded text-xs font-bold uppercase", result.score > 80 ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400")}>
                        {result.status}
                    </span>
                </div>

                {/* Issues List */}
                <div className="md:col-span-2 bg-cyber-gray border border-gray-800 rounded-xl p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-gray-500" /> Analysis Report
                    </h3>
                    <div className="space-y-3">
                        {result.issues.map((issue, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-black/30 rounded border border-gray-800/50">
                                {issue.severity === 'high' ? (
                                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <p className="text-sm text-gray-300">{issue.message}</p>
                                    <span className={cn("text-[10px] uppercase font-bold tracking-wider", issue.severity === 'high' ? "text-red-500" : "text-yellow-500")}>
                                        {issue.severity} Priority
                                    </span>
                                </div>
                            </div>
                        ))}
                        {result.issues.length === 0 && (
                            <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                                <CheckCircle className="w-8 h-8 text-green-500 mb-2 opacity-50" />
                                <p>No issues detected.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Raw JSON Viewer */}
            <div className="bg-black/50 border border-gray-800 rounded-lg p-4 font-mono text-xs text-gray-400 overflow-x-auto">
                <p className="mb-2 text-gray-500 uppercase font-bold text-[10px]">Metadata</p>
                <pre>{JSON.stringify(result.details, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
