import React, { useState } from 'react';
import { generateMealPlan } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';

export default function MealPlanner() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    calories: '',
    dietType: 'balanced',
    allergies: '',
    goal: 'maintenance'
  });
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('Memproses preferences:', preferences);
      const plan = await generateMealPlan(preferences);
      console.log('Rencana makan diterima:', plan);
      setMealPlan(plan);
    } catch (err) {
      console.error('Error detail:', err);
      setError(err.message || 'Terjadi kesalahan saat membuat rencana makan');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-[#001a3d] text-white px-6 md:px-16 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Meal Planner AI</h1>
          <div className="text-sm text-gray-400">
            Selamat datang, {user?.username || 'User'}!
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-[#002a5c] p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-6">Buat Rencana Makan</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 font-medium">Target Kalori Harian</label>
                <input
                  type="number"
                  name="calories"
                  value={preferences.calories}
                  onChange={handleChange}
                  className="w-full p-3 rounded bg-[#001a3d] border border-[#0055b8] focus:outline-none focus:border-[#0066dd] text-white"
                  placeholder="Contoh: 2000"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Jenis Diet</label>
                <select
                  name="dietType"
                  value={preferences.dietType}
                  onChange={handleChange}
                  className="w-full p-3 rounded bg-[#001a3d] border border-[#0055b8] focus:outline-none focus:border-[#0066dd] text-white"
                >
                  <option value="balanced">Seimbang</option>
                  <option value="low-carb">Rendah Karbohidrat</option>
                  <option value="high-protein">Tinggi Protein</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">Alergi/Pantangan</label>
                <input
                  type="text"
                  name="allergies"
                  value={preferences.allergies}
                  onChange={handleChange}
                  className="w-full p-3 rounded bg-[#001a3d] border border-[#0055b8] focus:outline-none focus:border-[#0066dd] text-white"
                  placeholder="Contoh: kacang, susu"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Tujuan Kebugaran</label>
                <select
                  name="goal"
                  value={preferences.goal}
                  onChange={handleChange}
                  className="w-full p-3 rounded bg-[#001a3d] border border-[#0055b8] focus:outline-none focus:border-[#0066dd] text-white"
                >
                  <option value="maintenance">Pertahankan Berat</option>
                  <option value="weight-loss">Turun Berat Badan</option>
                  <option value="muscle-gain">Naik Massa Otot</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0055b8] hover:bg-[#0066dd] disabled:bg-gray-600 rounded font-semibold transition-colors duration-200"
              >
                {loading ? 'Membuat Rencana...' : 'Buat Rencana Makan'}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded text-red-200">
                <p className="font-semibold mb-1">Error:</p>
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Result Section */}
          <div className="bg-[#002a5c] p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-6">Hasil Rencana Makan</h2>
            
            {loading && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0055b8] mx-auto mb-4"></div>
                  <p className="text-gray-300">Sedang membuat rencana makan...</p>
                </div>
              </div>
            )}

            {!loading && mealPlan && (
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {['breakfast', 'lunch', 'dinner'].map(mealType => {
                  const meal = mealPlan[mealType];
                  if (!meal) return null;

                  const mealLabels = {
                    breakfast: '🥣 Sarapan',
                    lunch: '🍽️ Makan Siang',
                    dinner: '🍲 Makan Malam'
                  };

                  return (
                    <div key={mealType} className="bg-[#001a3d] p-4 rounded-lg border-l-4 border-[#0055b8]">
                      <h3 className="text-lg font-semibold mb-3">{mealLabels[mealType]}</h3>
                      
                      <div className="space-y-3 text-sm">
                        <div className="font-medium text-[#66d9ff]">{meal.name}</div>
                        
                        <div className="grid grid-cols-2 gap-2 text-gray-300">
                          <div>Kalori: <span className="text-white font-semibold">{meal.calories}</span></div>
                          <div>Protein: <span className="text-white font-semibold">{meal.protein}g</span></div>
                          <div>Karbohidrat: <span className="text-white font-semibold">{meal.carbs}g</span></div>
                          <div>Lemak: <span className="text-white font-semibold">{meal.fat}g</span></div>
                        </div>

                        {meal.ingredients && meal.ingredients.length > 0 && (
                          <div>
                            <p className="font-medium text-gray-300 mb-1">Bahan:</p>
                            <ul className="list-disc list-inside text-gray-300 space-y-1">
                              {meal.ingredients.map((ingredient, i) => (
                                <li key={i} className="text-xs">{ingredient}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {meal.instructions && (
                          <div>
                            <p className="font-medium text-gray-300 mb-1">Cara Membuat:</p>
                            <p className="text-xs text-gray-300">{meal.instructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && !mealPlan && (
              <div className="flex items-center justify-center h-96">
                <p className="text-gray-400 text-center">
                  Isi form di sebelah dan klik "Buat Rencana Makan" untuk melihat hasil di sini
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}