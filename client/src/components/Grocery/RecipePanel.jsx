import { useState } from 'react';
import { ChefHat, Loader2, X, Plus } from 'lucide-react';
import api from '../../api';

export default function RecipePanel({ groceryItems, profileId, onAddToMealPlan }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [addedId, setAddedId] = useState(null);

  async function fetchRecipes() {
    setLoading(true); setError('');
    try {
      const ingredients = groceryItems
        .filter((i) => !i.checked)
        .map((i) => i.name)
        .join(',');
      const params = ingredients
        ? `ingredients=${encodeURIComponent(ingredients)}`
        : `query=${encodeURIComponent(query || 'dinner')}`;
      const { data } = await api.get(`/recipes?${params}&number=8`);
      setRecipes(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError('Could not load recipes. Check your SPOONACULAR_API_KEY in server/.env');
    } finally {
      setLoading(false);
    }
  }

  function handleAddToMealPlan(recipe) {
    onAddToMealPlan({
      recipe_title: recipe.title,
      recipe_image: recipe.image || '',
      recipe_id: String(recipe.id),
    });
    setAddedId(recipe.id);
    setTimeout(() => setAddedId(null), 2000);
  }

  return (
    <div className="bg-white rounded-3xl shadow-card p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ChefHat size={20} className="text-dusty-rose" />
        <h2 className="text-lg font-semibold text-gray-700">Recipe Ideas</h2>
      </div>

      {/* Search / generate */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search recipes or use grocery items…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchRecipes()}
          className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dusty-rose/30"
        />
        <button
          onClick={fetchRecipes}
          disabled={loading}
          className="px-5 py-2.5 bg-dusty-rose text-white text-sm font-semibold rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : null}
          {loading ? 'Loading…' : 'Generate'}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-xs text-dusty-rose bg-dusty-rose/10 rounded-xl p-3">
          <X size={14} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Recipe cards */}
      {recipes.length > 0 && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mt-1">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="rounded-2xl overflow-hidden border border-gray-100 hover:shadow-card transition-shadow group">
              {recipe.image && (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-28 object-cover"
                />
              )}
              <div className="p-3">
                <p className="text-xs font-semibold text-gray-700 leading-snug line-clamp-2 mb-2">{recipe.title}</p>
                {recipe.usedIngredientCount != null && (
                  <p className="text-[10px] text-gray-400 mb-2">
                    Uses {recipe.usedIngredientCount} of your ingredients
                  </p>
                )}
                <button
                  onClick={() => handleAddToMealPlan(recipe)}
                  className={`w-full text-xs py-1.5 rounded-xl font-medium transition-all flex items-center justify-center gap-1 ${
                    addedId === recipe.id
                      ? 'bg-green-100 text-green-600'
                      : 'bg-dusty-rose/10 text-dusty-rose hover:bg-dusty-rose hover:text-white'
                  }`}
                >
                  {addedId === recipe.id ? '✓ Added!' : <><Plus size={12} /> Meal plan</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && recipes.length === 0 && (
        <p className="text-sm text-gray-300 text-center py-4">
          Click "Generate" to get recipe ideas based on your grocery list
        </p>
      )}
    </div>
  );
}
