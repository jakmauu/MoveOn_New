import React, { useState } from 'react';
import { generateMealPlan } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';

export default function AIAssistant() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('meal-plan');
  const [preferences, setPreferences] = useState({
    calories: '2000',
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
      console.log('Sending preferences:', preferences);
      const plan = await generateMealPlan(preferences);
      console.log('Received plan:', plan);
      setMealPlan(plan);
    } catch (err) {
      console.error('Error details:', err);
      setError(`Failed to generate meal plan: ${err.message}`);
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
    <div className="min-h-screen bg-gradient-to-b from-[#001a3d] to-[#002451] text-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#002451] to-[#003166] border-b border-yellow-400/20">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center gap-3">
                <span className="text-5xl">🤖</span>
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  AI Assistant
                </span>
              </h1>
              <p className="text-white/70 text-lg">
                Get personalized meal plans powered by AI
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/10">
              <p className="text-sm text-white/60 mb-1">Welcome back,</p>
              <p className="text-lg font-semibold text-yellow-400">{user?.full_name || user?.username}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 mt-8">
          <div className="max-w-7xl mx-auto px-6 md:px-16 py-8">
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Left Panel - Form */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-[#002451] to-[#003166] rounded-2xl p-8 border border-yellow-400/20 shadow-2xl sticky top-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">⚙️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Customize Your Plan</h2>
                  </div>
                  
                  <p className="text-white/60 text-sm mb-6">
                    Fill in your preferences and our AI will create a personalized meal plan just for you!
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Daily Calorie Target */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-white font-medium">
                        <span className="text-xl">🔥</span>
                        <span>Daily Calorie Target</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="calories"
                          value={preferences.calories}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl bg-[#001a3d] border border-white/10 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none transition"
                          placeholder="e.g., 2000"
                          required
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">kcal</span>
                      </div>
                      <p className="text-xs text-white/40 pl-1">Recommended: 1500-3000 kcal/day</p>
                    </div>

                    {/* Diet Type */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-white font-medium">
                        <span className="text-xl">🥗</span>
                        <span>Diet Type</span>
                      </label>
                      <select
                        name="dietType"
                        value={preferences.dietType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-[#001a3d] border border-white/10 text-white focus:border-yellow-400 focus:outline-none transition cursor-pointer"
                      >
                        <option value="balanced">🍽️ Balanced</option>
                        <option value="low-carb">🥩 Low Carb</option>
                        <option value="high-protein">💪 High Protein</option>
                        <option value="vegetarian">🥬 Vegetarian</option>
                        <option value="vegan">🌱 Vegan</option>
                      </select>
                    </div>

                    {/* Allergies/Restrictions */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-white font-medium">
                        <span className="text-xl">⚠️</span>
                        <span>Allergies/Restrictions</span>
                      </label>
                      <input
                        type="text"
                        name="allergies"
                        value={preferences.allergies}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-[#001a3d] border border-white/10 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none transition"
                        placeholder="e.g., nuts, dairy, gluten"
                      />
                      <p className="text-xs text-white/40 pl-1">Separate multiple items with commas</p>
                    </div>

                    {/* Fitness Goal */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-white font-medium">
                        <span className="text-xl">🎯</span>
                        <span>Fitness Goal</span>
                      </label>
                      <select
                        name="goal"
                        value={preferences.goal}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-[#001a3d] border border-white/10 text-white focus:border-yellow-400 focus:outline-none transition cursor-pointer"
                      >
                        <option value="maintenance">⚖️ Maintenance</option>
                        <option value="weight-loss">📉 Weight Loss</option>
                        <option value="muscle-gain">💪 Muscle Gain</option>
                      </select>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 px-6 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-[#001a3d] rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#001a3d]"></div>
                          <span>Generating Your Plan...</span>
                        </>
                      ) : (
                        <>
                          <span>✨</span>
                          <span>Generate Meal Plan</span>
                        </>
                      )}
                    </button>
                  </form>

                  {error && (
                    <div className="mt-6 p-4 bg-red-500/20 border border-red-400 rounded-xl flex items-start gap-3">
                      <span className="text-2xl">❌</span>
                      <div className="flex-1">
                        <p className="text-red-300 font-semibold mb-1">Error</p>
                        <p className="text-red-200 text-sm">{error}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Results */}
              <div className="lg:col-span-3">
                <div className="bg-gradient-to-br from-[#002451] to-[#003166] rounded-2xl border border-yellow-400/20 shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-400/10 to-orange-400/10 border-b border-white/10 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">🍽️</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">Your Meal Plan</h2>
                          <p className="text-white/60 text-sm">AI-generated nutrition guide</p>
                        </div>
                      </div>
                      {mealPlan && (
                        <div className="bg-green-500/20 text-green-300 px-4 py-2 rounded-lg border border-green-400/30 flex items-center gap-2">
                          <span>✅</span>
                          <span className="font-semibold">Generated</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-yellow-400"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl">🤖</span>
                          </div>
                        </div>
                        <p className="mt-6 text-white/70 text-lg font-medium">AI is creating your perfect meal plan...</p>
                        <p className="mt-2 text-white/40 text-sm">This may take a few moments</p>
                      </div>
                    ) : mealPlan ? (
                      <div className="space-y-6">
                        {/* Meal Cards */}
                        {[
                          { key: 'breakfast', icon: '🌅', color: 'from-orange-400 to-yellow-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-400/30' },
                          { key: 'lunch', icon: '☀️', color: 'from-yellow-400 to-green-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-400/30' },
                          { key: 'dinner', icon: '🌙', color: 'from-blue-400 to-purple-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-400/30' }
                        ].map(({ key, icon, color, bgColor, borderColor }) => (
                          mealPlan[key] && (
                            <div key={key} className={`bg-[#001a3d] rounded-xl overflow-hidden border ${borderColor}`}>
                              {/* Meal Header */}
                              <div className={`${bgColor} border-b border-white/10 p-5`}>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg`}>
                                      <span className="text-2xl">{icon}</span>
                                    </div>
                                    <div>
                                      <h3 className="text-xl font-bold text-white capitalize">{key}</h3>
                                      <p className="text-white/60 text-sm">{mealPlan[key].name}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Macros Grid */}
                                <div className="grid grid-cols-4 gap-3">
                                  <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                                    <div className="text-2xl mb-1">🔥</div>
                                    <div className="text-lg font-bold text-white">{mealPlan[key].calories}</div>
                                    <div className="text-xs text-white/60">Calories</div>
                                  </div>
                                  <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                                    <div className="text-2xl mb-1">💪</div>
                                    <div className="text-lg font-bold text-blue-400">{mealPlan[key].protein}g</div>
                                    <div className="text-xs text-white/60">Protein</div>
                                  </div>
                                  <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                                    <div className="text-2xl mb-1">🌾</div>
                                    <div className="text-lg font-bold text-yellow-400">{mealPlan[key].carbs}g</div>
                                    <div className="text-xs text-white/60">Carbs</div>
                                  </div>
                                  <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                                    <div className="text-2xl mb-1">🥑</div>
                                    <div className="text-lg font-bold text-green-400">{mealPlan[key].fat}g</div>
                                    <div className="text-xs text-white/60">Fat</div>
                                  </div>
                                </div>
                              </div>

                              {/* Meal Content */}
                              <div className="p-5 space-y-4">
                                {/* Ingredients */}
                                <div>
                                  <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                                    <span className="text-lg">🛒</span>
                                    <span>Ingredients</span>
                                  </h5>
                                  <div className="grid sm:grid-cols-2 gap-2">
                                    {mealPlan[key].ingredients.map((ingredient, i) => (
                                      <div key={i} className="flex items-start gap-2 text-sm text-white/80 bg-white/5 rounded-lg px-3 py-2">
                                        <span className="text-yellow-400 mt-0.5">✓</span>
                                        <span>{ingredient}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Instructions */}
                                <div>
                                  <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                                    <span className="text-lg">👨‍🍳</span>
                                    <span>Cooking Instructions</span>
                                  </h5>
                                  <p className="text-white/70 leading-relaxed text-sm bg-white/5 rounded-lg p-4 border border-white/10">
                                    {mealPlan[key].instructions}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        ))}

                        {/* Daily Summary */}
                        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-6 border border-green-400/30">
                          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-xl">📊</span>
                            <span>Daily Summary</span>
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-3xl mb-2">🔥</div>
                              <div className="text-2xl font-bold text-white">
                                {Object.values(mealPlan).reduce((sum, meal) => sum + parseInt(meal.calories), 0)}
                              </div>
                              <div className="text-sm text-white/60">Total Calories</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl mb-2">💪</div>
                              <div className="text-2xl font-bold text-blue-400">
                                {Object.values(mealPlan).reduce((sum, meal) => sum + parseInt(meal.protein), 0)}g
                              </div>
                              <div className="text-sm text-white/60">Total Protein</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl mb-2">🌾</div>
                              <div className="text-2xl font-bold text-yellow-400">
                                {Object.values(mealPlan).reduce((sum, meal) => sum + parseInt(meal.carbs), 0)}g
                              </div>
                              <div className="text-sm text-white/60">Total Carbs</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl mb-2">🥑</div>
                              <div className="text-2xl font-bold text-green-400">
                                {Object.values(mealPlan).reduce((sum, meal) => sum + parseInt(meal.fat), 0)}g
                              </div>
                              <div className="text-sm text-white/60">Total Fat</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20">
                        <div className="text-7xl mb-6">🍽️</div>
                        <h3 className="text-2xl font-bold text-white mb-3">Ready to Create Your Meal Plan?</h3>
                        <p className="text-white/60 text-center max-w-md mb-6">
                          Fill in your preferences on the left and click "Generate Meal Plan" to get started with your personalized nutrition guide
                        </p>
                        <div className="flex gap-3">
                          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                            <span>✨</span>
                            <span className="text-sm text-white/70">AI-Powered</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                            <span>⚡</span>
                            <span className="text-sm text-white/70">Instant Results</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                            <span>🎯</span>
                            <span className="text-sm text-white/70">Personalized</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}