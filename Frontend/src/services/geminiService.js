const BACKEND_URL = 'http://localhost:5000';

// Get API key from environment variable
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Generate meal plan using Gemini AI REST API
 */
export async function generateMealPlan({ calories, dietType, allergies, goal }) {
  // If no API key, use local fallback
  if (!API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not set, using local meal plan generator');
    return generateLocalMealPlan({ calories, dietType, allergies, goal });
  }

  try {
    console.log('🤖 Generating meal plan with Gemini AI...');

    const prompt = `
Create a detailed daily meal plan in JSON format with the following requirements:

**Requirements:**
- Daily Calories: ${calories} kcal
- Diet Type: ${dietType}
- Allergies/Restrictions: ${allergies || 'None'}
- Fitness Goal: ${goal}

**Instructions:**
1. Create 3 meals: breakfast, lunch, dinner
2. Each meal should include:
   - name: descriptive meal name
   - calories: calorie count
   - protein: grams of protein
   - carbs: grams of carbohydrates
   - fat: grams of fat
   - ingredients: array of ingredients with quantities
   - instructions: step-by-step cooking instructions
3. Total calories should be approximately ${calories} kcal
4. Consider the diet type (${dietType}) and avoid ${allergies || 'nothing'}
5. Make it suitable for ${goal} goal

**Output Format (MUST BE VALID JSON ONLY, NO MARKDOWN):**
{
  "breakfast": {
    "name": "Meal name here",
    "calories": 500,
    "protein": 25,
    "carbs": 50,
    "fat": 15,
    "ingredients": ["ingredient 1 (amount)", "ingredient 2 (amount)"],
    "instructions": "Detailed cooking instructions"
  },
  "lunch": {
    "name": "Meal name here",
    "calories": 600,
    "protein": 30,
    "carbs": 60,
    "fat": 20,
    "ingredients": ["ingredient 1 (amount)", "ingredient 2 (amount)"],
    "instructions": "Detailed cooking instructions"
  },
  "dinner": {
    "name": "Meal name here",
    "calories": 500,
    "protein": 25,
    "carbs": 50,
    "fat": 15,
    "ingredients": ["ingredient 1 (amount)", "ingredient 2 (amount)"],
    "instructions": "Detailed cooking instructions"
  }
}

Provide ONLY the JSON object, no additional text, no markdown code blocks, just pure JSON.`;

    // Use Gemini REST API
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('✅ Gemini response received');

    // Extract text from Gemini response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      console.warn('⚠️ No text in Gemini response, using fallback');
      return generateLocalMealPlan({ calories, dietType, allergies, goal });
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = generatedText.trim();
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Extract JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('⚠️ Invalid JSON format in response, using fallback');
      return generateLocalMealPlan({ calories, dietType, allergies, goal });
    }

    const mealPlan = JSON.parse(jsonMatch[0]);
    
    // Validate meal plan structure
    if (!mealPlan.breakfast || !mealPlan.lunch || !mealPlan.dinner) {
      console.warn('⚠️ Incomplete meal plan, using fallback');
      return generateLocalMealPlan({ calories, dietType, allergies, goal });
    }

    console.log('✅ Meal plan generated successfully with Gemini AI');
    return mealPlan;

  } catch (error) {
    console.error('❌ Error with Gemini API:', error);
    console.warn('⚠️ Falling back to local meal plan generator');
    return generateLocalMealPlan({ calories, dietType, allergies, goal });
  }
}

/**
 * Local fallback meal plan generator
 */
