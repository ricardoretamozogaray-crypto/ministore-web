import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Search, Edit, Trash2, Upload, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useInventory } from '../hooks/useInventory';
import MetricsBar from '../components/inventory/MetricsBar';
import ProductForm from '../components/inventory/ProductForm';

export default function Inventory() {
    const {
        products,
        pagination,
        metrics,
        loading,
        error,
        filters,
        updateFilter,
        setPage,
        setSort,
        refresh
    } = useInventory();

    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [bulkData, setBulkData] = useState('');


    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        try {
            const lines = bulkData.trim().split('\n');
            const productsToCreate = lines.map(line => {
                const [name, price, cost, stock, min_stock, category_id, unit_type] = line.split(',');
                return { name, price, cost, stock, min_stock: min_stock || 0, category_id, unit_type: unit_type || 'unit' };
            });

            for (const p of productsToCreate) {
                await api.post('/products', p);
            }

            alert('Carga masiva completada');
            setIsBulkModalOpen(false);
            setBulkData('');
            refresh();
        } catch (error) {
            alert('Error en carga masiva. Asegúrate del formato: nombre,precio,costo,stock,stock_minimo,id_categoria');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                await api.delete(`/products/${id}`);
                refresh();
            } catch (error) {
                alert('Error al eliminar');
            }
        }
    };

    const openModal = (product = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const SortHeader = ({ label, column, sort, setSort }) => (
        <th
            className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setSort(column)}
        >
            <div className="flex items-center gap-1">
                {label}
                <ArrowUpDown className={`w-3 h-3 ${sort === column ? 'text-primary' : 'text-gray-400'}`} />
            </div>
        </th>
    );

    return (
        <div className="space-y-4 lg:space-y-6">
            <MetricsBar metrics={metrics} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        className="w-full pl-9 pr-4 py-3 lg:py-2 bg-white border border-border rounded-md text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant={filters.stock_status === 'low_stock' ? "primary" : "secondary"}
                        onClick={() => updateFilter('stock_status', filters.stock_status === 'low_stock' ? '' : 'low_stock')}
                        className="flex-1 sm:flex-none justify-center"
                    >
                        {filters.stock_status === 'low_stock' ? "Ver Todos" : "Ver Bajo Stock"}
                    </Button>
                    <Button variant="secondary" onClick={() => setIsBulkModalOpen(true)} className="flex-1 sm:flex-none justify-center">
                        <Upload className="w-4 h-4" /> <span className="sm:hidden lg:inline">Carga</span> Masiva
                    </Button>
                    <Button onClick={() => openModal()} className="flex-1 sm:flex-none justify-center">
                        <Plus className="w-4 h-4" /> Nuevo <span className="hidden sm:inline">Producto</span>
                    </Button>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-surface border border-border rounded-lg shadow-soft overflow-hidden dark:bg-surface-dark dark:border-border-dark">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-border dark:bg-gray-800 dark:border-border-dark">
                            <tr>
                                <SortHeader label="Producto" column="name" sort={filters.sort_by} setSort={setSort} />
                                <SortHeader label="Categoría" column="category_name" sort={filters.sort_by} setSort={setSort} />
                                <SortHeader label="Precio" column="price" sort={filters.sort_by} setSort={setSort} />
                                <SortHeader label="Costo" column="cost" sort={filters.sort_by} setSort={setSort} />
                                <SortHeader label="Stock" column="stock" sort={filters.sort_by} setSort={setSort} />
                                <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border dark:divide-border-dark">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-text-muted">Cargando inventario...</td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-text-muted">No se encontraron productos</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-text-main dark:text-gray-100">{product.name}</div>
                                            {product.description && <div className="text-xs text-text-muted truncate max-w-[200px]">{product.description}</div>}
                                            <div className="text-xs text-text-muted font-mono">{product.code}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-secondary">{product.category_name || '-'}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-text-main dark:text-gray-100">S/. {Number(product.price || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm text-text-secondary">S/. {Number(product.cost || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${Number(product.stock) <= Number(product.min_stock || 0)
                                                ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                                : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                                }`}>
                                                {product.stock} {product.unit_type === 'kg' ? 'kg' : 'un.'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => openModal(product)} className="text-primary hover:text-primary-hover transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="px-6 py-4 border-t border-border dark:border-border-dark flex items-center justify-between">
                    <div className="text-sm text-text-muted">
                        Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} productos
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setPage(pagination.page - 1)}
                            disabled={pagination.page === 1}
                        >
                            <ChevronLeft className="w-4 h-4" /> Anterior
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setPage(pagination.page + 1)}
                            disabled={pagination.page >= pagination.total_pages}
                        >
                            Siguiente <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Card View (Simplified for now, uses same data) */}
            <div className="md:hidden grid grid-cols-1 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="bg-surface border border-border rounded-lg p-4 shadow-sm dark:bg-surface-dark dark:border-border-dark flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-xs font-mono text-text-secondary bg-gray-100 px-1.5 py-0.5 rounded dark:bg-gray-800">{product.code}</span>
                                <h3 className="font-medium text-text-main mt-1 dark:text-gray-100">{product.name}</h3>
                                <p className="text-xs text-text-secondary">{product.category_name}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openModal(product)} className="p-2 bg-primary/10 text-primary rounded-md">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-50 text-red-500 rounded-md dark:bg-red-900/20">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-border dark:border-border-dark">
                            <div className="flex flex-col">
                                <span className="text-xs text-text-muted">Precio</span>
                                <span className="font-semibold text-text-main dark:text-gray-100">S/. {Number(product.price || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-text-muted">Costo</span>
                                <span className="text-sm text-text-secondary">S/. {Number(product.cost || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-text-muted">Stock</span>
                                <span className={`text-sm font-medium ${Number(product.stock) <= Number(product.min_stock || 0) ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                                    }`}>
                                    {product.stock} {product.unit_type === 'kg' ? 'kg' : 'un.'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Mobile Pagination */}
                <div className="flex justify-center gap-2 mt-4">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                    >
                        Anterior
                    </Button>
                    <span className="flex items-center text-sm text-text-muted">
                        Página {pagination.page}
                    </span>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPage(pagination.page + 1)}
                        disabled={pagination.page >= pagination.total_pages}
                    >
                        Siguiente
                    </Button>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            >
                <ProductForm
                    initialData={editingProduct}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        refresh();
                    }}
                />
            </Modal>

            {/* Bulk Upload Modal */}
            <Modal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                title="Carga Masiva de Productos"
            >
                <form onSubmit={handleBulkSubmit} className="space-y-4">
                    <p className="text-sm text-text-secondary dark:text-gray-400">
                        Ingresa los productos en formato CSV (uno por línea):<br />
                        <code>nombre,precio,costo,stock,min_stock,id_categoria,tipo_unidad(opcional)</code>
                    </p>
                    <textarea
                        className="w-full px-3 py-2 bg-white border border-border rounded-md text-sm font-mono text-text-main transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                        rows="10"
                        value={bulkData}
                        onChange={(e) => setBulkData(e.target.value)}
                        placeholder="Coca Cola,2.50,1.50,100,10,1,unit&#10;Manzanas,5.00,3.00,20.5,2,2,kg"
                        required
                    />
                    <div className="pt-4 flex gap-3 justify-end">
                        <Button type="button" variant="secondary" onClick={() => setIsBulkModalOpen(false)} className="py-3 lg:py-2">
                            Cancelar
                        </Button>
                        <Button type="submit" className="py-3 lg:py-2">
                            Procesar Carga
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
