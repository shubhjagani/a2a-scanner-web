import { useState, useEffect } from 'react'
import { Shield, Search, AlertTriangle, CheckCircle, Terminal, FileJson, Info, ChevronDown, ChevronUp, History, Clock, Lock, Zap } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/* Animated wire background SVG */
const WireBackground = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wire-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0400F5" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#49C2C1" stopOpacity="0.6" />
      </linearGradient>
    </defs>
    <path d="M0,100 Q200,50 400,120 T800,80" fill="none" stroke="url(#wire-grad)" strokeWidth="1.5" className="wire-line" />
    <path d="M0,200 Q300,150 500,220 T1000,180" fill="none" stroke="url(#wire-grad)" strokeWidth="1" className="wire-line" style={{animationDelay: '0.5s'}} />
    <path d="M0,300 Q150,250 350,320 T700,280" fill="none" stroke="url(#wire-grad)" strokeWidth="1" className="wire-line" style={{animationDelay: '1s'}} />
    <path d="M200,0 Q250,200 300,400 T350,600" fill="none" stroke="url(#wire-grad)" strokeWidth="0.8" className="wire-line" style={{animationDelay: '1.5s'}} />
    <path d="M600,0 Q550,150 620,300 T580,500" fill="none" stroke="url(#wire-grad)" strokeWidth="0.8" className="wire-line" style={{animationDelay: '2s'}} />
  </svg>
)

