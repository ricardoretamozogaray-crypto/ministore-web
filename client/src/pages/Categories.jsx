import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, formData);
            } else {
                await api.post('/categories', formData);
            }
            setIsModalOpen(false);
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
            fetchCategories();
        } catch (error) {
            alert('Error: ' + error.response?.data?.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
            try {
                await api.delete(`/categories/${id}`);
                fetchCategories();
            } catch (error) {
                alert('Error al eliminar');
            }
        }
    };

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, description: category.description || '' });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
        }
        setIsModalOpen(true);
    };

    if (loading) return <div className="p-8 text-center text-text-muted">Cargando categorías...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-text-main dark:text-gray-100">Categorías</h2>
                <Button onClick={() => openModal()}>
                    <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nueva Categoría</span><span className="sm:hidden">Nueva</span>
                </Button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-surface border border-border rounded-lg shadow-soft overflow-hidden dark:bg-surface-dark dark:border-border-dark">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-border dark:bg-gray-800 dark:border-border-dark">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Descripción</th>
                            <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-border-dark">
                        {categories.map((category) => (
                            <tr key={category.id} className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/50">
                                <td className="px-6 py-4 text-sm font-medium text-text-main dark:text-gray-100">{category.name}</td>
                                <td className="px-6 py-4 text-sm text-text-secondary">{category.description || '-'}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => openModal(category)} className="text-primary hover:text-primary-hover transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(category.id)} className="text-red-500 hover:text-red-700 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden grid grid-cols-1 gap-4">
                {categories.map((category) => (
                    <div key={category.id} className="bg-surface border border-border rounded-lg p-4 shadow-sm dark:bg-surface-dark dark:border-border-dark flex justify-between items-center">
                        <div>
                            <h3 className="font-medium text-text-main dark:text-gray-100">{category.name}</h3>
                            <p className="text-sm text-text-secondary mt-1">{category.description || 'Sin descripción'}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => openModal(category)} className="p-2 bg-primary/10 text-primary rounded-md">
                                <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(category.id)} className="p-2 bg-red-50 text-red-500 rounded-md dark:bg-red-900/20">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nombre"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="py-3 lg:py-2"
                    />
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide dark:text-gray-400">Descripción</label>
                        <textarea
                            className="w-full px-3 py-3 lg:py-2 bg-white border border-border rounded-md text-sm text-text-main transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
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
        </div>
    );
}
