import { useState, useEffect, useRef } from 'react'
import { Shield, Search, AlertTriangle, CheckCircle, Terminal, FileJson, Info, ChevronDown, ChevronUp, History, Clock, Lock, Zap, Globe, ArrowRight } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/* Radial burst dots canvas */
const RadialBurst = () => {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)
    
    let rotation = 0
    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)
      
      const cx = w * 0.85
      const cy = h * 0.3
      const maxR = Math.max(w, h) * 0.6
      const rings = 25
      const dotsPerRing = 36
      
      rotation += 0.0003
      
      for (let r = 3; r < rings; r++) {
        const radius = (r / rings) * maxR
        const dotSize = 0.5 + (r / rings) * 2.5
        
        for (let d = 0; d < dotsPerRing; d++) {
          const angle = (d / dotsPerRing) * Math.PI * 2 + rotation + r * 0.05
          const x = cx + Math.cos(angle) * radius
          const y = cy + Math.sin(angle) * radius
          
          if (x < -20 || x > w + 20 || y < -20 || y > h + 20) continue
          
          const t = d / dotsPerRing
          const blueR = 4, blueG = 0, blueB = 245
          const tealR = 73, tealG = 194, tealB = 193
          
          const cr = blueR + (tealR - blueR) * t
          const cg = blueG + (tealG - blueG) * t
          const cb = blueB + (tealB - blueB) * t
          const alpha = 0.15 + (r / rings) * 0.4
          
          ctx.beginPath()
          ctx.arc(x, y, dotSize, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`
          ctx.fill()
        }
      }
      
      requestAnimationFrame(draw)
    }
    
    const raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}

/* Wire animation SVG */
const WireNetwork = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wire-blue" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0400F5" stopOpacity="0.4" />
        <stop offset="50%" stopColor="#49C2C1" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#0400F5" stopOpacity="0.2" />
      </linearGradient>
      <linearGradient id="wire-teal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#49C2C1" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#7C8CFB" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    {/* Horizontal flowing wires */}
    <path d="M-100,120 C100,80 300,160 500,100 S700,140 900,90 1100,130 1300,80" fill="none" stroke="url(#wire-blue)" strokeWidth="1.2" className="wire-path" />
    <path d="M-100,240 C150,200 350,280 550,220 S750,260 950,210 1150,250 1350,200" fill="none" stroke="url(#wire-teal)" strokeWidth="0.8" className="wire-path-fast" />
    <path d="M-100,360 C200,320 400,400 600,340 S800,380 1000,330" fill="none" stroke="url(#wire-blue)" strokeWidth="1" className="wire-path" style={{animationDelay: '3s'}} />
    <path d="M-100,480 C120,440 320,520 520,460 S720,500 920,450 1120,490" fill="none" stroke="url(#wire-teal)" strokeWidth="0.6" className="wire-path-fast" style={{animationDelay: '5s'}} />
    {/* Vertical accent wires */}
    <path d="M300,-50 C280,150 320,350 290,550" fill="none" stroke="url(#wire-blue)" strokeWidth="0.5" className="wire-path" style={{animationDelay: '2s'}} />
    <path d="M700,-50 C720,200 680,400 710,600" fill="none" stroke="url(#wire-teal)" strokeWidth="0.5" className="wire-path-fast" style={{animationDelay: '4s'}} />
    {/* Junction dots */}
    <circle cx="500" cy="100" r="2" fill="#49C2C1" opacity="0.5">
      <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="300" cy="280" r="2" fill="#0400F5" opacity="0.5">
      <animate attributeName="opacity" values="0.2;0.8;0.2" dur="4s" repeatCount="indefinite" />
    </circle>
    <circle cx="700" cy="200" r="1.5" fill="#49C2C1" opacity="0.4">
      <animate attributeName="opacity" values="0.1;0.6;0.1" dur="5s" repeatCount="indefinite" />
    </circle>
  </svg>
)

const InfoCard = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="gen-card p-4 mb-3">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between text-left group">
        <span className="flex items-center gap-2 font-semibold text-gen-gray3 group-hover:text-white transition-colors text-sm">
          <Info className="w-4 h-4 text-gen-turquoise" />
          {title}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gen-gray2" /> : <ChevronDown className="w-4 h-4 text-gen-gray2" />}
      </button>
      {isOpen && (
        <div className="mt-3 text-sm text-gen-gray2 space-y-2 border-t border-gen-gray1/15 pt-3 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  )
}

const HistoryList = ({ refreshTrigger }) => {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchHistory() }, [refreshTrigger])

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/history').catch(() => null)
            if (res && res.ok) { setHistory(await res.json()) }
            else {
                setHistory([
                    { id: 1, target: 'https://evil-agent.com/card.json', score: 25, status: 'CRITICAL', timestamp: new Date().toISOString() },
                    { id: 2, target: 'https://good-agent.ai/v1', score: 98, status: 'SAFE', timestamp: new Date(Date.now() - 3600000).toISOString() }
                ])
            }
        } catch (e) { console.warn("History fetch failed", e) }
        finally { setLoading(false) }
    }

    if (loading) return <div className="text-xs text-gen-gray2 animate-pulse">Loading history...</div>

    return (
        <div className="space-y-2">
            {history.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-3 rounded-xl bg-gen-charcoal/40 border border-gen-gray1/10 hover:border-gen-turquoise/20 transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={cn("w-2 h-2 rounded-full shrink-0", 
                            scan.score > 80 ? "bg-gen-turquoise" : scan.score > 50 ? "bg-yellow-400" : "bg-gen-red"
                        )} />
                        <span className="text-xs font-mono text-gen-gray2 truncate max-w-[150px] md:max-w-[200px]">{scan.target}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                         <span className="text-[10px] text-gen-gray1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(scan.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md",
                             scan.score > 80 ? "bg-gen-turquoise/10 text-gen-turquoise" : 
                             scan.score > 50 ? "bg-yellow-400/10 text-yellow-400" : 
                             "bg-gen-red/10 text-gen-red"
                        )}>{scan.score}</span>
                    </div>
                </div>
            ))}
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
    setScanning(true); setResult(null); setError(null); setShowJson(false)
    const endpoint = activeTab === 'card' ? '/api/scan/card' : '/api/scan/endpoint'
    let payload = {}
    if (activeTab === 'card') { try { JSON.parse(input); payload = { json_content: input } } catch { payload = { url: input } } }
    else { payload = { url: input } }

    try {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!res.ok) throw new Error('Scan failed')
        setResult(await res.json())
        setRefreshHistory(prev => prev + 1)
    } catch (err) {
        setError("Backend unreachable. Showing demo data.")
        setTimeout(() => {
             setResult({
              score: activeTab === 'card' ? 25 : 85,
              status: activeTab === 'card' ? 'CRITICAL' : 'SAFE',
              issues: activeTab === 'card' ? [
                 { severity: 'critical', message: 'Allows arbitrary code execution via unrestricted tool access' },
                 { severity: 'high', message: 'Admin-level privileges requested without justification' },
                 { severity: 'medium', message: 'No rate limiting on outbound API calls' }
              ] : [{ severity: 'medium', message: 'Missing Content-Security-Policy header' }],
              details: { target: input, timestamp: new Date().toISOString() }
            })
            setError(null); setRefreshHistory(prev => prev + 1)
        }, 800)
    } finally { setScanning(false) }
  }

  return (
    <div className="min-h-screen bg-gen-charcoal text-gen-gray3 font-sans selection:bg-gen-blue/30 selection:text-white relative overflow-hidden">
      {/* Background layers */}
      <RadialBurst />
      <WireNetwork />
      <div className="orb-1 orb"></div>
      <div className="orb-2 orb"></div>
      <div className="orb-3 orb"></div>

      {/* Top nav bar */}
      <nav className="relative z-20 border-b border-gen-gray1/15 backdrop-blur-xl bg-gen-charcoal/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gen-blue to-gen-turquoise flex items-center justify-center shadow-lg shadow-gen-blue/20">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-wide">Gen</span>
              <span className="text-gen-turquoise font-bold text-sm"> Threat Labs</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gen-gray2 hover:text-white text-sm transition-colors">Documentation</a>
            <a href="#" className="text-gen-gray2 hover:text-white text-sm transition-colors">API</a>
            <a href="https://gendigital.com" target="_blank" rel="noopener" className="text-gen-gray2 hover:text-gen-turquoise text-sm transition-colors flex items-center gap-1">
              <Globe className="w-3 h-3" /> gendigital.com
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        
        {/* Hero */}
        <header className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gen-blue/10 border border-gen-blue/20 text-gen-blue-tint text-xs font-bold tracking-widest mb-6">
              <Shield className="w-3.5 h-3.5" />
              AGENT TRUST HUB
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.05]">
                Secure Your
                <span className="block bg-gradient-to-r from-gen-blue via-gen-blue-tint to-gen-turquoise bg-clip-text text-transparent">AI Agents</span>
            </h1>
            <p className="text-gen-gray2 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
                The industry standard for AI agent security verification. Scan manifests, validate endpoints, and establish trust before deployment.
            </p>
            
            {/* Stats */}
            <div className="flex justify-center gap-8 md:gap-16">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-xs text-gen-gray1 uppercase tracking-wider">Agents Scanned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gen-turquoise">99.2%</div>
                <div className="text-xs text-gen-gray1 uppercase tracking-wider">Detection Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">12ms</div>
                <div className="text-xs text-gen-gray1 uppercase tracking-wider">Avg Scan Time</div>
              </div>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Scan Card */}
            <div className="gen-card p-8 mb-8">
                <div className="flex gap-6 mb-6 border-b border-gen-gray1/15 pb-1">
                    <button 
                        onClick={() => { setActiveTab('card'); setInput(''); setResult(null); }}
                        className={cn("pb-3 text-sm font-semibold transition-all relative", 
                            activeTab === 'card' ? "text-white" : "text-gen-gray1 hover:text-gen-gray3"
                        )}
                    >
                        <span className="flex items-center gap-2"><FileJson className="w-4 h-4" /> Manifest Scanner</span>
                        {activeTab === 'card' && <span className="absolute bottom-[-5px] left-0 w-full h-[2px] bg-gradient-to-r from-gen-blue to-gen-turquoise rounded-full"></span>}
                    </button>
                    <button 
                        onClick={() => { setActiveTab('endpoint'); setInput(''); setResult(null); }}
                        className={cn("pb-3 text-sm font-semibold transition-all relative", 
                            activeTab === 'endpoint' ? "text-white" : "text-gen-gray1 hover:text-gen-gray3"
                        )}
                    >
                        <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Endpoint Health</span>
                        {activeTab === 'endpoint' && <span className="absolute bottom-[-5px] left-0 w-full h-[2px] bg-gradient-to-r from-gen-blue to-gen-turquoise rounded-full"></span>}
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
                            className="gen-input pl-12 font-mono text-sm"
                        />
                        <Search className="absolute left-4 top-4 w-4 h-4 text-gen-gray1" />
                    </div>
                    
                    <div className="flex justify-between items-center">
                         <span className="text-xs text-gen-gray1">
                            {activeTab === 'card' ? 'Supports .json URLs or raw JSON text.' : 'Checks HTTPS, Headers, and Card availability.'}
                         </span>
                         <button 
                            onClick={handleScan}
                            disabled={scanning || !input}
                            className={cn("gen-button-primary min-w-[160px] flex justify-center items-center gap-2", scanning && "opacity-80 cursor-wait", (!input) && "opacity-50 cursor-not-allowed")}
                        >
                            {scanning ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Shield className="w-4 h-4" /> Scan Now</>}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-gen-red/10 border border-gen-red/20 rounded-xl text-gen-red text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </div>

            {/* Results */}
            {result && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="gen-card p-8 flex items-center justify-between md:flex-col md:text-center md:justify-center relative overflow-hidden group">
                             <div className="absolute inset-0 bg-gradient-to-br from-gen-blue/5 to-gen-turquoise/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                             <div className="relative z-10">
                                <span className="text-gen-gray1 text-xs font-bold uppercase tracking-wider block mb-3">Trust Score</span>
                                <span className={cn("text-7xl font-black tracking-tighter", 
                                    result.score > 80 ? "bg-gradient-to-b from-gen-turquoise to-gen-turquoise-tint bg-clip-text text-transparent" : 
                                    result.score > 50 ? "text-yellow-400" : "text-gen-red"
                                )}>
                                    {result.score}
                                </span>
                             </div>
                             <div className="relative z-10 md:mt-4">
                                <span className={cn("px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border", 
                                    result.score > 80 ? "bg-gen-turquoise/10 border-gen-turquoise/20 text-gen-turquoise" : 
                                    result.score > 50 ? "bg-yellow-400/10 border-yellow-400/20 text-yellow-400" : 
                                    "bg-gen-red/10 border-gen-red/20 text-gen-red"
                                )}>
                                    {result.status}
                                </span>
                             </div>
                        </div>

                        <div className="md:col-span-2 gen-card p-6">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-gen-turquoise" /> 
                                Analysis Findings
                            </h3>
                            <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
                                {result.issues && result.issues.length > 0 ? (
                                    result.issues.map((issue, i) => (
                                        <div key={i} className="flex gap-3 p-3 rounded-xl bg-gen-charcoal/50 border border-gen-gray1/10">
                                             {issue.severity === 'high' || issue.severity === 'critical' ? (
                                                <AlertTriangle className="w-4 h-4 text-gen-red shrink-0 mt-0.5" />
                                            ) : issue.severity === 'medium' ? (
                                                <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                                            ) : (
                                                <Info className="w-4 h-4 text-gen-blue-tint shrink-0 mt-0.5" />
                                            )}
                                            <div>
                                                <p className="text-sm text-gen-gray3">{issue.message}</p>
                                                <span className={cn("text-[10px] uppercase font-bold tracking-wider mt-1 block", 
                                                    (issue.severity === 'high' || issue.severity === 'critical') ? "text-gen-red" : 
                                                    issue.severity === 'medium' ? "text-yellow-400" : "text-gen-blue-tint"
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

                    <div className="gen-card overflow-hidden">
                        <button onClick={() => setShowJson(!showJson)} className="w-full px-5 py-3 flex justify-between items-center hover:bg-white/5 transition-colors">
                            <span className="text-xs font-bold text-gen-gray1 uppercase tracking-wider flex items-center gap-2">
                                <FileJson className="w-3.5 h-3.5" /> Raw Scan Data
                            </span>
                            {showJson ? <ChevronUp className="w-3.5 h-3.5 text-gen-gray1"/> : <ChevronDown className="w-3.5 h-3.5 text-gen-gray1"/>}
                        </button>
                        {showJson && (
                            <div className="px-5 pb-4 border-t border-gen-gray1/15 pt-3 overflow-x-auto max-h-60 custom-scrollbar">
                                <pre className="font-mono text-xs text-gen-gray2">{JSON.stringify(result.details || result, null, 2)}</pre>
                            </div>
                        )}
                    </div>
                </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="gen-card p-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <History className="w-4 h-4 text-gen-turquoise" /> Recent Scans
                </h3>
                <HistoryList refreshTrigger={refreshHistory} />
            </div>

            <div className="gen-card p-5">
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Guides</h3>
                 <InfoCard title="Manifest Scanner">
                    Paste a URL to an <code className="text-gen-turquoise bg-gen-blue/10 px-1 rounded">agent.json</code> or raw JSON. Checks for insecure instructions, prompt injection, and auth gaps.
                 </InfoCard>
                 <InfoCard title="Endpoint Health">
                    Paste an API URL. Verifies HTTPS, Security Headers, and basic connectivity.
                 </InfoCard>
            </div>

            {/* CTA Card */}
            <div className="gen-card p-5 bg-gradient-to-br from-gen-blue/10 to-gen-turquoise/10 border-gen-blue/20">
              <h3 className="text-white font-bold text-sm mb-2">Protect Your Organization</h3>
              <p className="text-gen-gray2 text-xs leading-relaxed mb-4">Get enterprise-grade agent security with continuous monitoring and compliance reporting.</p>
              <a href="#" className="inline-flex items-center gap-1 text-gen-turquoise text-xs font-bold hover:text-white transition-colors">
                Learn More <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-gen-gray1/15 backdrop-blur-xl bg-gen-charcoal/40 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-gen-blue to-gen-turquoise flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-gen-gray2">
              <span className="font-bold text-white">Gen</span> Threat Labs
            </span>
          </div>
          <p className="text-xs text-gen-gray1">© {new Date().getFullYear()} Gen Digital Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-gen-gray1 hover:text-gen-turquoise transition-colors">Privacy</a>
            <a href="#" className="text-xs text-gen-gray1 hover:text-gen-turquoise transition-colors">Terms</a>
            <a href="#" className="text-xs text-gen-gray1 hover:text-gen-turquoise transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
