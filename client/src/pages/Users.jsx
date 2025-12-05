import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { UserPlus, Shield, User, Search, Edit, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Users() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'seller' });
    const [editingUser, setEditingUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const results = users.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(results);
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users/list');
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/auth/register', newUser);
            setIsCreateModalOpen(false);
            setNewUser({ username: '', password: '', role: 'seller' });
            fetchUsers();
            alert('Usuario creado exitosamente');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al crear usuario');
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.put(`/users/${editingUser.id}`, { password: newPassword });
            setIsEditModalOpen(false);
            setEditingUser(null);
            setNewPassword('');
            alert('Contraseña actualizada exitosamente');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al actualizar contraseña');
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setNewPassword('');
        setError('');
        setIsEditModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-text-main dark:text-gray-100">Gestión de Usuarios</h2>
                <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Nuevo Usuario
                </Button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por nombre de usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-lg text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                />
            </div>

            {/* Users Table */}
            <div className="bg-surface border border-border rounded-lg shadow-soft overflow-hidden dark:bg-surface-dark dark:border-border-dark">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-border dark:bg-gray-800 dark:border-border-dark">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider dark:text-gray-400">Usuario</th>
                                <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider dark:text-gray-400">Rol</th>
                                <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider dark:text-gray-400 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border dark:divide-border-dark">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                                                {user.role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                            </div>
                                            <span className="font-medium text-text-main dark:text-gray-100">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${user.role === 'admin'
                                                ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                                                : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        {user.id !== currentUser?.id && (
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="inline-flex items-center justify-center p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                                                title="Cambiar Contraseña"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        )}
                                        {user.id === currentUser?.id && (
                                            <span className="text-xs text-text-muted italic dark:text-gray-500">
                                                (Tú)
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-text-muted dark:text-gray-500">
                                        No se encontraron usuarios.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Crear Nuevo Usuario"
            >
                <form onSubmit={handleCreateUser} className="space-y-4">
                    {error && (
                        <div className="text-red-500 text-sm bg-red-50 p-2 rounded dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    )}
                    <Input
                        label="Usuario"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        required
                    />
                    <Input
                        label="Contraseña"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1 dark:text-gray-400">Rol</label>
                        <select
                            className="w-full px-3 py-2 border border-border rounded-md bg-white text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        >
                            <option value="seller">Vendedor</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            Crear Usuario
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit User Modal (Change Password) */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Cambiar Contraseña: ${editingUser?.username}`}
            >
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    {error && (
                        <div className="text-red-500 text-sm bg-red-50 p-2 rounded dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    )}
                    <div className="p-3 bg-blue-50 text-blue-700 rounded-md text-sm flex items-start gap-2 dark:bg-blue-900/20 dark:text-blue-400">
                        <Lock className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>Estás cambiando la contraseña para el usuario <strong>{editingUser?.username}</strong>.</p>
                    </div>
                    <Input
                        label="Nueva Contraseña"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="Ingresa la nueva contraseña"
                    />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
