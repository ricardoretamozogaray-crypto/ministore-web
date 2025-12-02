import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, X, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import clsx from 'clsx';

export default function POS() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState([]);
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

    // Price Editing State
    const [editingItem, setEditingItem] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [editMode, setEditMode] = useState('unit'); // 'unit' or 'total'

    useEffect(() => {
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
        fetchData();
    }, []);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const handlePriceEdit = (item, mode) => {
        setEditingItem(item);
        setEditMode(mode);
        setEditValue(item.price.toString());
    };

    const applyPriceChange = () => {
        if (!editingItem || !editValue) return;

        const value = parseFloat(editValue);

        if (isNaN(value) || value < 0) {
            alert('Valor inválido');
            return;
        }

        let newUnitPrice = editingItem.price;

        if (editMode === 'unit') {
            newUnitPrice = value;
        } else if (editMode === 'total') {
            newUnitPrice = value / editingItem.quantity;
        }

        setCart(prev => prev.map(item =>
            item.id === editingItem.id ? { ...item, price: newUnitPrice } : item
        ));

        setEditingItem(null);
        setEditValue('');
    };

    const total = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    const handleCheckout = async (paymentMethod) => {
        if (cart.length === 0) return;

        try {
            const saleData = {
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                payment_method: paymentMethod
            };

            await api.post('/sales', saleData);
            alert('Venta realizada con éxito!');
            setCart([]);
            setIsMobileCartOpen(false);
            const prodRes = await api.get('/products');
            setProducts(prodRes.data);
        } catch (error) {
            alert('Error al procesar venta: ' + error.response?.data?.message);
        }
    };

    const filteredProducts = products.filter(p =>
        (selectedCategory === 'all' || p.category_id === Number(selectedCategory)) &&
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] lg:h-[calc(100vh-8rem)] gap-4 lg:gap-6 relative">
            {/* Product Grid Area */}
            <div className="flex-1 flex flex-col gap-4 min-w-0 h-full overflow-hidden">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full pl-9 pr-4 py-3 lg:py-2 bg-white border border-border rounded-md text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="w-full sm:w-48 px-3 py-3 lg:py-2 bg-white border border-border rounded-md text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">Todas</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto pb-24 lg:pb-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                        {filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                disabled={product.stock <= 0}
                                className={`bg-surface border border-border rounded-lg p-3 lg:p-4 flex flex-col gap-2 lg:gap-3 text-left transition-all duration-200 active:scale-[0.98] group dark:bg-surface-dark dark:border-border-dark ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 shadow-sm'
                                    }`}
                            >
                                <div className="aspect-square bg-gray-50 rounded-md flex items-center justify-center overflow-hidden dark:bg-gray-800 relative">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-gray-300 text-xl lg:text-2xl font-bold dark:text-gray-600">{product.name[0]}</div>
                                    )}
                                    {product.stock <= 0 && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center font-bold text-red-500 text-sm dark:bg-black/60">
                                            Agotado
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 w-full">
                                    <h3 className="font-medium text-sm text-text-main truncate dark:text-gray-100 leading-tight">{product.name}</h3>
                                    <p className="text-xs text-text-muted mt-1">{product.stock} disp.</p>
                                </div>
                                <div className="font-semibold text-primary text-base lg:text-lg">${Number(product.price).toFixed(2)}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Cart Summary Bar (Floating) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20 dark:bg-surface-dark dark:border-border-dark">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col">
                        <span className="text-xs text-text-muted">{totalItems} items</span>
                        <span className="text-xl font-bold text-text-main dark:text-gray-100">${total.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={() => setIsMobileCartOpen(true)}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full font-medium shadow-lg active:scale-95 transition-transform"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        Ver Carrito
                        <ChevronUp className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Cart Sidebar / Mobile Drawer */}
            <>
                {/* Backdrop for mobile */}
                {isMobileCartOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                        onClick={() => setIsMobileCartOpen(false)}
                    />
                )}

                <Card className={clsx(
                    "fixed inset-x-0 bottom-0 z-50 h-[85vh] rounded-t-2xl rounded-b-none border-t shadow-2xl transition-transform duration-300 lg:static lg:h-full lg:w-96 lg:rounded-lg lg:border lg:shadow-lg lg:transform-none flex flex-col p-0 overflow-hidden dark:bg-surface-dark dark:border-border-dark",
                    isMobileCartOpen ? "translate-y-0" : "translate-y-full lg:translate-y-0"
                )}>
                    {/* Mobile Drag Handle */}
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-1 lg:hidden dark:bg-gray-700" />

                    <div className="p-4 border-b border-border bg-gray-50/50 flex items-center justify-between dark:bg-gray-800/50 dark:border-border-dark shrink-0">
                        <div className="flex items-center gap-2 font-semibold text-text-main dark:text-gray-100">
                            <ShoppingCart className="w-5 h-5" />
                            Orden Actual
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">
                                {totalItems} items
                            </span>
                            <button onClick={() => setIsMobileCartOpen(false)} className="lg:hidden text-text-muted p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-text-muted">
                                <ShoppingCart className="w-12 h-12 mb-3 opacity-10" />
                                <p className="text-sm">Carrito vacío</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/50 border border-transparent hover:border-border dark:hover:border-border-dark">
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handlePriceEdit(item, 'unit')}>
                                        <h4 className="font-medium text-sm text-text-main truncate dark:text-gray-100">{item.name}</h4>
                                        <p className="text-xs text-text-muted hover:text-primary transition-colors">
                                            ${Number(item.price).toFixed(2)} x {item.quantity}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 dark:bg-gray-800">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="p-2 hover:bg-white rounded-md text-text-secondary shadow-sm transition-all dark:hover:bg-gray-700"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium text-text-main dark:text-gray-100">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="p-2 hover:bg-white rounded-md text-text-secondary shadow-sm transition-all dark:hover:bg-gray-700"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handlePriceEdit(item, 'total')}>
                                        <div className="font-medium text-text-main text-sm w-16 text-right dark:text-gray-100">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-text-muted hover:text-red-500 p-2 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-border space-y-4 dark:bg-gray-800/50 dark:border-border-dark shrink-0 pb-8 lg:pb-4">
                        <div className="flex justify-between items-center text-xl font-bold text-text-main dark:text-gray-100">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={() => handleCheckout('cash')}
                                disabled={cart.length === 0}
                                className="bg-green-600 hover:bg-green-700 py-3 lg:py-2"
                            >
                                <Banknote className="w-5 h-5" /> Efectivo
                            </Button>
                            <Button
                                onClick={() => handleCheckout('card')}
                                disabled={cart.length === 0}
                                className="py-3 lg:py-2"
                            >
                                <CreditCard className="w-5 h-5" /> Tarjeta
                            </Button>
                        </div>
                    </div>
                </Card>
            </>

            {/* Price Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md bg-surface p-6 rounded-xl shadow-2xl dark:bg-surface-dark dark:border-border-dark">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-text-main dark:text-gray-100">Modificar Precio</h3>
                            <button onClick={() => setEditingItem(null)} className="text-text-muted hover:text-text-main">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-text-muted mb-2">Producto: <span className="font-medium text-text-main dark:text-gray-100">{editingItem.name}</span></p>
                            <p className="text-sm text-text-muted">Precio Actual: ${Number(editingItem.price).toFixed(2)}</p>
                            <p className="text-sm text-text-muted">Cantidad: {editingItem.quantity}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex bg-gray-100 p-1 rounded-lg dark:bg-gray-800">
                                <button
                                    className={clsx(
                                        "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                                        editMode === 'unit'
                                            ? "bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-white"
                                            : "text-text-muted hover:text-text-main"
                                    )}
                                    onClick={() => {
                                        setEditMode('unit');
                                        setEditValue(editingItem.price.toString());
                                    }}
                                >
                                    Precio Unitario
                                </button>
                                <button
                                    className={clsx(
                                        "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                                        editMode === 'total'
                                            ? "bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-white"
                                            : "text-text-muted hover:text-text-main"
                                    )}
                                    onClick={() => {
                                        setEditMode('total');
                                        setEditValue((editingItem.price * editingItem.quantity).toFixed(2));
                                    }}
                                >
                                    Total
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-main mb-1 dark:text-gray-200">
                                    {editMode === 'unit' ? 'Nuevo Precio Unitario' : 'Nuevo Total'}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 bg-white border border-border rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-gray-800 dark:border-border-dark dark:text-gray-100"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && applyPriceChange()}
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <Button variant="secondary" onClick={() => setEditingItem(null)}>
                                    Cancelar
                                </Button>
                                <Button onClick={applyPriceChange}>
                                    Aplicar
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
