import { useState } from 'react'
import { Shield, Search, AlertTriangle, CheckCircle, Terminal, FileJson, Activity, Upload, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const InfoCard = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="bg-cyber-gray border border-gray-800 rounded-lg p-4 mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 font-bold text-gray-300">
          <Info className="w-4 h-4 text-cyber-green" />
          {title}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && (
        <div className="mt-3 text-sm text-gray-400 space-y-2 border-t border-gray-800 pt-3">
          {children}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('card') // 'card' | 'endpoint'
  const [input, setInput] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleScan = async () => {
    if (!input) return
    setScanning(true)
    setResult(null)
    setError(null)

    const endpoint = activeTab === 'card' ? '/scan/card' : '/scan/endpoint'
    
    // Determine if input is JSON or URL
    let payload = {}
    if (activeTab === 'card') {
        try {
            const parsedJson = JSON.parse(input)
            payload = { json_payload: parsedJson }
        } catch {
            payload = { url: input }
        }
    } else {
        payload = { url: input }
    }

    try {
        const res = await fetch(`http://localhost:8000${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        
        if (!res.ok) throw new Error('Scan failed')
        
        const data = await res.json()
        setResult(data)
    } catch (err) {
        console.error(err)
        // Fallback mock for demo if backend is offline
        setError("Backend unreachable. Showing demo data.")
        setTimeout(() => {
             setResult({
              score: 85,
              status: 'SAFE',
              issues: [
                { severity: 'medium', message: 'Demo: Missing "Rate-Limit" headers' },
                { severity: 'low', message: 'Demo: Description field is too short' }
              ],
              details: {
                url: input,
                timestamp: new Date().toISOString(),
                ssl: true,
                note: "This is mock data because the backend is offline."
              }
            })
            setError(null)
        }, 1000)
    } finally {
        setScanning(false)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-black text-gray-300 p-4 md:p-8 font-mono relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0.8)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] z-0 pointer-events-none opacity-20"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-8 text-center">
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
              onClick={() => { setActiveTab('card'); setInput(''); setResult(null); }}
              className={cn(
                "px-6 py-2 rounded flex items-center gap-2 transition-all",
                activeTab === 'card' ? "bg-gray-800 text-white shadow-lg border border-gray-700" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <FileJson className="w-4 h-4" /> Agent Card
            </button>
            <button 
              onClick={() => { setActiveTab('endpoint'); setInput(''); setResult(null); }}
              className={cn(
                "px-6 py-2 rounded flex items-center gap-2 transition-all",
                activeTab === 'endpoint' ? "bg-gray-800 text-white shadow-lg border border-gray-700" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <Activity className="w-4 h-4" /> Live Endpoint
            </button>
          </div>
        </div>

        {/* Help / Context */}
        <div className="mb-6">
            {activeTab === 'card' ? (
                <InfoCard title="How to use: Agent Card Scanner">
                    <p><strong>What is it?</strong> Checks the manifest file (JSON) of an AI Agent for malicious instructions, prompt injection, or insecure configurations.</p>
                    <p><strong>Input:</strong> Paste a URL to an <code>agent.json</code> file, or paste the raw JSON content directly.</p>
                    <p><strong>Output:</strong> A Risk Score (0-100) and a list of detected vulnerabilities.</p>
                </InfoCard>
            ) : (
                <InfoCard title="How to use: Live Endpoint Scanner">
                    <p><strong>What is it?</strong> Pings a running Agent API to verify its network security posture.</p>
                    <p><strong>Input:</strong> The base URL of the agent's API (e.g., <code>https://api.agent.ai/v1</code>).</p>
                    <p><strong>Checks:</strong> HTTPS encryption, Security Headers (HSTS, X-Content-Type), and presence of a valid agent card.</p>
                </InfoCard>
            )}
        </div>

        {/* Input Area */}
        <div className="bg-cyber-gray border border-gray-800 rounded-xl p-6 shadow-2xl mb-8">
          <label className="block text-xs uppercase text-gray-500 mb-2 font-bold tracking-wider">
            {activeTab === 'card' ? 'Agent Manifest (URL or JSON)' : 'Agent API Endpoint (URL)'}
          </label>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={activeTab === 'card' ? 'https://.../agent.json or {"name": "..."}' : 'https://api.agent.ai/v1'}
                className="cyber-input pl-10 h-12 font-mono text-sm"
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
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {error}
            </div>
          )}
        </div>

        {/* Results Area */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Score Card */}
                <div className="bg-cyber-gray border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none"></div>
                    <span className="text-gray-500 text-xs uppercase tracking-wider mb-4 font-bold">Security Score</span>
                    
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        {/* Background Circle */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="70" stroke="#1a1a1a" strokeWidth="12" fill="none" />
                            {/* Progress Circle */}
                            <circle 
                                cx="80" cy="80" r="70" 
                                stroke={result.score > 80 ? "#00ff41" : result.score > 50 ? "#fbbf24" : "#ff003c"} 
                                strokeWidth="12" 
                                fill="none" 
                                strokeDasharray="439.8" 
                                strokeDashoffset={439.8 - (439.8 * result.score) / 100} 
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out" 
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className={cn("text-5xl font-bold tracking-tighter", result.score > 80 ? "text-cyber-green" : result.score > 50 ? "text-yellow-400" : "text-cyber-red")}>
                                {result.score}
                            </span>
                            <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">/100</span>
                        </div>
                    </div>
                    
                    <span className={cn("mt-6 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-widest border", 
                        result.score > 80 ? "bg-green-900/20 border-green-500/30 text-green-400" : 
                        result.score > 50 ? "bg-yellow-900/20 border-yellow-500/30 text-yellow-400" : 
                        "bg-red-900/20 border-red-500/30 text-red-400"
                    )}>
                        {result.status}
                    </span>
                </div>

                {/* Issues List */}
                <div className="md:col-span-2 bg-cyber-gray border border-gray-800 rounded-xl p-6 relative">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-gray-800 pb-4">
                        <Terminal className="w-5 h-5 text-cyber-green" /> 
                        Analysis Report
                    </h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {result.issues && result.issues.length > 0 ? (
                            result.issues.map((issue, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-black/40 rounded border border-gray-800/50 hover:border-gray-700 transition-colors">
                                    {issue.severity === 'high' || issue.severity === 'critical' ? (
                                        <AlertTriangle className="w-5 h-5 text-cyber-red shrink-0 mt-0.5" />
                                    ) : issue.severity === 'medium' ? (
                                        <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                                    ) : (
                                        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-300 font-medium leading-snug">{issue.message}</p>
                                        <span className={cn("text-[10px] uppercase font-bold tracking-wider mt-1 inline-block", 
                                            (issue.severity === 'high' || issue.severity === 'critical') ? "text-cyber-red" : 
                                            issue.severity === 'medium' ? "text-yellow-500" : "text-blue-400"
                                        )}>
                                            {issue.severity} Priority
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                                <CheckCircle className="w-12 h-12 text-cyber-green mb-3 opacity-20" />
                                <p>No security issues detected.</p>
                                <p className="text-xs mt-1 opacity-50">Target appears clean.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Raw JSON Viewer */}
            <div className="border border-gray-800 rounded-lg overflow-hidden">
                <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Raw Scan Data</span>
                    <span className="text-[10px] text-gray-600 font-mono">JSON</span>
                </div>
                <div className="bg-black p-4 font-mono text-xs text-gray-400 overflow-x-auto max-h-60 custom-scrollbar">
                    <pre>{JSON.stringify(result.details || result, null, 2)}</pre>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
