import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Store } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(username, password);
        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setError('Credenciales inválidas. Intente nuevamente.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark p-4">
            <div className="max-w-sm w-full bg-surface rounded-xl shadow-soft border border-border p-8 dark:bg-surface-dark dark:border-border-dark">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary/10 p-3 rounded-xl mb-4">
                        <Store className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-text-main dark:text-gray-100">Bienvenido</h2>
                    <p className="text-sm text-text-secondary mt-1 dark:text-gray-400">Inicia sesión en tu cuenta</p>
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
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Ingresa tu usuario"
                        required
                    />
                    <Input
                        label="Contraseña"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña"
                        required
                    />

                    <Button type="submit" className="w-full py-2.5" disabled={loading}>
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </Button>

                    <div className="text-center pt-2">
                        {/* Registration is now admin-only */}
                    </div>
                </form>
            </div>
        </div>
    );
}
