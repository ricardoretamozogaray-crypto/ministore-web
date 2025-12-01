import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DollarSign, TrendingUp, Calendar, User, Search, ChevronDown } from 'lucide-react';

export default function Reports() {
    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        userId: 'all'
    });
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/users/list');
                setUsers(res.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
        generateReport();
    }, []);

    const generateReport = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await api.get(`/reports/sales?${query}`);
            setReportData(res.data);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Error al generar el reporte');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
        <Card className="p-6 flex flex-col justify-between h-full min-h-[9rem]">
            <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="mt-4">
                <h3 className="text-2xl font-semibold text-text-main dark:text-gray-100">{value}</h3>
                <p className="text-sm text-text-muted font-medium">{title}</p>
                {subtext && <p className="text-xs text-green-600 font-medium mt-1 dark:text-green-400">{subtext}</p>}
            </div>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-text-main dark:text-gray-100">Reportes de Ventas</h2>
            </div>

            {/* Filters */}
            <Card className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">Fecha Inicial</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                            <input
                                type="date"
                                className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-md text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">Fecha Final</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                            <input
                                type="date"
                                className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-md text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">Vendedor</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 pointer-events-none" />
                            <select
                                className="w-full pl-9 pr-10 py-2 bg-white border border-border rounded-md text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                                value={filters.userId}
                                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                            >
                                <option value="all">Todos los usuarios</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.username}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 pointer-events-none" />
                        </div>
                    </div>
                    <Button onClick={generateReport} disabled={loading} className="w-full">
                        {loading ? 'Generando...' : 'Generar Reporte'}
                    </Button>
                </div>
            </Card>

            {reportData && (
                <>
                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                            title="Ventas Totales"
                            value={reportData.summary.totalSales}
                            icon={TrendingUp}
                            colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        />
                        <StatCard
                            title="Ingresos Generados"
                            value={`$${Number(reportData.summary.totalRevenue).toFixed(2)}`}
                            icon={DollarSign}
                            colorClass="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                        />
                        <StatCard
                            title="Ganancia Neta"
                            value={`$${Number(reportData.summary.totalProfit).toFixed(2)}`}
                            subtext={`Margen: ${reportData.summary.totalRevenue > 0 ? ((reportData.summary.totalProfit / reportData.summary.totalRevenue) * 100).toFixed(1) : 0}%`}
                            icon={DollarSign}
                            colorClass="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                        />
                    </div>

                    {/* Detailed List */}
                    <Card className="overflow-hidden">
                        <div className="p-4 border-b border-border dark:border-border-dark">
                            <h3 className="font-semibold text-text-main dark:text-gray-100">Detalle de Ventas</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-border dark:bg-gray-800 dark:border-border-dark">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Vendedor</th>
                                        <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Productos</th>
                                        <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider text-right">Total</th>
                                        <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider text-right">Ganancia</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border dark:divide-border-dark">
                                    {reportData.sales.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-text-muted">
                                                No se encontraron ventas en este periodo.
                                            </td>
                                        </tr>
                                    ) : (
                                        reportData.sales.map((sale) => (
                                            <tr key={sale.sale_id} className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/50">
                                                <td className="px-6 py-4 text-sm text-text-secondary">
                                                    {new Date(sale.created_at).toLocaleString('es-ES')}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-text-main dark:text-gray-100">
                                                    {sale.seller_name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-text-secondary">
                                                    <div className="flex flex-col gap-1">
                                                        {sale.items.map((item, idx) => (
                                                            <span key={idx} className="text-xs">
                                                                {item.quantity}x {item.product_name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-text-main text-right dark:text-gray-100">
                                                    ${Number(sale.sale_total).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-green-600 text-right dark:text-green-400">
                                                    ${Number(sale.sale_profit).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}
