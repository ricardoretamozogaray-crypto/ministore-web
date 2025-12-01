import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

import Inventory from './pages/Inventory';
import Categories from './pages/Categories';
import POS from './pages/POS';
import Reports from './pages/Reports';
// Placeholders for other pages

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/pos" element={<POS />} />
                        <Route path="/reports" element={<Reports />} />
                    </Route>
                </Route>
            </Routes>
        </AuthProvider>
    );
}

export default App;
