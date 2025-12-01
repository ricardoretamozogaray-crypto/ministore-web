import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'seller'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/register', formData);
            alert('Registro exitoso! Por favor inicia sesión.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Falló el registro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark p-4">
            <div className="max-w-sm w-full bg-surface rounded-xl shadow-soft border border-border p-8 dark:bg-surface-dark dark:border-border-dark">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-green-50 p-3 rounded-xl mb-4 dark:bg-green-900/20">
                        <UserPlus className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-text-main dark:text-gray-100">Crear Cuenta</h2>
                    <p className="text-sm text-text-secondary mt-1 dark:text-gray-400">Únete al sistema</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Usuario"
                        type="text"
                        required
                        placeholder="Elige un usuario"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />

                    <Input
                        label="Contraseña"
                        type="password"
                        required
                        placeholder="Elige una contraseña"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />

                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide dark:text-gray-400">Rol</label>
                        <select
                            className="w-full px-3 py-2 bg-white border border-border rounded-md text-sm text-text-main transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-border-dark dark:text-gray-100"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="seller">Vendedor</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-green-600 hover:bg-green-700 focus:ring-green-500"
                    >
                        {loading ? 'Creando Cuenta...' : 'Registrarse'}
                    </Button>

                    <div className="text-center pt-2">
                        <Link to="/login" className="text-sm text-text-secondary hover:text-text-main flex items-center justify-center gap-1 transition-colors dark:text-gray-400 dark:hover:text-gray-200">
                            <ArrowLeft className="w-4 h-4" /> Volver al Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
