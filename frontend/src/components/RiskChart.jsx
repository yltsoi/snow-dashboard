import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponseiveContainer } from 'recharts'

const COLORS = { High: '#dc2626', Medium: '#d97706', Low: '#059669'}

export default function RiskChart({ data }){
    const ordered = ['High', 'Medium', 'Low'].map(
        r => data.find( d => d.risk === r) ?? { risk: r, count: 0}
    )

    return (
        <ResponsiveContainer width="100%" height={230}>
            <BarChart data={ordered} layout="vertical" magin={{ top: 4, right: 16, left: 0, bottom: 0}}>
                <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: '#94a3b8'}}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxi
                    type="category"
                    dataKey="risk"
                    width={52}
                    tick={{ fontSize: 11, fill: '#374151'}}
                    tickLine={false}
                    axisLine={false}
                 />
                 <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}   
                    cursor = {{ fill: '#f1f5f9'}}
                />
                <Bar dataKey="count" name="Changes" radius={[0, 4, 4, 0]} maxBarSize={28}>
                    {ordered.map((entry, i) => (
                        <Cell key={i} fill={COLORS[entry.risk] ?? '#64748b'} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}