import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'



export default function VolumeChart({ data }) {

    console.log("volumedata", data)

    return (
        <ResponsiveContainer width="100%" height={230}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#94a3b8'}}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val, i) => ( i % 5 === 0 ? val.slice(5) : '')}
                    interval={0}
                />
                <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}    
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    contentStyle = {{ fontSize: 12, borderRadius: 6, border: '1px solid #e2e8f0'}}    
                    cursor={{ fill: '#f1f5f9'}}
                />
                <Bar dataKey="count" name="Changes" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={20} />
            </BarChart>
        </ResponsiveContainer>
    )           
    
}