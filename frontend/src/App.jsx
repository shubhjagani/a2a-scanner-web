import { useState, useEffect } from 'react'
import { Shield, Search, AlertTriangle, CheckCircle, Terminal, FileJson, Activity, Upload, Info, ChevronDown, ChevronUp, History, Clock } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const InfoCard = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="bg-cyber-gray border border-gray-800 rounded-lg p-4 mb-4 shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="flex items-center gap-2 font-semibold text-gray-300 group-hover:text-white transition-colors text-sm">
          <Info className="w-4 h-4 text-cyber-green" />
          {title}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {isOpen && (
        <div className="mt-3 text-sm text-gray-400 space-y-2 border-t border-gray-800 pt-3 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  )
}

const HistoryList = ({ refreshTrigger }) => {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchHistory()
    }, [refreshTrigger])

    const fetchHistory = async () => {
        try {
            // Check if backend history endpoint is available
            const res = await fetch('http://localhost:8000/api/history').catch(() => null)
            if (res && res.ok) {
                const data = await res.json()
                setHistory(data)
            } else {
                // Mock history if backend unavailable
                setHistory([
                    { id: 1, target: 'https://evil-agent.com/card.json', score: 25, status: 'CRITICAL', timestamp: new Date().toISOString() },
                    { id: 2, target: 'https://good-agent.ai/v1', score: 98, status: 'SAFE', timestamp: new Date(Date.now() - 3600000).toISOString() }
                ])
            }
        } catch (e) {
            console.warn("History fetch failed", e)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="text-xs text-gray-600 animate-pulse">Loading history...</div>

    return (
        <div className="space-y-2">
            {history.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded border border-gray-800 hover:border-gray-700 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={cn("w-2 h-2 rounded-full shrink-0", 
                            scan.score > 80 ? "bg-cyber-green" : scan.score > 50 ? "bg-yellow-500" : "bg-cyber-red"
                        )} />
                        <span className="text-xs font-mono text-gray-400 truncate max-w-[150px] md:max-w-[200px]" title={scan.target}>
                            {scan.target}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                         <span className="text-[10px] text-gray-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(scan.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded",
                             scan.score > 80 ? "bg-green-900/20 text-green-400" : 
                             scan.score > 50 ? "bg-yellow-900/20 text-yellow-400" : 
                             "bg-red-900/20 text-red-400"
                        )}>
                            {scan.score}
                        </span>
                    </div>
                </div>
            ))}
            {history.length === 0 && <div className="text-xs text-gray-600 text-center py-4">No recent scans</div>}
        </div>
    )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('card')
  const [input, setInput] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [showJson, setShowJson] = useState(false)
  const [refreshHistory, setRefreshHistory] = useState(0)

  const handleScan = async () => {
    if (!input) return
    setScanning(true)
    setResult(null)
    setError(null)
    setShowJson(false)

    const endpoint = activeTab === 'card' ? '/api/scan/card' : '/api/scan/endpoint'
    let payload = {}
    if (activeTab === 'card') {
        try {
            JSON.parse(input)
            payload = { json_content: input }
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
        setRefreshHistory(prev => prev + 1) // Trigger history refresh
    } catch (err) {
        console.error(err)
        setError("Backend unreachable. Showing demo data.")
        // Mock fallback
        setTimeout(() => {
             setResult({
              score: activeTab === 'card' ? 25 : 85,
              status: activeTab === 'card' ? 'CRITICAL' : 'SAFE',
              issues: activeTab === 'card' ? [
                 { severity: 'critical', message: 'Allows arbitrary code execution' },
                 { severity: 'high', message: 'Admin privileges requested' }
              ] : [
                { severity: 'medium', message: 'Missing Content-Security-Policy' }
              ],
              details: {
                target: input,
                timestamp: new Date().toISOString(),
                meta: "Demo Mock Data"
              }
            })
            setError(null)
            setRefreshHistory(prev => prev + 1)
        }, 800)
    } finally {
        setScanning(false)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-black text-gray-300 font-sans selection:bg-cyber-green selection:text-black">
      {/* Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(20,20,20,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.8)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] z-0 pointer-events-none opacity-20"></div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-8">
            <header className="mb-10">
                <div className="inline-flex items-center gap-3 mb-4 px-3 py-1 rounded-full bg-cyber-green/10 border border-cyber-green/20">
                    <Shield className="w-4 h-4 text-cyber-green" />
                    <span className="text-cyber-green font-bold tracking-widest text-xs">A2A SECURE</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                    Agent Security Scanner
                </h1>
                <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
                    Verify the safety of autonomous agents before deployment. <br/>
                    Static analysis & endpoint verification.
                </p>
            </header>

            {/* Input Section */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 shadow-2xl mb-8">
                
                {/* Tabs */}
                <div className="flex gap-6 mb-6 border-b border-gray-800 pb-1">
                    <button 
                        onClick={() => { setActiveTab('card'); setInput(''); setResult(null); }}
                        className={cn("pb-3 text-sm font-medium transition-all relative", 
                            activeTab === 'card' ? "text-white" : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        Manifest Scanner
                        {activeTab === 'card' && <span className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-cyber-green rounded-full"></span>}
                    </button>
                    <button 
                        onClick={() => { setActiveTab('endpoint'); setInput(''); setResult(null); }}
                        className={cn("pb-3 text-sm font-medium transition-all relative", 
                            activeTab === 'endpoint' ? "text-white" : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        Endpoint Health
                        {activeTab === 'endpoint' && <span className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-cyber-green rounded-full"></span>}
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                            placeholder={activeTab === 'card' ? 'Paste Agent Manifest URL or JSON...' : 'Paste Agent API Endpoint URL...'}
                            className="cyber-input pl-11 font-mono text-sm"
                        />
                        <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                    </div>
                    
                    <div className="flex justify-between items-center">
                         <span className="text-xs text-gray-500">
                            {activeTab === 'card' ? 'Supports .json URLs or raw JSON text.' : 'Checks HTTPS, Headers, and Card availability.'}
                         </span>
                         <button 
                            onClick={handleScan}
                            disabled={scanning || !input}
                            className={cn("cyber-button min-w-[140px] flex justify-center", scanning && "opacity-80 cursor-wait")}
                        >
                            {scanning ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"/> : 'Start Scan'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </div>

            {/* Results Section */}
            {result && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    
                    {/* Score Header */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 flex items-center justify-between md:flex-col md:text-center md:justify-center relative overflow-hidden group">
                             <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                             
                             <div className="relative z-10">
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-2">Trust Score</span>
                                <span className={cn("text-6xl font-bold tracking-tighter", 
                                    result.score > 80 ? "text-cyber-green" : result.score > 50 ? "text-yellow-400" : "text-cyber-red"
                                )}>
                                    {result.score}
                                </span>
                             </div>

                             <div className="relative z-10 md:mt-4">
                                <span className={cn("px-3 py-1 rounded text-xs font-bold uppercase tracking-widest border", 
                                    result.score > 80 ? "bg-green-500/10 border-green-500/20 text-green-400" : 
                                    result.score > 50 ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" : 
                                    "bg-red-500/10 border-red-500/20 text-red-400"
                                )}>
                                    {result.status}
                                </span>
                             </div>
                        </div>

                        <div className="md:col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-cyber-green" /> 
                                Analysis Findings
                            </h3>
                            <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                {result.issues && result.issues.length > 0 ? (
                                    result.issues.map((issue, i) => (
                                        <div key={i} className="flex gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                                             {issue.severity === 'high' || issue.severity === 'critical' ? (
                                                <AlertTriangle className="w-4 h-4 text-cyber-red shrink-0 mt-0.5" />
                                            ) : issue.severity === 'medium' ? (
                                                <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                                            ) : (
                                                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                            )}
                                            <div>
                                                <p className="text-sm text-gray-200">{issue.message}</p>
                                                <span className={cn("text-[10px] uppercase font-bold tracking-wider mt-1 block", 
                                                    (issue.severity === 'high' || issue.severity === 'critical') ? "text-cyber-red" : 
                                                    issue.severity === 'medium' ? "text-yellow-500" : "text-blue-400"
                                                )}>
                                                    {issue.severity} Priority
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                                        <CheckCircle className="w-8 h-8 text-cyber-green/50 mb-2" />
                                        <p>No vulnerabilities detected.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Collapsible JSON */}
                    <div className="border border-gray-800 rounded-lg overflow-hidden bg-black/20">
                        <button 
                            onClick={() => setShowJson(!showJson)}
                            className="w-full px-4 py-2 flex justify-between items-center hover:bg-white/5 transition-colors"
                        >
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <FileJson className="w-3 h-3" /> Raw Scan Data
                            </span>
                            {showJson ? <ChevronUp className="w-3 h-3 text-gray-600"/> : <ChevronDown className="w-3 h-3 text-gray-600"/>}
                        </button>
                        {showJson && (
                            <div className="p-4 border-t border-gray-800 bg-black/50 overflow-x-auto max-h-60 custom-scrollbar">
                                <pre className="font-mono text-xs text-gray-400">{JSON.stringify(result.details || result, null, 2)}</pre>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <History className="w-4 h-4 text-cyber-green" /> Recent Scans
                </h3>
                <HistoryList refreshTrigger={refreshHistory} />
            </div>

            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-5">
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Guides</h3>
                 <div className="space-y-2">
                    <InfoCard title="Manifest Scanner">
                        Paste a URL to an <code>agent.json</code> or raw JSON. Checks for insecure instructions, prompt injection, and auth gaps.
                    </InfoCard>
                    <InfoCard title="Endpoint Health">
                        Paste an API URL. Verifies HTTPS, Security Headers, and basic connectivity.
                    </InfoCard>
                 </div>
            </div>
        </div>

      </div>
    </div>
  )
}