const InfoCard = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="bg-gen-charcoal/60 border border-gen-gray1/20 rounded-lg p-4 mb-4 shadow-sm backdrop-blur-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="flex items-center gap-2 font-semibold text-gen-gray3 group-hover:text-white transition-colors text-sm">
          <Info className="w-4 h-4 text-gen-turquoise" />
          {title}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gen-gray2" /> : <ChevronDown className="w-4 h-4 text-gen-gray2" />}
      </button>
      {isOpen && (
        <div className="mt-3 text-sm text-gen-gray2 space-y-2 border-t border-gen-gray1/20 pt-3 leading-relaxed">
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
            const res = await fetch('/api/history').catch(() => null)
            if (res && res.ok) {
                const data = await res.json()
                setHistory(data)
            } else {
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

    if (loading) return <div className="text-xs text-gen-gray2 animate-pulse">Loading history...</div>

    return (
        <div className="space-y-2">
            {history.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-3 bg-gen-charcoal/40 rounded-lg border border-gen-gray1/15 hover:border-gen-turquoise/30 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={cn("w-2 h-2 rounded-full shrink-0", 
                            scan.score > 80 ? "bg-gen-turquoise" : scan.score > 50 ? "bg-yellow-500" : "bg-cyber-red"
                        )} />
                        <span className="text-xs font-mono text-gen-gray2 truncate max-w-[150px] md:max-w-[200px]" title={scan.target}>
                            {scan.target}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                         <span className="text-[10px] text-gen-gray1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(scan.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded",
                             scan.score > 80 ? "bg-gen-turquoise/10 text-gen-turquoise" : 
                             scan.score > 50 ? "bg-yellow-500/10 text-yellow-400" : 
                             "bg-red-500/10 text-red-400"
                        )}>
                            {scan.score}
                        </span>
                    </div>
                </div>
            ))}
            {history.length === 0 && <div className="text-xs text-gen-gray1 text-center py-4">No recent scans</div>}
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
        try { JSON.parse(input); payload = { json_content: input } } catch { payload = { url: input } }
    } else {
        payload = { url: input }
    }

    try {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!res.ok) throw new Error('Scan failed')
        const data = await res.json()
        setResult(data)
        setRefreshHistory(prev => prev + 1)
    } catch (err) {
        console.error(err)
        setError("Backend unreachable. Showing demo data.")
        setTimeout(() => {
             setResult({
              score: activeTab === 'card' ? 25 : 85,
              status: activeTab === 'card' ? 'CRITICAL' : 'SAFE',
              issues: activeTab === 'card' ? [
                 { severity: 'critical', message: 'Allows arbitrary code execution' },
                 { severity: 'high', message: 'Admin privileges requested' }
              ] : [{ severity: 'medium', message: 'Missing Content-Security-Policy' }],
              details: { target: input, timestamp: new Date().toISOString(), meta: "Demo Mock Data" }
            })
            setError(null)
            setRefreshHistory(prev => prev + 1)
        }, 800)
    } finally { setScanning(false) }
  }

  return (
    <div className="min-h-screen bg-gen-charcoal text-gen-gray3 font-sans selection:bg-gen-blue/30 selection:text-white relative overflow-hidden">
      {/* Orb backgrounds */}
      <div className="orb orb-blue w-[500px] h-[500px] -top-40 -right-40" style={{animation: 'float 25s ease-in-out infinite, pulse-glow 8s ease-in-out infinite'}}></div>
      <div className="orb orb-turquoise w-[400px] h-[400px] top-1/3 -left-40" style={{animation: 'float 20s ease-in-out infinite reverse, pulse-glow 6s ease-in-out infinite 2s'}}></div>
      <div className="orb orb-blue w-[300px] h-[300px] bottom-20 right-1/4" style={{animation: 'float 22s ease-in-out infinite 3s, pulse-glow 10s ease-in-out infinite 4s'}}></div>
      
      {/* Wire animation background */}
      <WireBackground />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-8">
            <header className="mb-12">
                {/* Gen Threat Labs branding */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gen-blue to-gen-turquoise flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gen-gray2 tracking-wider uppercase">Gen Threat Labs</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight leading-[1.1]">
                    Agent Trust Hub
                    <span className="block text-gen-turquoise">Security Scanner</span>
                </h1>
                <p className="text-gen-gray2 text-lg max-w-xl leading-relaxed">
                    Verify the safety and integrity of autonomous AI agents before they access your infrastructure.
                </p>
                
                {/* Feature pills */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gen-blue/10 border border-gen-blue/20 text-gen-blue-tint text-xs font-medium">
                    <Lock className="w-3 h-3" /> Static Analysis
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gen-turquoise/10 border border-gen-turquoise/20 text-gen-turquoise text-xs font-medium">
                    <Zap className="w-3 h-3" /> Endpoint Verification
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gen-blue/10 border border-gen-blue/20 text-gen-blue-tint text-xs font-medium">
                    <Shield className="w-3 h-3" /> Trust Scoring
                  </div>
                </div>
            </header>

            {/* Input Section */}
            <div className="bg-gen-charcoal/60 backdrop-blur-xl border border-gen-gray1/20 rounded-2xl p-6 shadow-2xl shadow-gen-blue/5 mb-8">
                
                <div className="flex gap-6 mb-6 border-b border-gen-gray1/20 pb-1">
                    <button 
                        onClick={() => { setActiveTab('card'); setInput(''); setResult(null); }}
                        className={cn("pb-3 text-sm font-medium transition-all relative", 
                            activeTab === 'card' ? "text-white" : "text-gen-gray1 hover:text-gen-gray3"
                        )}
                    >
                        Manifest Scanner
                        {activeTab === 'card' && <span className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-gradient-to-r from-gen-blue to-gen-turquoise rounded-full"></span>}
                    </button>
                    <button 
                        onClick={() => { setActiveTab('endpoint'); setInput(''); setResult(null); }}
                        className={cn("pb-3 text-sm font-medium transition-all relative", 
                            activeTab === 'endpoint' ? "text-white" : "text-gen-gray1 hover:text-gen-gray3"
                        )}
                    >
                        Endpoint Health
                        {activeTab === 'endpoint' && <span className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-gradient-to-r from-gen-blue to-gen-turquoise rounded-full"></span>}
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
                            className="gen-input pl-11 font-mono text-sm"
                        />
                        <Search className="absolute left-4 top-3.5 w-4 h-4 text-gen-gray1" />
                    </div>
                    
                    <div className="flex justify-between items-center">
                         <span className="text-xs text-gen-gray1">
                            {activeTab === 'card' ? 'Supports .json URLs or raw JSON text.' : 'Checks HTTPS, Headers, and Card availability.'}
                         </span>
                         <button 
                            onClick={handleScan}
                            disabled={scanning || !input}
                            className={cn("gen-button min-w-[140px] flex justify-center", scanning && "opacity-80 cursor-wait")}
                        >
                            {scanning ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Start Scan'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </div>

            {/* Results */}
            {result && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gen-charcoal/60 backdrop-blur-xl border border-gen-gray1/20 rounded-2xl p-6 flex items-center justify-between md:flex-col md:text-center md:justify-center relative overflow-hidden group">
                             <div className="absolute inset-0 bg-gradient-to-br from-gen-blue/5 to-gen-turquoise/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                             <div className="relative z-10">
                                <span className="text-gen-gray1 text-xs font-bold uppercase tracking-wider block mb-2">Trust Score</span>
                                <span className={cn("text-6xl font-extrabold tracking-tighter", 
                                    result.score > 80 ? "text-gen-turquoise" : result.score > 50 ? "text-yellow-400" : "text-cyber-red"
                                )}>
                                    {result.score}
                                </span>
                             </div>
                             <div className="relative z-10 md:mt-4">
                                <span className={cn("px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest border", 
                                    result.score > 80 ? "bg-gen-turquoise/10 border-gen-turquoise/20 text-gen-turquoise" : 
                                    result.score > 50 ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" : 
                                    "bg-red-500/10 border-red-500/20 text-red-400"
                                )}>
                                    {result.status}
                                </span>
                             </div>
                        </div>

                        <div className="md:col-span-2 bg-gen-charcoal/60 backdrop-blur-xl border border-gen-gray1/20 rounded-2xl p-6">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-gen-turquoise" /> 
                                Analysis Findings
                            </h3>
                            <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                {result.issues && result.issues.length > 0 ? (
                                    result.issues.map((issue, i) => (
                                        <div key={i} className="flex gap-3 p-3 rounded-lg bg-gen-charcoal/40 border border-gen-gray1/10">
                                             {issue.severity === 'high' || issue.severity === 'critical' ? (
                                                <AlertTriangle className="w-4 h-4 text-cyber-red shrink-0 mt-0.5" />
                                            ) : issue.severity === 'medium' ? (
                                                <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                                            ) : (
                                                <Info className="w-4 h-4 text-gen-blue-tint shrink-0 mt-0.5" />
                                            )}
                                            <div>
                                                <p className="text-sm text-gen-gray3">{issue.message}</p>
                                                <span className={cn("text-[10px] uppercase font-bold tracking-wider mt-1 block", 
                                                    (issue.severity === 'high' || issue.severity === 'critical') ? "text-cyber-red" : 
                                                    issue.severity === 'medium' ? "text-yellow-500" : "text-gen-blue-tint"
                                                )}>
                                                    {issue.severity} Priority
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-32 text-gen-gray1">
                                        <CheckCircle className="w-8 h-8 text-gen-turquoise/50 mb-2" />
                                        <p>No vulnerabilities detected.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border border-gen-gray1/20 rounded-lg overflow-hidden bg-gen-charcoal/40 backdrop-blur-sm">
                        <button 
                            onClick={() => setShowJson(!showJson)}
                            className="w-full px-4 py-2 flex justify-between items-center hover:bg-white/5 transition-colors"
                        >
                            <span className="text-xs font-bold text-gen-gray1 uppercase tracking-wider flex items-center gap-2">
                                <FileJson className="w-3 h-3" /> Raw Scan Data
                            </span>
                            {showJson ? <ChevronUp className="w-3 h-3 text-gen-gray1"/> : <ChevronDown className="w-3 h-3 text-gen-gray1"/>}
                        </button>
                        {showJson && (
                            <div className="p-4 border-t border-gen-gray1/20 bg-gen-charcoal/60 overflow-x-auto max-h-60 custom-scrollbar">
                                <pre className="font-mono text-xs text-gen-gray2">{JSON.stringify(result.details || result, null, 2)}</pre>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-gen-charcoal/60 backdrop-blur-xl border border-gen-gray1/20 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <History className="w-4 h-4 text-gen-turquoise" /> Recent Scans
                </h3>
                <HistoryList refreshTrigger={refreshHistory} />
            </div>

            <div className="bg-gen-charcoal/60 backdrop-blur-xl border border-gen-gray1/20 rounded-2xl p-5">
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Guides</h3>
                 <div className="space-y-2">
                    <InfoCard title="Manifest Scanner">
                        Paste a URL to an <code className="text-gen-turquoise">agent.json</code> or raw JSON. Checks for insecure instructions, prompt injection, and auth gaps.
                    </InfoCard>
                    <InfoCard title="Endpoint Health">
                        Paste an API URL. Verifies HTTPS, Security Headers, and basic connectivity.
                    </InfoCard>
                 </div>
            </div>
        </div>

      </div>
      
      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-gen-gray1/20">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-gen-blue to-gen-turquoise flex items-center justify-center">
            <Shield className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs text-gen-gray2 font-medium">Gen Threat Labs</span>
        </div>
        <p className="text-xs text-gen-gray1">© {new Date().getFullYear()} Gen Digital Inc. All rights reserved.</p>
      </footer>
    </div>
  )
}