function generateLocalMealPlan({ calories, dietType, allergies, goal }) {
  console.log('🏠 Generating local meal plan...');
  
  const caloriesNum = parseInt(calories);
  const breakfastCal = Math.round(caloriesNum * 0.3);
  const lunchCal = Math.round(caloriesNum * 0.4);
  const dinnerCal = Math.round(caloriesNum * 0.3);

  // Base meals by diet type
  const mealTemplates = {
    balanced: {
      breakfast: {
        name: "Balanced Breakfast Bowl",
        ingredients: ["2 scrambled eggs", "2 slices whole grain toast", "1/2 avocado", "10 cherry tomatoes", "Handful of spinach"],
        instructions: "1. Heat pan with olive oil. 2. Scramble eggs with spinach. 3. Toast bread until golden. 4. Top with sliced avocado and halved cherry tomatoes. 5. Season with salt, pepper, and herbs."
      },
      lunch: {
        name: "Grilled Chicken Salad",
        ingredients: ["150g grilled chicken breast", "2 cups mixed greens", "1/2 cup cooked quinoa", "2 tbsp olive oil", "10 cherry tomatoes", "1/2 cucumber sliced"],
        instructions: "1. Grill chicken breast and slice. 2. Mix greens with cooked quinoa. 3. Add sliced chicken, tomatoes, and cucumber. 4. Drizzle with olive oil and lemon juice. 5. Toss and serve."
      },
      dinner: {
        name: "Baked Salmon with Vegetables",
        ingredients: ["150g salmon fillet", "1 cup broccoli florets", "1 medium sweet potato", "1 tbsp olive oil", "Lemon wedges"],
        instructions: "1. Preheat oven to 180°C. 2. Season salmon with salt, pepper, and lemon. 3. Bake for 15-20 minutes. 4. Steam broccoli for 5 minutes. 5. Roast sweet potato cubes. 6. Serve together with lemon wedge."
      }
    },
    "low-carb": {
      breakfast: {
        name: "Keto Breakfast Plate",
        ingredients: ["3 eggs", "3 strips bacon", "1/2 avocado", "1 tbsp butter", "30g cheese"],
        instructions: "1. Fry eggs in butter to your liking. 2. Cook bacon until crispy. 3. Slice avocado. 4. Serve eggs with bacon, avocado, and cheese on the side."
      },
      lunch: {
        name: "Bunless Burger Bowl",
        ingredients: ["200g ground beef", "2 cups lettuce", "50g cheddar cheese", "Pickles", "Sugar-free sauce"],
        instructions: "1. Form beef into patty and grill. 2. Chop lettuce as base. 3. Place burger on lettuce. 4. Top with cheese, pickles, and sauce. 5. Serve in a bowl."
      },
      dinner: {
        name: "Grilled Steak with Greens",
        ingredients: ["200g beef steak", "2 cups mixed greens", "2 tbsp olive oil", "Garlic butter"],
        instructions: "1. Season steak with salt and pepper. 2. Grill to desired doneness (4-5 min each side for medium). 3. Let rest for 5 minutes. 4. Serve with mixed greens and garlic butter on top."
      }
    },
    "high-protein": {
      breakfast: {
        name: "Protein Power Bowl",
        ingredients: ["4 egg whites", "100g grilled chicken breast", "1/2 cup oatmeal", "1/2 cup berries", "1 scoop protein powder"],
        instructions: "1. Cook egg whites until firm. 2. Grill chicken breast. 3. Prepare oatmeal and mix in protein powder. 4. Top with berries. 5. Serve all together."
      },
      lunch: {
        name: "Chicken & Brown Rice",
        ingredients: ["200g grilled chicken", "1 cup cooked brown rice", "1 cup broccoli", "2 tbsp soy sauce"],
        instructions: "1. Grill chicken breast and slice. 2. Cook brown rice according to package. 3. Steam broccoli. 4. Mix all ingredients. 5. Add soy sauce and toss."
      },
      dinner: {
        name: "Tuna Steak with Quinoa",
        ingredients: ["200g tuna steak", "3/4 cup cooked quinoa", "1 cup green beans", "Lemon wedge"],
        instructions: "1. Sear tuna steak 2-3 minutes each side. 2. Cook quinoa. 3. Steam green beans. 4. Plate tuna over quinoa with green beans. 5. Squeeze lemon over dish."
      }
    },
    vegetarian: {
      breakfast: {
        name: "Veggie Omelet with Toast",
        ingredients: ["3 eggs", "1/2 bell pepper diced", "1/4 onion diced", "5 mushrooms sliced", "30g cheese", "2 slices whole grain toast"],
        instructions: "1. Sauté vegetables in olive oil. 2. Beat eggs and pour over vegetables. 3. Add cheese and fold omelet. 4. Toast bread. 5. Serve omelet with toast."
      },
      lunch: {
        name: "Chickpea Buddha Bowl",
        ingredients: ["1 cup cooked chickpeas", "1/2 cup quinoa", "Roasted vegetables (bell pepper, zucchini, carrot)", "2 tbsp tahini dressing", "2 tbsp hummus"],
        instructions: "1. Cook quinoa. 2. Roast chickpeas and vegetables at 200°C for 20 min. 3. Arrange in bowl with quinoa as base. 4. Add chickpeas and vegetables. 5. Drizzle tahini and add hummus."
      },
      dinner: {
        name: "Tofu Veggie Stir-Fry",
        ingredients: ["200g firm tofu cubed", "Mixed vegetables (bell peppers, broccoli, carrots)", "1 cup brown rice", "2 tbsp soy sauce", "1 tsp ginger minced"],
        instructions: "1. Press tofu and cube. 2. Stir-fry tofu until golden. 3. Add vegetables and cook 5 minutes. 4. Add soy sauce and ginger. 5. Serve over brown rice."
      }
    },
    vegan: {
      breakfast: {
        name: "Vegan Smoothie Bowl",
        ingredients: ["1 banana", "1 cup mixed berries", "1 cup almond milk", "2 tbsp chia seeds", "1/4 cup granola", "1 tbsp peanut butter"],
        instructions: "1. Blend banana, berries, and almond milk until smooth. 2. Pour into bowl. 3. Top with chia seeds, granola, and peanut butter drizzle. 4. Enjoy immediately."
      },
      lunch: {
        name: "Lentil Quinoa Bowl",
        ingredients: ["1 cup cooked lentils", "1/2 cup quinoa", "Roasted vegetables (sweet potato, Brussels sprouts)", "2 tbsp tahini", "Lemon juice"],
        instructions: "1. Cook lentils and quinoa. 2. Roast vegetables at 200°C for 25 min. 3. Combine in bowl. 4. Mix tahini with lemon juice and water for dressing. 5. Drizzle over bowl."
      },
      dinner: {
        name: "Vegan Tofu Stir-Fry",
        ingredients: ["200g extra-firm tofu", "Mixed vegetables (bok choy, mushrooms, bell peppers)", "1 cup brown rice", "2 tbsp tamari sauce", "1 tbsp sesame oil"],
        instructions: "1. Press and cube tofu. 2. Stir-fry in sesame oil until crispy. 3. Add vegetables and cook. 4. Add tamari sauce. 5. Serve over brown rice."
      }
    }
  };

  const selectedTemplate = mealTemplates[dietType] || mealTemplates.balanced;

  // Calculate macros based on goal
  let proteinRatio = 0.3;
  let carbsRatio = 0.4;
  let fatRatio = 0.3;

  if (goal === 'weight-loss') {
    proteinRatio = 0.35;
    carbsRatio = 0.35;
    fatRatio = 0.3;
  } else if (goal === 'muscle-gain') {
    proteinRatio = 0.4;
    carbsRatio = 0.4;
    fatRatio = 0.2;
  }

  const calculateMacros = (calories) => ({
    protein: Math.round((calories * proteinRatio) / 4), // 4 cal per gram
    carbs: Math.round((calories * carbsRatio) / 4),
    fat: Math.round((calories * fatRatio) / 9) // 9 cal per gram
  });

  return {
    breakfast: {
      ...selectedTemplate.breakfast,
      calories: breakfastCal,
      ...calculateMacros(breakfastCal)
    },
    lunch: {
      ...selectedTemplate.lunch,
      calories: lunchCal,
      ...calculateMacros(lunchCal)
    },
    dinner: {
      ...selectedTemplate.dinner,
      calories: dinnerCal,
      ...calculateMacros(dinnerCal)
    }
  };
}

export default {
  generateMealPlan
};
