import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { DollarSign, Package, ShoppingBag, TrendingUp, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        lowStock: 0,
    });
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [showLowStockModal, setShowLowStockModal] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsRes, lowStockRes] = await Promise.all([
                    api.get('/reports/stats'),
                    api.get('/products/low-stock')
                ]);
                setStats(statsRes.data);
                setLowStockProducts(lowStockRes.data);

                // Show modal only if it hasn't been shown in this session and there are low stock products
                const hasShownAlert = sessionStorage.getItem('hasShownLowStockAlert');
                if (!hasShownAlert && lowStockRes.data.length > 0) {
                    setShowLowStockModal(true);
                    sessionStorage.setItem('hasShownLowStockAlert', 'true');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
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

            <Modal
                isOpen={showLowStockModal}
                onClose={() => setShowLowStockModal(false)}
                title="Alerta de Stock Bajo"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg dark:bg-amber-900/20 dark:text-amber-400">
                        <AlertTriangle className="w-5 h-5" />
                        <p className="text-sm font-medium">Los siguientes productos tienen stock bajo o nulo:</p>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto border border-border rounded-lg dark:border-border-dark">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-border sticky top-0 dark:bg-gray-800 dark:border-border-dark">
                                <tr>
                                    <th className="px-4 py-2 font-medium text-text-secondary">Producto</th>
                                    <th className="px-4 py-2 font-medium text-text-secondary text-center">Stock</th>
                                    <th className="px-4 py-2 font-medium text-text-secondary text-center">Mínimo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border dark:divide-border-dark">
                                {lowStockProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-4 py-2 text-text-main dark:text-gray-100">{product.name}</td>
                                        <td className="px-4 py-2 text-center font-medium text-red-600 dark:text-red-400">{product.stock}</td>
                                        <td className="px-4 py-2 text-center text-text-secondary">{product.min_stock}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={() => setShowLowStockModal(false)}>
                            Entendido
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
