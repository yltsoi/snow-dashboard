import { useEffect, useRef, useState } from "react";
import {createPortal} from "react-dom";
import { fetchChange, assessChange } from "../api";
import * as logger from '../logger';

const RISK_COLOR = { High: '#dc2626', Medium: '#f5a623', Low: '#7ed321' };
const STATE_COLOR = {
    New: '#64748b',
    Assess: '#7c3aed',
    Authorize: '#2563eb',
    Scheduled: '#0891b2',
    Implement: '#d97706',
    Review: '#9333ea',
    Closed: '#7ed321',
    Cancelled: '#94asb8',
}

const TASK_STATE_COLOR = {
    Open: '#2563eb',
    'In Progress': '#d97706',
    Closed: '#059669',
    Cancelled: '#94a3b8'
}

function DetailRow({ label, value }) {
    return (
        <div className = "detail-row">
            <span className = "detail-label">{label}</span>
            <span className = "detail-value">{value}</span>
        </div>
    )
}

function Section({ title, children }) {

    console.log( "title" , title )

    return (
        <div className="detail-section">
            <div className="detail-section-title">{title}</div>
            {children}
        </div>      
    )
}

function SkillCard({ skill }) {
    return (
        <div className={`skill-card ${skill.passed ? 'skill-pass' : 'skill-fail'}`}>
            <div className="skill-header">
                <span className="skill-dot"> . </span>
                <span className="skill-name">{skill.name}</span>
                <span className="skill-badge">{skill.passed ? 'PASS' : 'FAIL'}</span>
            </div>
            <div className="skill-finding">{skill.finding}</div>
            {!skill.passed && skill.recommendation && (
                <div className="skill-rec"> 
                    {skill.recommendation}
                </div>
            )}
        </div>
    )
}

function TaskResultRow({ result }) {
    const [expanded, setExpanded] = useState(result.overall != 'PASS')
    const pass = result.overall === 'PASS'
    return (
        <div className={`task-result-row ${pass ? 'task-result-pass' : 'task-result-fail'}`}>
            <button className="task-result-header" onClick={() => setExpanded( e => !e)}>
                <span className="task-result-number">{result.task_number}</span>
                <span className="task-result-desc">{result.short_description}</span>
                <span className={`skill-badge ${pass ? '' : 'skill-badge-fail'}`}>{pass ? 'PASS' : 'FAIL'}</span>
                <span className="task-result-chevron">{expanded ? '▲' : '▼'}</span> 
            </button>
            {expanded && (
                <div className="task-result-checks">
                    {result.checks.map(c => <SkillCard key={c.id} skill={c} /> )}
                </div>
            )}    
        </div>
    )
}

function AssessmentPanel({ assessment, error }) {
    if (error) {
        return (
            <div className="assessment-panel assessment-error">
                <span className="assessment-error-title">⚠️</span>
                <span className="assessment-error-text">{error}</span>
            </div>
        )
    }


    const pass = assessment.overall === 'PASS'
    const changeChecks = assessment.change_checks ?? assessment.skills ?? []
    const taskResults = assessment.task_results ?? []
    const tasksAssessed = assessment.tasks_assessed ??  taskResults.length
    const tasksFailed = assessment.tasks_failed ?? taskResults.filter(t => t.overall !== 'PASS').length

    return (
        <div className={`assessment-panel ${pass ? 'assessment-pass' : 'assessment-fail'}`}>
            <div className="assessment-header">
                <span className="assessment-icon">{pass ? '✅' : '❌'}</span>
                <div>
                    <div className="assessment-overall">{pass ? 'All checks passed' : 'Issues found'}</div>
                    <div className="assessment-summary">{assessment.summary}</div>
                </div>
            </div>
            <div className="assessment-section-title">Change Checks</div>
            <div className="skill-list">
                {changeChecks.map( skill => <SkillCard key={skill.id} skill={skill} /> )}
            </div>

            {tasksAssessed > 0 && (
                <>
                    <div className="assessment-section-title">
                        Task Results
                        <span className="task-task-stats">
                            {tasksAssessed} assessed . {tasksFailed} failed
                        </span>
                    </div>
                    <div className="task-results-list">
                        {taskResults.map(r => (
                            <TaskResultRow key={r.task_number} result={r} />
                        ))}
                    </div>
                </>
            )}

            {tasksAssessed === 0 && (
                <div className="assessment-section-title" style={{ color: '#094a3b8', fontStyle: 'italic' }}>
                    No tasks assessed
                </div>
            )}
            </div>
        )   
        }
        
