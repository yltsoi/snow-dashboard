import { useEffect, useState } from 'react'
import { fetchChanges } from '../api'
import ChangeDetail from './ChangeDetail'

const STATES = ['New', 'Assess', 'Authorize', 'Scheduled', 'Implement', 'Review', 'Closed', 'Cancelled']
const RISKS = ['High', 'Medium', 'Low']

const RISK_COLOR = { Hight: '#dc2626', Medium: '#f5a623', Low: '#7ed321' };
const STATE_COLOR = {
    New: '#f5a623',
    Approved: '#7ed321',
    Rejected: '#dc2626',
    Pending: '#f5a623'
}

export default function ChangesTable() {
    const [result, setResult] = useState({ data: [], total: 0 })
    const [filters, setFilters] = useState({  state: '', risk: '', search: '', page: 1 })
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)

    useEffect(() => {
        setLoading(true)
        fetchChanges(filters).then( d => {
            setResult(d)
            setLoading(false)
        })
    }, [filters])


    const set = (key, value) => setFilters( f => ({...f, [key]: value, page: 1}))
    const totalPages = Math.max(1, Math.ceil(result.total / 20))

    return (
        <div className="card table-card">
            <div className="table-header">
                <div className="card-title">Change Requests</div>
                <div className="table-filters">
                    <input
                        className="filter-input"
                        placeholder="search number or description.."
                        value={filters.search}
                        onChange={e => set('search', e.target.value)}
                    />
                    <select
                        className="filter-select"
                        value={filters.state}
                        onChange={e => set('state', e.target.value)}
                    >
                        <option value="">All States</option>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}   
                    </select>
                    <select
                        className="filter-select"  
                        value={filters.risk}
                        onChange={e => set('risk', e.target.value )}
                    >
                        <option value="">All Risks</option>
                        {RISKS.map(r => <option key={r} value = {r}> {r} </option>)}        
                    </select>
                </div>
            </div>
            
            <div className = "table-wrap">
                <table className="changes-table">
                    <thead>
                        <tr>
                            <th>Number</th>
                            <th>Description</th>
                            <th>State</th>
                            <th>Risk</th>
                            <th>Type</th>
                            <th>Assigned To</th>
                            <th>Start Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>
                                    Loading .....
                                </td>
                            </tr>
                        ) : result.data.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted'}}>
                                    No records match the current filters.
                                </td>
                            </tr>
                        ) : result.data.map( c => (
                            <tr key={c.number} className="clickable-row" onClick={() => setSelected(c.number)}>
                                <td><span className="chg-number">{c.number}</span></td>
                                <td style={{ maxWidth : 280 }}>{c.short_description}</td>
                                <td>
                                        <span className="badge" style={{ background: STATE_COLOR[c.state] ?? '#64748b' }}>{c.state}</span>
                                </td>
                                <td>         
                                        <span className="badge" style={{ background: RISK_COLOR[c.risk] ?? '#64748b' }}>{c.risk} Risk</span>
                                </td>
                                <td>{c.type}</td>
                                <td style={{ whiteSpace: 'nowrap' }}>{c.assigned_to}</td>
                                <td style={{ whiteSpace: 'nowrap' }}>{c.start_date.slice(0, 10)}</td>
                            </tr>
                        ))                  
                        }
                    </tbody>
                </table>
            </div>
            
            <div className="table-footer">
                <span>{result.total} record{result.total != 1 ? 's': '' }</span>
                <div className="pagination">
                    <button
                        disabled={filters.page <= 1}
                        onClick={() => setFilters(f => ({ ...f, page: f.page - 1}))}
                    >
                        
                    ← Prev      
                    </button>
                    <span> Page {filters.page} of {totalPages} </span>
                    <button
                        disabled={filters.page >= totalPages}
                        onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                    >
                    Next →
                    </button>
                </div>
            </div>
            
            {selected && <ChangeDetail number={selected} onClose={() => setSelected(null)} /> }
        </div>    
        )
    }