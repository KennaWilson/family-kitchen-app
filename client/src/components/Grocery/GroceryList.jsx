import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import api from '../../api';
import { useApp } from '../../context/AppContext';

export default function GroceryList() {
  const { activeProfile } = useApp();
  const pid = activeProfile?.id;

  const [items, setItems] = useState([]);
  const [inputName, setInputName] = useState('');
  const [inputQty, setInputQty] = useState('1');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (!pid) return;
    api.get(`/profiles/${pid}/groceries`).then((r) => setItems(r.data)).catch(console.error);
  }, [pid]);

  async function addItem() {
    if (!inputName.trim()) return;
    const { data } = await api.post(`/profiles/${pid}/groceries`, {
      name: inputName.trim(),
      quantity: inputQty || '1',
    });
    setItems((prev) => [data, ...prev]);
    setInputName(''); setInputQty('1');
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

  const unchecked = items.filter((i) => !i.checked);
  const checked   = items.filter((i) => i.checked);

  return (
    <div className="bg-white rounded-3xl shadow-card p-6 flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Grocery List</h2>

      {/* Add item */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          placeholder="Item name…"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dusty-rose/30"
        />
        <input
          type="text"
          placeholder="Qty"
          value={inputQty}
          onChange={(e) => setInputQty(e.target.value)}
          className="w-16 text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-center"
        />
        <button
          onClick={addItem}
          className="w-10 h-10 flex items-center justify-center bg-dusty-rose text-white rounded-xl hover:bg-opacity-90 transition-all"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
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
                <span className="text-xs text-gray-400 font-medium">{item.quantity}{item.unit ? ` ${item.unit}` : ''}</span>
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
