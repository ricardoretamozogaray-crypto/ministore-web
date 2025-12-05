import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { DollarSign, TrendingUp, Calendar, User, Search, ChevronDown, Eye, XCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Reports() {
    const { user } = useAuth();
    const getLocalDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [filters, setFilters] = useState({
        startDate: getLocalDate(),
        endDate: getLocalDate(),
        userId: 'all'
    });
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedSale, setSelectedSale] = useState(null);

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
            return res.data;
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Error al generar el reporte');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSale = async (saleId) => {
        if (!window.confirm('¿Estás seguro de cancelar esta venta? Esta acción restaurará el stock.')) return;

        try {
            await api.post(`/sales/${saleId}/cancel`);
            alert('Venta cancelada exitosamente');
            generateReport();
            setSelectedSale(null);
        } catch (error) {
            console.error('Error cancelling sale:', error);
            alert('Error al cancelar venta: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCancelItem = async (saleId, itemId) => {
        if (!window.confirm('¿Seguro que desea cancelar este producto? Se restaurará el stock.')) return;

        try {
            await api.post(`/sales/${saleId}/items/${itemId}/cancel`);
            alert('Producto cancelado exitosamente');
            const newData = await generateReport();

            if (newData && newData.sales) {
                const updatedSale = newData.sales.find(s => s.sale_id === saleId);
                if (updatedSale) {
                    if (updatedSale.status === 'cancelled') {
                        setSelectedSale(null); // Close if sale is fully cancelled
                    } else {
                        setSelectedSale(updatedSale); // Update modal with new data
                    }
                } else {
                    setSelectedSale(null);
                }
            }
        } catch (error) {
            console.error('Error cancelling item:', error);
            alert('Error al cancelar producto: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleRestoreSale = async (saleId) => {
        if (!window.confirm('¿Seguro que desea restaurar esta venta? Se descontará el stock nuevamente.')) return;

        try {
            await api.post(`/sales/${saleId}/restore`);
            alert('Venta restaurada exitosamente');
            generateReport();
            setSelectedSale(null);
        } catch (error) {
            console.error('Error restoring sale:', error);
            alert('Error al restaurar venta: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleRestoreItem = async (saleId, itemId) => {
        if (!window.confirm('¿Seguro que desea restaurar este producto? Se descontará el stock.')) return;

        try {
            await api.post(`/sales/${saleId}/items/${itemId}/restore`);
            alert('Producto restaurado exitosamente');
            const newData = await generateReport();

            if (newData && newData.sales) {
                const updatedSale = newData.sales.find(s => s.sale_id === saleId);
                if (updatedSale) {
                    setSelectedSale(updatedSale);
                }
            }
        } catch (error) {
            console.error('Error restoring item:', error);
            alert('Error al restaurar producto: ' + (error.response?.data?.message || error.message));
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
                            value={`S/. ${Number(reportData.summary.totalRevenue).toFixed(2)}`}
                            icon={DollarSign}
                            colorClass="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                        />
                        <StatCard
                            title="Ganancia Neta"
                            value={`S/. ${Number(reportData.summary.totalProfit).toFixed(2)}`}
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
                                        <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider text-right">Total</th>
                                        <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider text-right">Ganancia</th>
                                        <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider text-center">Estado</th>
                                        <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider text-center">Acciones</th>
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
                                                <td className="px-6 py-4 text-sm font-medium text-text-main text-right dark:text-gray-100">
                                                    S/. {Number(sale.sale_total).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-green-600 text-right dark:text-green-400">
                                                    S/. {Number(sale.sale_profit).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sale.status === 'cancelled'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                        }`}>
                                                        {sale.status === 'cancelled' ? 'Cancelado' : 'Completado'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center space-x-2">
                                                    <button
                                                        onClick={() => setSelectedSale(sale)}
                                                        className="inline-flex items-center justify-center p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                                                        title="Ver Detalles"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    {user?.role === 'admin' && sale.status !== 'cancelled' && (
                                                        <button
                                                            onClick={() => handleCancelSale(sale.sale_id)}
                                                            className="inline-flex items-center justify-center p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors dark:hover:bg-red-900/20"
                                                            title="Cancelar Venta"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {user?.role === 'admin' && sale.status === 'cancelled' && (
                                                        <button
                                                            onClick={() => handleRestoreSale(sale.sale_id)}
                                                            className="inline-flex items-center justify-center p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors dark:hover:bg-blue-900/20"
                                                            title="Restaurar Venta"
                                                        >
                                                            <RotateCcw className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Sale Details Modal */}
                    <Modal
                        isOpen={!!selectedSale}
                        onClose={() => setSelectedSale(null)}
                        title="Detalle de Venta"
                    >
                        {selectedSale && (
                            <div className="space-y-6">
                                {/* Summary Grid */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-text-muted">Fecha</p>
                                        <p className="font-medium text-text-main dark:text-gray-100">
                                            {new Date(selectedSale.created_at).toLocaleString('es-ES')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-text-muted">Vendedor</p>
                                        <p className="font-medium text-text-main dark:text-gray-100">
                                            {selectedSale.seller_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-text-muted">Total Venta</p>
                                        <p className="font-bold text-lg text-primary">
                                            S/. {Number(selectedSale.sale_total).toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-text-muted">Ganancia</p>
                                        <p className="font-bold text-lg text-green-600 dark:text-green-400">
                                            S/. {Number(selectedSale.sale_profit).toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-text-muted">Estado</p>
                                        <p className={`font-bold text-lg ${selectedSale.status === 'cancelled' ? 'text-red-600' : 'text-green-600'}`}>
                                            {selectedSale.status === 'cancelled' ? 'Cancelado' : 'Completado'}
                                        </p>
                                    </div>
                                </div>

                                {/* Products Table */}
                                <div>
                                    <h4 className="font-medium text-text-main mb-3 dark:text-gray-100">Productos</h4>
                                    <div className="border border-border rounded-lg overflow-hidden dark:border-border-dark">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 border-b border-border dark:bg-gray-800 dark:border-border-dark">
                                                <tr>
                                                    <th className="px-4 py-2 font-medium text-text-secondary">Producto</th>
                                                    <th className="px-4 py-2 font-medium text-text-secondary text-center">Cant.</th>
                                                    <th className="px-4 py-2 font-medium text-text-secondary text-right">Precio</th>
                                                    <th className="px-4 py-2 font-medium text-text-secondary text-right">Subtotal</th>
                                                    <th className="px-4 py-2 font-medium text-text-secondary text-center">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border dark:divide-border-dark">
                                                {selectedSale.items.map((item, idx) => (
                                                    <tr key={idx} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${item.status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                                                        <td className="px-4 py-2 text-text-main dark:text-gray-100">
                                                            <div className={item.status === 'cancelled' ? 'line-through text-text-muted' : ''}>
                                                                {item.product_name}
                                                            </div>
                                                            {item.status === 'cancelled' && <span className="text-xs text-red-500 font-medium">Cancelado</span>}
                                                        </td>
                                                        <td className={`px-4 py-2 text-center text-text-secondary ${item.status === 'cancelled' ? 'line-through opacity-50' : ''}`}>{Number(item.quantity)}</td>
                                                        <td className={`px-4 py-2 text-right text-text-secondary ${item.status === 'cancelled' ? 'line-through opacity-50' : ''}`}>S/. {Number(item.price).toFixed(2)}</td>
                                                        <td className={`px-4 py-2 text-right font-medium text-text-main dark:text-gray-100 ${item.status === 'cancelled' ? 'line-through opacity-50' : ''}`}>
                                                            S/. {Number(item.subtotal).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            {user?.role === 'admin' && selectedSale.status !== 'cancelled' && item.status !== 'cancelled' && (
                                                                <button
                                                                    onClick={() => handleCancelItem(selectedSale.sale_id, item.id)}
                                                                    className="text-red-500 hover:bg-red-100 p-1.5 rounded-full transition-colors dark:hover:bg-red-900/20"
                                                                    title="Cancelar Producto"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            {user?.role === 'admin' && item.status === 'cancelled' && (
                                                                <button
                                                                    onClick={() => handleRestoreItem(selectedSale.sale_id, item.id)}
                                                                    className="text-blue-500 hover:bg-blue-100 p-1.5 rounded-full transition-colors dark:hover:bg-blue-900/20"
                                                                    title="Restaurar Producto"
                                                                >
                                                                    <RotateCcw className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal>
                </>
            )}
        </div>
    );
}