export default function ChangeDetail({ number, onClose }) {
    const [change, setChange] = useState(null)
    const [loading, setLoading] = useState(true)
    const [assessing, setAssessing] = useState(false)
    const [assessment, setAssessment] = useState(null)
    const [assessError, setAssessError] = useState(null)
    const bodyRef = useRef(null)

    useEffect(() => {
        logger.log('Change detail opened', { number })
        setLoading(true)
        setChange(null)
        setAssessment(null)
        setAssessError(null)
        fetchChange(number)
            .then(d => {
                logger.log('Change detail loaded', { number, state: d.state, risk: d.risk })
                setChange(d)
                setLoading(false)
            })
            .catch((err) => {
                logger.error('Change detail load failed', { number, message: err?.message })
                setLoading(false)
            })    
    }, [number])

    function handleAssess() {

        logger.log('Assessment started', { number })
        setAssessing(true)
        setAssessment(null)
        setAssessError(null)
        assessChange(number)
            .then(result => {
                logger.log('Assessment completed', { number, overall: result.overall })
                setAssessment(result)
                setAssessing(false)

            })
            .catch(err => {
                logger.error('Assessment failed', { number, message: err.message })
                setAssessError(err.message)
                setAssessing(false)
            })
    }

    console.log( "change", change)

    return createPortal(
        <>
            <div className="drawer-overlay" onClick={onClose} />
            <div className="drawer">
                <div className="drawer-header">
                    <div className="drawer-header-top">
                        <span className="chg-number" style={{ fontSize: '0.85rem'}}>{number}</span>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center '}}>
                            <button
                                className={`assess-btn ${assessing ? 'assess-btn--loading': ''}`}
                                onClick={handleAssess}
                                disabled={assessing || loading }
                            >
                                {assessing ? 'Assessing...' : 'Assess'}
                            </button>
                            <button className="drawer-close" onClick={onClose}>X</button>
                          </div>
                        </div>
                        {change && (
                            <>
                                <div className="drawer-title">{change.short_description}</div>
                                <div className="drawer-badges">
                                    <span className="badge" style={{ background: STATE_COLOR[change.state] ?? '#64748b' }}>{change.state}</span>
                                    <span className="badge" style={{ background: RISK_COLOR[change.risk] ?? '#64748b' }}>{change.risk} Risk</span>
                                    <span className="badge" style={{ background: '#64748b' }}>{change.type} </span>
                                </div>    
                            </>    
                        )}  
                    </div>
                    
                    {loading && <div className="drawer-loading">Loading..</div>}

                    {(assessment || assessError) && (
                        <div style={{ padding: '0 1.5rem 1rem', flexShrink: 0 }}>
                          <AssessmentPanel assessment={assessment} error={assessError} />
                        </div>
                    )}

                    {change && (
                        <div className="drawer-body" ref={bodyRef}>
                         <Section title="Details">
                           <div className="detail-grid">
                              <DetailRow label="Priority" value={change.priority} />
                              <DetailRow label="Category" value={change.category} />
                              <DetailRow label="Assigned To" value={change.assigned_to || '-'} />
                              <DetailRow label="Assignment Group" value={change.assignment_group || '-'} />
                              <DetailRow label="Opened" value={change.opened_at.slice(0,10)} />
                              <DetailRow label="Planned Start" value={change.start_date ? change.start_date.slice(0, 16).replace('T', ' ') : '-' } />
                              <DetailRow label="Planned End" value={change.end_date ? change.end_date.slice(0, 16).replace('T', ' ') : '-'} />
                            </div>
                        </Section>      
                    

                        <Section title="Description">
                            <p className="detail-text">{change.description}</p>
                        </Section>

                        <Section title="Justification">
                            <p className="detail-text">{change.justification}</p>
                        </Section>

                        <Section title="Implementation Plan">
                            <pre className="detail-pre">{change.implementation_plan}</pre>
                        </Section>

                        <Section title="Backout Plan">
                            <p className="detail-text">{change.backout_plan}</p>
                        </Section>

                    <Section title={`Tasks (${change.tasks.length})`}>
                        {change.tasks.length === 0 ? (
                            <p className="detail-text" style={{ color: '#94a3b8'}}>No tasks associated with this change. </p>
                        ) : (
                            <table className="tasks-table">
                                <thead>
                                    <tr>
                                        <th>Number</th>
                                        <th>Description</th>
                                        <th>State</th>
                                        <th>Assigned To</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {change.tasks.map(t => (
                                       <tr key={t.number}>
                                        <td>
                                            <span className="task-number">{t.number}</span>
                                        </td>
                                        <td>{t.short_description}</td>
                                        <td>
                                            <span className="badge"  style={{ background: TASK_STATE_COLOR[t.state] ?? '#64748b'}}>
                                                {t.state}       
                                            </span>
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{t.assigned_to} </td>
                                       </tr> 
                                    ))}
                                </tbody>
                            </table>        
                        )}
                    </Section>
                </div>        
            )}
        </div>
    </>,
    document.body        
    )
}