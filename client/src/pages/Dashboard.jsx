import { useEffect, useState } from 'react';
import api from '../utils/api';
import { DollarSign, Package, ShoppingBag, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Card } from '../components/ui/Card';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        lowStock: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/reports/stats');
                setStats(res.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, trend }) => (
        <Card className="p-6 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <Icon className="w-5 h-5 text-text-secondary dark:text-gray-400" />
                </div>
                {trend && (
                    <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full dark:bg-green-900/20 dark:text-green-400">
                        +{trend}% <ArrowUpRight className="w-3 h-3 ml-1" />
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-2xl font-semibold text-text-main mt-2 dark:text-gray-100">{value}</h3>
                <p className="text-sm text-text-muted font-medium">{title}</p>
            </div>
        </Card>
    );

    return (
        <div className="space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                <StatCard
                    title="Ventas Totales"
                    value={`$${stats.totalSales.toFixed(2)}`}
                    icon={DollarSign}
                />
                <StatCard
                    title="Órdenes Totales"
                    value={stats.totalOrders}
                    icon={ShoppingBag}
                />
                <StatCard
                    title="Stock Bajo"
                    value={stats.lowStock}
                    icon={Package}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <Card className="h-64 lg:h-96 flex items-center justify-center text-text-muted">
                    <div className="text-center">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Gráfico de Ventas (Ver Reportes)</p>
                    </div>
                </Card>
                <Card className="h-64 lg:h-96 flex items-center justify-center text-text-muted">
                    <div className="text-center">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Top Productos (Ver Reportes)</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
