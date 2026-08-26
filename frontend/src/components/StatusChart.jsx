import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = [ '#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#64748b', '#475569']

export default function StatusChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={230}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="count"
                    nameKey="state"
                    cx="50%"
                    cy="45%"
                    innertRadius={48}
                    outerRadius={75}
                    paddingAngle={2}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}                        
                </Pie>
                <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e2e8f0'}}
                />
                <Legend
                    iconType="circle"                    
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, paddingTop: 8}}
                />
            </PieChart>
        </ResponsiveContainer>                    
    )
}