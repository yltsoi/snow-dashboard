import { useCallBack, useEffect, useLayoutEffect, useState } from 'react'
import { fetchSummary, fetchVolume, fetchByStatus, fetchByRisk } from './api'
import * as logger from './logger'
import KPICards from './components/KPICards'
import VolumeChart from './components/VolumeChart'
import StatusChart from './components/StatusChart'
import RiskChart from './components/RiskChart'
import ChangesTable from './components/ChangesTable'

export default function App() {
    const[darkMode, setDarkMode] = useState(() => {
        const stored = localStorage.getItem('theme')
        return stored ? stored === 'dark' :  window.matchMedia( '(prefers-color-scheme: dark)').matches
    })

    useLayoutEffect(() => {
        document.documentElement.setAttribute( 'data-theme', darkMode ? 'dark': 'light')
        localStorage.setItem('theme', darkMode ? 'dark': 'light')
    }, [darkMode]) 

    const toggleDark = useCallback(() => setDarkMode(d => !d), [])

    const [summary, setSummary] = useState(null)
    const [volume, setVolume] = useState([])
    const [byStatus, setByStatus] = useState([])
    const [byRisk,  setByRisk] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState(null)
    const [lastUpdated, setUpdated] = useState(null)

    const loadData = useCallback(( isRefresh = false) => {
        logger.log(isRefresh ? 'Manual refresh triggered' : 'Dashboard data loading')
        if ( isRefresh) setRefreshing(true)
        else setLoading(true)
        setError(null)         
        
        Promise.all([fetchSummary(), fetchVolume(), fetchByStatus(), fetchByRisk()])
            .then(([s, v, bs, br]) => {
                setSummary(s)
                setVolume(v)
                setByStatus(bs)
                setByRisk(br)
                setLastUpdated(new Date())
                logger.log('Dashboard data loaded', { total: s?.total, open: s?.open })
            })
            .catch((err) => {
                logger.error('Dashboard data load failed', { message: err?.message })
                setError('Could not connect to backend. Make sure the Python server is running on port')
            })
            .finally(() => {
                setLoading(false)
                setRefreshing(false)
            })
    }, [])

    useEffect(() => { loadData() }, [loadData])

    const formatTime = (date) =>
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'})

    return (
        <div className="app">
            <header className="header">
                <div className="header-inner">
                    <h1>ServiceNow Change Dashboard</h1>
                    <span className="header-sub">Change Management . Last 90 Days</span>
                </div>
                <div className="header-actions">
                    {lastUpdated && (
                        <span className="last-updated">Updated {formatTime(lastUpdated)}</span>
                    )}
                    <button
                      className="theme-toggle"
                      onClick={toggleDark}
                      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        <span className="toggle-icon">☀️</span>
                        <span className={`toggle-track${darkMode ? ' is-dark' : ''}`}>
                            <span className="toggle-thumb" />
                        </span>
                        <span className="toggle-icon">🌙</span>
                    </button>
                    <button
                        className="refresh-btn"
                        onClick={() => loadData(true)}  
                        disabled={refreshing || loading }  
                    >
                        {refreshing ? 'Refreshing..' : '🔄️ Refresh'}    
                    </button>
                </div>
            </header>


            <main className="main">
                {loading && <div className="loading">Loading data..</div>}

                {error && (
                    <div className="card alert-error">
                        <strong>Connection error</strong><br />{error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <KPICards summary={summary} />
                        <div className="charts-grid">
                            <div className="card">
                                <div className="card-title">Change Volume - Last 30 days</div>
                                <VolumeChart data={volume} />
                            </div>
                            <div className="card">
                                <div className="card-title">By Status</div>
                                <statusChart data={byStatus} />
                            </div>
                            <div className="card">
                                <div className="card-title">By Risk Level</div>
                                <RiskChart data={byRisk} />
                            </div>
                        </div>
                        <ChangesTable />
                    </>
                )}
            </main>
        </div>        
 
)}
