import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useDebounce } from './useDebounce'; // We'll need to create this or use a library

export const useInventory = () => {
    const [data, setData] = useState({
        products: [],
        pagination: { total: 0, page: 1, limit: 25, total_pages: 0 },
        metrics: { total_products: 0, total_value: 0, total_cost: 0, potential_profit: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter State
    const [filters, setFilters] = useState({
        page: 1,
        limit: 25,
        search: '',
        category_id: '',
        stock_status: '', // 'in_stock', 'low_stock', 'out_of_stock'
        min_price: '',
        max_price: '',
        min_stock: '',
        max_stock: '',
        unit_type: '',
        sort_by: 'id',
        order: 'desc'
    });

    // Debounce search to avoid too many API calls
    const debouncedSearch = useDebounce(filters.search, 300);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Construct query params
            const params = { ...filters, search: debouncedSearch };
            // Remove empty keys
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            const response = await api.get('/products', { params });
            setData({
                products: response.data.data || [],
                pagination: response.data.pagination,
                metrics: response.data.metrics
            });
        } catch (err) {
            console.error('Error fetching inventory:', err);
            setError(err.response?.data?.message || 'Error al cargar inventario');
        } finally {
            setLoading(false);
        }
    }, [filters.page, filters.limit, filters.category_id, filters.stock_status, filters.min_price, filters.max_price, filters.min_stock, filters.max_stock, filters.unit_type, filters.sort_by, filters.order, debouncedSearch]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const updateFilter = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to page 1 on filter change
        }));
    };

    const setPage = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const setSort = (column) => {
        setFilters(prev => ({
            ...prev,
            sort_by: column,
            order: prev.sort_by === column && prev.order === 'asc' ? 'desc' : 'asc'
        }));
    };

    const refresh = () => {
        fetchProducts();
    };

    return {
        ...data,
        loading,
        error,
        filters,
        updateFilter,
        setPage,
        setSort,
        refresh
    };
};
