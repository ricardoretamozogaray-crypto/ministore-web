import React from 'react';
import { Package, DollarSign, TrendingUp, CreditCard } from 'lucide-react';

export default function MetricsBar({ metrics }) {
    const { total_products, total_value, total_cost, potential_profit } = metrics;

    const cards = [
        {
            label: 'Total Productos',
            value: total_products,
            icon: Package,
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            label: 'Valor Inventario',
            value: `S/. ${(total_value || 0).toFixed(2)}`,
            icon: DollarSign,
            color: 'text-green-600',
            bg: 'bg-green-50 dark:bg-green-900/20'
        },
        {
            label: 'Costo Total',
            value: `S/. ${(total_cost || 0).toFixed(2)}`,
            icon: CreditCard,
            color: 'text-orange-600',
            bg: 'bg-orange-50 dark:bg-orange-900/20'
        },
        {
            label: 'Ganancia Potencial',
            value: `S/. ${(potential_profit || 0).toFixed(2)}`,
            icon: TrendingUp,
            color: 'text-purple-600',
            bg: 'bg-purple-50 dark:bg-purple-900/20'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((card, index) => (
                <div key={index} className="bg-surface border border-border rounded-lg p-4 shadow-sm dark:bg-surface-dark dark:border-border-dark flex items-center gap-4">
                    <div className={`p-3 rounded-full ${card.bg} ${card.color}`}>
                        <card.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-text-muted uppercase font-semibold">{card.label}</p>
                        <p className="text-xl font-bold text-text-main dark:text-gray-100">{card.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
