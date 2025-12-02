import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';
import { UserPlus, Users as UsersIcon, Shield, User } from 'lucide-react';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'seller' });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users/list');
            setUsers(data);
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
            setIsModalOpen(false);
            setNewUser({ username: '', password: '', role: 'seller' });
            fetchUsers();
            alert('Usuario creado exitosamente');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al crear usuario');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-text-main dark:text-gray-100">Gestión de Usuarios</h2>
                <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Nuevo Usuario
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                    <Card key={user.id} className="p-4 flex items-center gap-4">
                        <div className={`p-3 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            {user.role === 'admin' ? <Shield className="w-6 h-6" /> : <User className="w-6 h-6" />}
                        </div>
                        <div>
                            <p className="font-semibold text-text-main dark:text-gray-100">{user.username}</p>
                            <p className="text-sm text-text-muted capitalize">{user.role}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
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
                        <label className="block text-sm font-medium text-text-secondary mb-1">Rol</label>
                        <select
                            className="w-full px-3 py-2 border border-border rounded-md bg-surface dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        >
                            <option value="seller">Vendedor</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            Crear Usuario
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
