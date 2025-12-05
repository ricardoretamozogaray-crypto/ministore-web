import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '../ui/Card';

export default function TopProductsChart({ data }) {
    const COLORS = ['#4f46e5', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

    return (
        <Card className="p-6 h-full">
            <h3 className="text-lg font-semibold text-text-main mb-4 dark:text-gray-100">Top 5 Productos</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{
                            top: 5,
                            right: 30,
                            left: 40,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={100}
                            stroke="#6b7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#111827' }}
                        />
                        <Bar dataKey="total_sold" name="Unidades Vendidas" radius={[0, 4, 4, 0]} barSize={20}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
