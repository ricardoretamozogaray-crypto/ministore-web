import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';

export default function SalesChart({ data }) {
    return (
        <Card className="p-6 h-full">
            <h3 className="text-lg font-semibold text-text-main mb-4 dark:text-gray-100">Ventas (Últimos 7 días)</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                        />
                        <YAxis
                            stroke="#6b7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#111827' }}
                            formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Ventas']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        />
                        <Area type="monotone" dataKey="total" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
