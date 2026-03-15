import { useState, useEffect, useMemo } from 'react';
import { Trash2, Pencil, Check, X, ChevronRight } from 'lucide-react';
import api from '../../api';
import { useApp } from '../../context/AppContext';

const CATEGORIES = [
  { id: 'fruits', label: 'Fruits', icon: '🍌' },
  { id: 'vegetables', label: 'Vegetables', icon: '🥕' },
  { id: 'dairy', label: 'Dairy', icon: '🧀' },
  { id: 'meat', label: 'Meat', icon: '🥩' },
  { id: 'bread', label: 'Bread', icon: '🍞' },
  { id: 'other', label: 'Other', icon: '🧺' },
];

function inferCategory(name) {
  const lower = name.toLowerCase();
  if (/(apple|banana|berry|orange|grape|fruit)/.test(lower)) return 'fruits';
  if (/(lettuce|onion|carrot|potato|tomato|veg)/.test(lower)) return 'vegetables';
  if (/(milk|cheese|yogurt|butter|dairy)/.test(lower)) return 'dairy';
  if (/(beef|chicken|pork|steak|meat|turkey|ham)/.test(lower)) return 'meat';
  if (/(bread|bun|roll|tortilla|bagel)/.test(lower)) return 'bread';
  return 'other';
}

export default function GroceryList() {
  const { activeProfile } = useApp();
  const pid = activeProfile?.id;

  const [items, setItems] = useState([]);
  const [inputText, setInputText] = useState('');
  const [activeCategory, setActiveCategory] = useState(null); // filter + hint for new items
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

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

  async function addItemFromInput(e) {
    e.preventDefault();
    if (!inputText.trim()) return;
    const name = inputText.trim();
    const category = activeCategory || inferCategory(name);

    const { data } = await api.post(`/profiles/${pid}/groceries`, {
      name,
      quantity: '1',
      category,
    });
    setItems((prev) => [data, ...prev]);
    setInputText('');
  }

  async function toggleCheck(item) {
    const { data } = await api.put(`/profiles/${pid}/groceries/${item.id}`, { ...item, checked: !item.checked });
    setItems((prev) => prev.map((i) => i.id === item.id ? data : i));
  }

  async function deleteItem(id) {
    await api.delete(`/profiles/${pid}/groceries/${id}`);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function saveEdit(item) {
    const { data } = await api.put(`/profiles/${pid}/groceries/${item.id}`, { ...item, ...editData });
    setItems((prev) => prev.map((i) => i.id === item.id ? data : i));
    setEditId(null);
  }

  const filtered = useMemo(() => {
    if (!activeCategory) return items;
    return items.filter((i) => i.category === activeCategory);
  }, [items, activeCategory]);

  const unchecked = filtered.filter((i) => !i.checked);
  const checked   = filtered.filter((i) => i.checked);

  const handleCategoryClick = (id) => {
    setActiveCategory((prev) => (prev === id ? null : id));
  };

  const handleNextCategory = () => {
    const ids = CATEGORIES.map((c) => c.id);
    if (!activeCategory) {
      setActiveCategory(ids[0]);
      return;
    }
    const idx = ids.indexOf(activeCategory);
    const next = ids[(idx + 1) % ids.length];
    setActiveCategory(next);
  };

  return (
    <div className="bg-cream-dark rounded-3xl shadow-card p-6 flex flex-col h-full" style={{ backgroundColor: '#EDE9E5' }}>
      {/* Top input */}
      <div className="mb-5">
        <form
          onSubmit={addItemFromInput}
          className="w-full flex items-center px-4 py-3 rounded-full border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-dusty-rose/40"
        >
          <input
            type="text"
            placeholder="write response"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-300"
          />
        </form>
      </div>

      {/* Categories */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex-1 overflow-x-auto flex gap-3 pr-2 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`min-w-[120px] flex flex-col items-center justify-between border rounded-2xl px-4 py-3 text-sm ${
                  active
                    ? 'border-dusty-rose bg-dusty-rose/10 text-gray-800'
                    : 'border-gray-200 bg-white text-gray-600'
                }`}
              >
                <div className="text-3xl mb-1">{cat.icon}</div>
                <span className="font-medium">{cat.label}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={handleNextCategory}
          className="flex-shrink-0 w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-cream hover:text-gray-700 transition-all"
          aria-label="Next category"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
        {unchecked.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-cream group transition-colors">
            <button
              onClick={() => toggleCheck(item)}
              className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-dusty-rose flex-shrink-0 transition-colors"
            />
            {editId === item.id ? (
              <div className="flex flex-1 gap-2">
                <input
                  autoFocus
                  value={editData.name ?? item.name}
                  onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                  className="flex-1 text-sm px-2 py-1 rounded-lg border border-gray-200 focus:outline-none"
                />
                <input
                  value={editData.quantity ?? item.quantity}
                  onChange={(e) => setEditData((d) => ({ ...d, quantity: e.target.value }))}
                  className="w-14 text-sm px-2 py-1 rounded-lg border border-gray-200 focus:outline-none text-center"
                />
                <button onClick={() => saveEdit(item)} className="text-dusty-rose"><Check size={15} /></button>
                <button onClick={() => setEditId(null)} className="text-gray-300"><X size={15} /></button>
              </div>
            ) : (
              <>
                <span className="flex-1 text-sm text-gray-700">{item.name}</span>
                <span className="text-xs text-gray-400 font-medium">
                  {item.quantity}{item.unit ? ` ${item.unit}` : ''}
                  {item.category && (
                    <span className="ml-1 text-[10px] uppercase tracking-wide text-gray-300">
                      • {item.category}
                    </span>
                  )}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditId(item.id); setEditData({}); }} className="text-gray-300 hover:text-gray-500">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-dusty-rose">
                    <Trash2 size={13} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {unchecked.length === 0 && (
          <p className="text-sm text-gray-300 text-center py-4">List is empty 🛒</p>
        )}
      </div>

      {/* Checked off */}
      {checked.length > 0 && (
        <details className="mt-4 border-t border-gray-100 pt-3">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-500 select-none">
            ✓ {checked.length} got it
          </summary>
          <div className="mt-2 space-y-1">
            {checked.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-3 py-2">
                <button
                  onClick={() => toggleCheck(item)}
                  className="w-5 h-5 rounded-full bg-dusty-rose flex items-center justify-center flex-shrink-0"
                >
                  <Check size={11} className="text-white" />
                </button>
                <span className="flex-1 text-xs text-gray-400 line-through">{item.name}</span>
                <span className="text-xs text-gray-300">{item.quantity}</span>
                <button onClick={() => deleteItem(item.id)} className="text-gray-200 hover:text-dusty-rose">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
