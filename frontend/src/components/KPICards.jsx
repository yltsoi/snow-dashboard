const CARDS = [
    { key: 'total', label: 'Total Changes', color: '#2563eb'},
    { key: 'open', label: 'Open Changes', color: '#7c3aed'},
    { key: 'high_risk', label: 'High Risk', color: '#dc2626'},
    { key: 'upcoming', label: 'Upcoming', color: '#059669'},
]

export default function KPICards({ summary }) {

    console.log("kpidata", summary)
    return (
        <div className="kpi-grid">
            {CARDS.map(({ key, label, color }) => (
                <div key={key} className="kpi-card" style={{ borderTopColor: color}}>
                    <div className="kpi-value" style={{ color }}>{summary[key]}</div>
                    <div className="kpi-label">{label}</div>
                </div>
            ))}
        </div>
    )
}