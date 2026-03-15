import Sidebar from '../components/Dashboard/Sidebar';
import GroceryList from '../components/Grocery/GroceryList';
import GroceryBudget from '../components/Grocery/GroceryBudget';

export default function GroceryPage() {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      <main className="flex-1 p-8 flex flex-col gap-6 overflow-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Add something to your list
          </h1>
        </div>

        <div className="flex-1 max-w-5xl flex flex-col xl:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <GroceryList />
          </div>
          <div className="w-full xl:w-80 flex-shrink-0">
            <GroceryBudget />
          </div>
        </div>
      </main>
    </div>
  );
}
