import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Upload, X, AlertTriangle, CheckCircle, Info, Image as ImageIcon, Plus } from 'lucide-react';
import { UNIT_CONFIG } from '../../utils/inventoryConfig';
import api from '../../utils/api';
import clsx from 'clsx';

export default function ProductForm({ initialData = null, onClose, onSuccess }) {
    // 1. State Management
    const [values, setValues] = useState({
        name: '', description: '', price: '', cost: '', stock: '', min_stock: '', category_id: '',
        unit_type: 'unit', image_url: '', image_mode: 'url'
    });

    // We'll manage warnings and errors
    const [errors, setErrors] = useState({});
    const [warnings, setWarnings] = useState({});
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // New Category State
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

    const isEditMode = !!initialData;

    // 2. Initial Data Loading
    useEffect(() => {
        fetchCategories();
        if (initialData) {
            setValues({
                ...initialData,
                price: parseFloat(initialData.price),
                cost: parseFloat(initialData.cost || 0),
                stock: parseFloat(initialData.stock),
                min_stock: parseFloat(initialData.min_stock || 0),
                image_mode: initialData.image_url ? 'url' : 'url',
                image_url: initialData.image_url || '',
                unit_type: initialData.unit_type || 'unit',
                description: initialData.description || ''
            });
        } else {
            // Apply defaults for create mode
            setValues(prev => ({
                ...prev,
                min_stock: UNIT_CONFIG['unit'].minStockRecommendation
            }));
        }
    }, [initialData]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // 3. Computed Status & Validation Logic
    const config = UNIT_CONFIG[values.unit_type] || UNIT_CONFIG['unit'];

    useEffect(() => {
        const newErrors = {};
        const newWarnings = {};

        // Price & Cost Validation
        if (Number(values.price) < 0) newErrors.price = "El precio no puede ser negativo";
        if (Number(values.cost) < 0) newErrors.cost = "El costo no puede ser negativo";
        if (Number(values.price) < Number(values.cost) && Number(values.price) > 0) {
            newWarnings.price = "Estás vendiendo por debajo del costo";
        }

        // Stock Validation
        if (Number(values.stock) < 0) newErrors.stock = "El stock no puede ser negativo";

        // Decimals check
        if (!config.allowDecimals && values.stock && Number(values.stock) % 1 !== 0) {
            newErrors.stock = "Esta unidad no acepta decimales";
        }

        // Min Stock Validation
        if (Number(values.min_stock) < 0) newErrors.min_stock = "No puede ser negativo";
        if (Number(values.min_stock) > Number(values.stock) && values.stock !== '') {
            newWarnings.min_stock = "El stock actual ya está por debajo del mínimo";
        }

        setErrors(newErrors);
        setWarnings(newWarnings);
    }, [values, config]);

    // 4. Handlers
    const handleChange = (field, value) => {
        setValues(prev => {
            const newValues = { ...prev, [field]: value };

            // Auto-update min_stock recommendation when unit changes (only if creating or field is empty)
            if (field === 'unit_type' && (!isEditMode || !prev.min_stock)) {
                newValues.min_stock = UNIT_CONFIG[value]?.minStockRecommendation || 0;
            }

            return newValues;
        });
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            setIsLoading(true);
            const res = await api.post('/categories', { name: newCategoryName });
            setCategories([...categories, res.data]);
            setValues(prev => ({ ...prev, category_id: res.data.id }));
            setShowNewCategoryInput(false);
            setNewCategoryName('');
        } catch (error) {
            alert('Error al crear categoría');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final Validation Check
        if (Object.keys(errors).length > 0) return;
        if (!values.name || !values.price || !values.category_id) {
            alert('Por favor completa los campos obligatorios');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                ...values,
                price: Number(values.price),
                cost: Number(values.cost || 0),
                stock: Number(values.stock),
                min_stock: Number(values.min_stock || 0)
            };

            if (isEditMode) {
                await api.put(`/products/${initialData.id}`, payload);
            } else {
                await api.post('/products', payload);
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Error al guardar: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSaving(false);
        }
    };

    const isFormValid = Object.keys(errors).length === 0 && values.name && values.price && values.category_id;

    // 5. Render Helpers
    const SuffixInput = ({ label, value, onChange, suffix, placeholder, type = "text", step, error, warning, required }) => (
        <div className="w-full">
            <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide dark:text-gray-400">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative flex shadow-sm rounded-md">
                <input
                    type={type}
                    step={step}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={clsx(
                        "flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border text-sm focus:outline-none focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:text-gray-100",
                        error ? "border-red-500 focus:border-red-500" : warning ? "border-amber-500 focus:border-amber-500" : "border-border focus:border-primary dark:border-border-dark"
                    )}
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-border bg-gray-50 text-gray-500 text-sm dark:bg-gray-800 dark:border-border-dark dark:text-gray-400">
                    {suffix}
                </span>
            </div>
            {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><X className="w-3 h-3" /> {error}</p>}
            {warning && <p className="mt-1 text-xs text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {warning}</p>}
        </div>
    );

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                        <Input
                            label="Nombre del Producto"
                            value={values.name}
                            onChange={e => handleChange('name', e.target.value)}
                            required
                            placeholder="Ej: Coca Cola 1.5L"
                        />
                    </div>

                    {/* Category Selection with "Smart" Create */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide dark:text-gray-400">
                            Categoría <span className="text-red-500">*</span>
                        </label>
                        {!showNewCategoryInput ? (
                            <div className="flex gap-2">
                                <select
                                    className="flex-1 w-full px-3 py-2 bg-white border border-border rounded-md text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                                    value={values.category_id}
                                    onChange={e => handleChange('category_id', e.target.value)}
                                >
                                    <option value="">Seleccionar...</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <Button type="button" size="sm" variant="secondary" onClick={() => setShowNewCategoryInput(true)} title="Crear nueva categoría">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:border-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                                    placeholder="Nombre de nueva categoría"
                                    value={newCategoryName}
                                    onChange={e => setNewCategoryName(e.target.value)}
                                    autoFocus
                                />
                                <Button type="button" size="sm" onClick={handleCreateCategory} disabled={!newCategoryName.trim()}>
                                    <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button type="button" size="sm" variant="secondary" onClick={() => setShowNewCategoryInput(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide dark:text-gray-400">
                            Tipo de Unidad
                        </label>
                        <select
                            className="w-full px-3 py-2 bg-white border border-border rounded-md text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                            value={values.unit_type}
                            onChange={e => handleChange('unit_type', e.target.value)}
                        >
                            {Object.entries(UNIT_CONFIG).map(([key, conf]) => (
                                <option key={key} value={key}>{conf.label}</option>
                            ))}
                        </select>
                        {isEditMode && (
                            <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                                <Info className="w-3 h-3" /> Cambiar esto afecta el inventario
                            </p>
                        )}
                    </div>
                </div>

                {/* Pricing & Stock - Flat Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SuffixInput
                        label="Precio Venta"
                        value={values.price}
                        onChange={v => handleChange('price', v)}
                        suffix="S/."
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        required
                        error={errors.price}
                        warning={warnings.price}
                    />
                    <SuffixInput
                        label="Costo Compra"
                        value={values.cost}
                        onChange={v => handleChange('cost', v)}
                        suffix="S/."
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        error={errors.cost}
                    />
                    <SuffixInput
                        label="Stock Actual"
                        value={values.stock}
                        onChange={v => handleChange('stock', v)}
                        suffix={config.suffix}
                        type="number"
                        step={config.step}
                        placeholder={config.placeholder}
                        required
                        error={errors.stock}
                        warning={warnings.stock}
                    />
                    <SuffixInput
                        label="Stock Mínimo"
                        value={values.min_stock}
                        onChange={v => handleChange('min_stock', v)}
                        suffix={config.suffix}
                        type="number"
                        step={config.step}
                        placeholder={config.step.toString()}
                        error={errors.min_stock}
                        warning={warnings.min_stock}
                    />
                </div>

                {/* Image Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide dark:text-gray-400">Descripción</label>
                        <textarea
                            className="w-full px-3 py-2 bg-white border border-border rounded-md text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                            rows="4"
                            value={values.description}
                            onChange={e => handleChange('description', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide dark:text-gray-400">Imagen</label>
                        <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors dark:border-border-dark dark:hover:bg-gray-800">
                            {values.image_url ? (
                                <div className="relative group w-full aspect-square mb-2">
                                    <img src={values.image_url} alt="Preview" className="w-full h-full object-cover rounded-md" onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Error'} />
                                    <button
                                        type="button"
                                        onClick={() => handleChange('image_url', '')}
                                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            ) : (
                                <div className="mb-4 text-text-muted">
                                    <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p className="text-xs">Sin imagen</p>
                                </div>
                            )}

                            <div className="w-full">
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    className="w-full px-2 py-1.5 text-xs border border-border rounded focus:outline-none focus:border-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                                    value={values.image_url}
                                    onChange={e => handleChange('image_url', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Mode Footer */}
                {isEditMode && initialData && (
                    <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                        <div>
                            <span className="font-semibold">Creado:</span> {new Date(initialData.created_at).toLocaleDateString()}
                        </div>
                        {/* TODO: Add 'Total Vendido' once backend supports it */}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-border-dark">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={!isFormValid || isSaving || isLoading}
                        className={clsx(isSaving && "opacity-75 cursor-wait")}
                    >
                        {isSaving ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Crear Producto'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
