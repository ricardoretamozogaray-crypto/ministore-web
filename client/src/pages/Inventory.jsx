import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Search, Edit, Trash2, Upload, MoreVertical } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

export default function Inventory() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '', description: '', price: '', cost: '', stock: '', min_stock: '', category_id: '', image_url: '', unit_type: 'unit'
    });
    const [showLowStock, setShowLowStock] = useState(false);
    const [bulkData, setBulkData] = useState('');

    const quickStockOptions = [
        { label: 'Unidades (Manual)', value: 'manual' },
        { label: 'Media Docena (6)', value: 6 },
        { label: 'Docena (12)', value: 12 },
        { label: 'Pack 24', value: 24 },
        { label: 'Pack 50', value: 50 },
        { label: 'Pack 100', value: 100 },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, formData);
            } else {
                await api.post('/products', formData);
            }
            setIsModalOpen(false);
            setEditingProduct(null);
            setEditingProduct(null);
            setFormData({ name: '', description: '', price: '', cost: '', stock: '', min_stock: '', category_id: '', image_url: '', unit_type: 'unit' });
            fetchData();
        } catch (error) {
            alert('Error: ' + error.response?.data?.message);
        }
    };

    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        try {
            const lines = bulkData.trim().split('\n');
            const productsToCreate = lines.map(line => {
                // Format: name,price,cost,stock,min_stock,category_id,unit_type
                const [name, price, cost, stock, min_stock, category_id, unit_type] = line.split(',');
                return { name, price, cost, stock, min_stock: min_stock || 0, category_id, unit_type: unit_type || 'unit' };
            });

            for (const p of productsToCreate) {
                await api.post('/products', p);
            }

            alert('Carga masiva completada');
            setIsBulkModalOpen(false);
            setBulkData('');
            fetchData();
        } catch (error) {
            alert('Error en carga masiva. Asegúrate del formato: nombre,precio,costo,stock,stock_minimo,id_categoria');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchData();
            } catch (error) {
                alert('Error al eliminar');
            }
        }
    };

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price,
                cost: product.cost || '',
                stock: product.stock,
                min_stock: product.min_stock || 0,
                category_id: product.category_id || '',
                image_url: product.image_url || '',
                unit_type: product.unit_type || 'unit'
            });
        } else {
            setEditingProduct(null);
            setEditingProduct(null);
            setFormData({ name: '', description: '', price: '', cost: '', stock: '', min_stock: '', category_id: '', image_url: '', unit_type: 'unit' });
        }
        setIsModalOpen(true);
    };

    const handleQuickStockChange = (e) => {
        const value = e.target.value;
        if (value !== 'manual') {
            setFormData({ ...formData, stock: value });
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesLowStock = showLowStock ? p.stock <= (p.min_stock || 0) : true;
        return matchesSearch && matchesLowStock;
    });

    if (loading) return <div className="p-8 text-center text-text-muted">Cargando inventario...</div>;

    return (
        <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        className="w-full pl-9 pr-4 py-3 lg:py-2 bg-white border border-border rounded-md text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant={showLowStock ? "primary" : "secondary"}
                        onClick={() => setShowLowStock(!showLowStock)}
                        className="flex-1 sm:flex-none justify-center"
                    >
                        {showLowStock ? "Ver Todos" : "Ver Bajo Stock"}
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
                                <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Producto</th>
                                <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Precio</th>
                                <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Costo</th>
                                <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border dark:divide-border-dark">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-text-main dark:text-gray-100">{product.name}</div>
                                        {product.description && <div className="text-xs text-text-muted truncate max-w-[200px]">{product.description}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-secondary">{product.category_name || '-'}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-text-main dark:text-gray-100">${Number(product.price).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm text-text-secondary">${Number(product.cost || 0).toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${product.stock <= (product.min_stock || 0)
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden grid grid-cols-1 gap-4">
                {filteredProducts.map((product) => (
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
                                <span className="font-semibold text-text-main dark:text-gray-100">${Number(product.price).toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-text-muted">Costo</span>
                                <span className="text-sm text-text-secondary">${Number(product.cost || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-text-muted">Stock</span>
                                <span className={`text-sm font-medium ${product.stock <= (product.min_stock || 0) ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                                    }`}>
                                    {product.stock} {product.unit_type === 'kg' ? 'kg' : 'un.'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Product Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nombre"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="py-3 lg:py-2"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide dark:text-gray-400">Categoría</label>
                            <select
                                className="w-full px-3 py-3 lg:py-2 bg-white border border-border rounded-md text-sm text-text-main transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            >
                                <option value="">Seleccionar Categoría</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide dark:text-gray-400">Tipo Unidad</label>
                            <select
                                className="w-full px-3 py-3 lg:py-2 bg-white border border-border rounded-md text-sm text-text-main transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                                value={formData.unit_type}
                                onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
                            >
                                <option value="unit">Unidad</option>
                                <option value="kg">Kilogramo (kg)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Precio Venta"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                            className="py-3 lg:py-2"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Costo (Compra)"
                            type="number"
                            step="0.01"
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                            className="py-3 lg:py-2"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide dark:text-gray-400">Stock</label>
                                <input
                                    type="number"
                                    step={formData.unit_type === 'kg' ? "0.001" : "1"}
                                    className="w-full px-3 py-3 lg:py-2 bg-white border border-border rounded-md text-sm text-text-main transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    placeholder="Cant."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide dark:text-gray-400">Min. Stock</label>
                                <input
                                    type="number"
                                    step={formData.unit_type === 'kg' ? "0.001" : "1"}
                                    className="w-full px-3 py-3 lg:py-2 bg-white border border-border rounded-md text-sm text-text-main transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                                    value={formData.min_stock}
                                    onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                                    placeholder="Min."
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide dark:text-gray-400">Descripción</label>
                        <textarea
                            className="w-full px-3 py-3 lg:py-2 bg-white border border-border rounded-md text-sm text-text-main transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                            rows="2"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <Input
                        label="URL Imagen"
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="py-3 lg:py-2"
                    />

                    <div className="pt-4 flex gap-3 justify-end">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="py-3 lg:py-2">
                            Cancelar
                        </Button>
                        <Button type="submit" className="py-3 lg:py-2">
                            Guardar
                        </Button>
                    </div>
                </form>
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
