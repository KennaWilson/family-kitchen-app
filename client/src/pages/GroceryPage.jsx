import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar';
import GroceryList from '../components/Grocery/GroceryList';
import RecipePanel from '../components/Grocery/RecipePanel';
import MealPlan from '../components/Grocery/MealPlan';
import api from '../api';
import { useApp } from '../context/AppContext';

export default function GroceryPage() {
  const { activeProfile } = useApp();
  const pid = activeProfile?.id;
  const navigate = useNavigate();

  const [groceries, setGroceries] = useState([]);
  const [pendingMeal, setPendingMeal] = useState(null);

  useEffect(() => {
    if (!pid) return;
    api.get(`/profiles/${pid}/groceries`).then((r) => setGroceries(r.data)).catch(console.error);
  }, [pid]);

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      <main className="flex-1 p-8 flex flex-col gap-6 overflow-auto">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl hover:bg-white text-gray-400 hover:text-gray-600 transition-all">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Grocery & Recipes</h1>
            <p className="text-sm text-gray-400">Manage your list, discover recipes, and plan your week</p>
          </div>
        </div>

        {/* Two-column: grocery list + recipe panel */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1">
            <GroceryList />
          </div>
          <div className="xl:col-span-2">
            <RecipePanel
              groceryItems={groceries}
              profileId={pid}
              onAddToMealPlan={(meal) => setPendingMeal(meal)}
            />
          </div>
        </div>

        {/* Meal plan */}
        <MealPlan
          pendingMeal={pendingMeal}
          onPendingConsumed={() => setPendingMeal(null)}
        />
      </main>
    </div>
  );
}
