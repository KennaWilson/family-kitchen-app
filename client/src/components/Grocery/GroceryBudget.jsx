import { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import { useApp } from '../../context/AppContext';

const BASE_PRICES = {
  fruits: 3.0,
  vegetables: 2.5,
  dairy: 4.0,
  meat: 8.0,
  bread: 3.0,
  other: 3.0,
};

function toNumberQuantity(qty) {
  if (!qty) return 1;
  const n = parseFloat(String(qty).replace(',', '.'));
  return Number.isNaN(n) || n <= 0 ? 1 : n;
}

export default function GroceryBudget() {
  const { activeProfile } = useApp();
  const pid = activeProfile?.id;

  const [items, setItems] = useState([]);
  const [priceLevel, setPriceLevel] = useState(100); // percent, 100 = base

  useEffect(() => {
    if (!pid) return;

    const fetchItems = () => {
      api
        .get(`/profiles/${pid}/groceries`)
        .then((r) => setItems(r.data))
        .catch(console.error);
    };

    fetchItems();
    const handler = () => fetchItems();
    window.addEventListener('domus:groceries-updated', handler);

    return () => {
      window.removeEventListener('domus:groceries-updated', handler);
    };
  }, [pid]);

  const { estimatedTotal, byCategory } = useMemo(() => {
    const factor = priceLevel / 100;
    const catTotals = {};
    let total = 0;

    items.forEach((item) => {
      const cat = item.category || 'other';
      const base = BASE_PRICES[cat] ?? BASE_PRICES.other;
      const qty = toNumberQuantity(item.quantity);
      const line = base * qty * factor;
      total += line;
      catTotals[cat] = (catTotals[cat] || 0) + line;
    });

    return { estimatedTotal: total, byCategory: catTotals };
  }, [items, priceLevel]);

  if (!pid) return null;

  return (
    <div className="bg-cream-dark rounded-3xl shadow-card p-6 flex flex-col gap-4" style={{ backgroundColor: '#EDE9E5' }}>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Budget estimator</h2>
      <p className="text-xs text-gray-500 mb-2">
        Rough estimate based on typical prices. Adjust the slider for your store.
      </p>

      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
            Estimated total
          </p>
          <p className="text-2xl font-semibold text-purple-ash">
            ${estimatedTotal.toFixed(2)}
          </p>
        </div>
        <div className="text-right text-xs text-gray-400">
          <p>Price level: {priceLevel}%</p>
        </div>
      </div>

      <div className="mt-1">
        <input
          type="range"
          min="50"
          max="150"
          value={priceLevel}
          onChange={(e) => setPriceLevel(Number(e.target.value))}
          className="w-full accent-dusty-rose"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>Budget</span>
          <span>Typical</span>
          <span>Spendier</span>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-gray-600">
        {Object.entries(byCategory).map(([cat, value]) => (
          <div key={cat} className="flex justify-between">
            <span className="capitalize">{cat}</span>
            <span>${value.toFixed(2)}</span>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-gray-300 mt-2">Add items to see an estimate.</p>
        )}
      </div>
    </div>
  );
}

