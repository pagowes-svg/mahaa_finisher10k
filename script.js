// ==========================================
// 🔑 EDAMAM API CREDENTIALS
// ==========================================
// Ganti dengan API key kamu dari https://developer.edamam.com/
const EDAMAM_APP_ID = '6f833d02';
const EDAMAM_APP_KEY = '39813e4a69e65bf7203dcd6ae78fc3be';

// ==========================================
// STATE MANAGEMENT
// ==========================================
let currentMode = 'meal'; // 'meal' atau 'drink'
const nutritionCache = {}; // Cache untuk hasil nutrisi

// ==========================================
// TAB SWITCHING
// ==========================================
function switchTab(mode) {
  currentMode = mode;
  
  // Update tab styling
  document.getElementById('tab-meal').classList.toggle('active', mode === 'meal');
  document.getElementById('tab-drink').classList.toggle('active', mode === 'drink');
  
  // Update placeholder & quick search
  const searchInput = document.getElementById('search');
  if (mode === 'meal') {
    searchInput.placeholder = 'Cari resep makanan...';
    updateQuickSearch(['chicken', 'beef', 'pasta', 'curry']);
  } else {
    searchInput.placeholder = 'Cari resep minuman...';
    updateQuickSearch(['coffee', 'tea', 'mojito', 'smoothie']);
  }
  
  // Clear results
  document.getElementById('result').innerHTML = '';
  document.getElementById('result-info').innerHTML = '';
}

function updateQuickSearch(items) {
  const quickSearch = document.querySelector('.quick-search');
  quickSearch.innerHTML = '<span class="quick-label">Populer:</span>';
  items.forEach(item => {
    quickSearch.innerHTML += `<button onclick="quickSearch('${item}')" class="quick-btn">${item.charAt(0).toUpperCase() + item.slice(1)}</button>`;
  });
}

// ==========================================
// SEARCH FUNCTIONS
// ==========================================
function quickSearch(query) {
  document.getElementById('search').value = query;
  searchContent();
}

async function searchContent() {
  const query = document.getElementById('search').value.trim();
  
  if (!query) {
    alert('Masukkan kata kunci pencarian!');
    return;
  }
  
  showLoading(true);
  document.getElementById('result').innerHTML = '';
  document.getElementById('result-info').innerHTML = '';
  
  try {
    if (currentMode === 'meal') {
      await searchMeals(query);
    } else {
      await searchDrinks(query);
    }
  } catch (error) {
    console.error('Error:', error);
    showNoResults('Terjadi kesalahan saat mencari resep.');
  } finally {
    showLoading(false);
  }
}

async function searchMeals(query) {
  const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
  const data = await response.json();
  
  if (data.meals) {
    displayResults(data.meals, 'meal');
    document.getElementById('result-info').innerHTML = `Ditemukan ${data.meals.length} resep makanan`;
  } else {
    showNoResults('Tidak ada resep makanan yang ditemukan.');
  }
}

async function searchDrinks(query) {
  const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${query}`);
  const data = await response.json();
  
  if (data.drinks) {
    displayResults(data.drinks, 'drink');
    document.getElementById('result-info').innerHTML = `Ditemukan ${data.drinks.length} resep minuman`;
  } else {
    showNoResults('Tidak ada resep minuman yang ditemukan.');
  }
}

// ==========================================
// DISPLAY FUNCTIONS
// ==========================================
function displayResults(items, type) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '';
  
  items.forEach((item, index) => {
    const card = createCard(item, type, index);
    resultDiv.appendChild(card);
  });
}

function createCard(item, type, index) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.animationDelay = `${index * 0.1}s`;
  
  const id = type === 'meal' ? item.idMeal : item.idDrink;
  const name = type === 'meal' ? item.strMeal : item.strDrink;
  const image = type === 'meal' ? item.strMealThumb : item.strDrinkThumb;
  const category = type === 'meal' ? item.strCategory : item.strCategory;
  const area = type === 'meal' ? item.strArea : item.strAlcoholic;
  
  card.innerHTML = `
    <div class="card-image">
      <img src="${image}" alt="${name}">
      <span class="card-badge">${category}</span>
    </div>
    <div class="card-content">
      <h3>${name}</h3>
      <div class="card-info">
        <div class="info-item">
          <span class="info-icon">🌍</span>
          <span>${area}</span>
        </div>
        <div class="info-item">
          <span class="info-icon">${type === 'meal' ? '🍽️' : '🥤'}</span>
          <span>${type === 'meal' ? 'Makanan' : 'Minuman'}</span>
        </div>
      </div>
      <div class="card-footer">
        <button onclick="showDetail('${id}', '${type}')" class="btn-detail">
          Lihat Resep →
        </button>
      </div>
    </div>
  `;
  
  return card;
}

function showNoResults(message) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = `
    <div class="no-results">
      <div class="no-results-icon">🔍</div>
      <h2>Tidak Ditemukan</h2>
      <p>${message}</p>
    </div>
  `;
}

function showLoading(show) {
  const loading = document.getElementById('loading');
  loading.classList.toggle('active', show);
}

// ==========================================
// MODAL FUNCTIONS
// ==========================================
async function showDetail(id, type) {
  showLoading(true);
  
  try {
    let item;
    if (type === 'meal') {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      const data = await response.json();
      item = data.meals[0];
    } else {
      const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`);
      const data = await response.json();
      item = data.drinks[0];
    }
    
    displayModal(item, type);
  } catch (error) {
    console.error('Error:', error);
    alert('Gagal memuat detail resep.');
  } finally {
    showLoading(false);
  }
}

function displayModal(item, type) {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  
  const name = type === 'meal' ? item.strMeal : item.strDrink;
  const image = type === 'meal' ? item.strMealThumb : item.strDrinkThumb;
  const category = type === 'meal' ? item.strCategory : item.strCategory;
  const area = type === 'meal' ? item.strArea : item.strAlcoholic;
  const instructions = type === 'meal' ? item.strInstructions : item.strInstructions;
  
  // Get ingredients
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = item[`strIngredient${i}`];
    const measure = item[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push(`${measure ? measure.trim() : ''} ${ingredient.trim()}`);
    }
  }
  
  modalBody.innerHTML = `
    <img src="${image}" alt="${name}" class="modal-header-image">
    <div class="modal-body-content">
      <h2 class="modal-title">${name}</h2>
      <div class="modal-meta">
        <span class="meta-tag">📁 ${category}</span>
        <span class="meta-tag">🌍 ${area}</span>
        <span class="meta-tag">${type === 'meal' ? '🍽️ Makanan' : '🥤 Minuman'}</span>
      </div>
      
      <!-- Nutrition Info Button -->
      <div style="margin: 20px 0; text-align: center;">
        <button onclick="showNutritionInfo(${JSON.stringify(ingredients).replace(/"/g, '&quot;')}, '${name}')" 
                class="btn-search" 
                style="display: inline-flex; align-items: center; gap: 10px;">
          📊 Lihat Info Nutrisi
        </button>
      </div>
      
      <!-- Nutrition Display Area -->
      <div id="nutrition-display" style="display: none; margin: 20px 0;"></div>
      
      <div class="modal-section">
        <h3 class="section-title">📝 Bahan-Bahan</h3>
        <div class="ingredients-list">
          ${ingredients.map(ing => `<div class="ingredient-item">${ing}</div>`).join('')}
        </div>
      </div>
      
      <div class="modal-section">
        <h3 class="section-title">👨‍🍳 Cara Membuat</h3>
        <p class="instructions">${instructions}</p>
      </div>
      
      ${item.strYoutube ? `
        <div class="modal-section">
          <h3 class="section-title">🎥 Video Tutorial</h3>
          <iframe 
            width="100%" 
            height="400" 
            src="https://www.youtube.com/embed/${item.strYoutube.split('v=')[1]}" 
            frameborder="0" 
            allowfullscreen
            style="border-radius: 10px;"
          ></iframe>
        </div>
      ` : ''}
    </div>
  `;
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('modal');
  if (event.target == modal) {
    closeModal();
  }
}

// ==========================================
// 📊 NUTRITIONAL INFO FUNCTIONS
// ==========================================
async function showNutritionInfo(ingredients, recipeName) {
  const nutritionDisplay = document.getElementById('nutrition-display');
  const cacheKey = recipeName;
  
  // Check cache first
  if (nutritionCache[cacheKey]) {
    displayNutritionData(nutritionCache[cacheKey]);
    return;
  }
  
  // Show loading
  nutritionDisplay.style.display = 'block';
  nutritionDisplay.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <div class="spinner" style="margin: 0 auto 15px;"></div>
      <p>Menghitung info nutrisi...</p>
    </div>
  `;
  
  try {
    // Prepare ingredients for Edamam API
    const ingr = ingredients.map(ing => ing.trim());
    
    const url = `https://api.edamam.com/api/nutrition-details?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`;
    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: recipeName,
        ingr: ingr
      })
    });
    
    if (!apiResponse.ok) {
      throw new Error('API request failed');
    }
    
    const data = await apiResponse.json();
    
    // Cache the result
    nutritionCache[cacheKey] = data;
    
    displayNutritionData(data);
    
  } catch (error) {
    console.error('Nutrition API Error:', error);
    nutritionDisplay.innerHTML = `
      <div style="background: #fff3cd; padding: 20px; border-radius: 10px; text-align: center;">
        <p style="color: #856404; margin: 0;">
          ⚠️ Tidak dapat memuat info nutrisi. 
          <br><small>Pastikan API key sudah diisi dengan benar.</small>
        </p>
      </div>
    `;
  }
}

function displayNutritionData(data) {
  const nutritionDisplay = document.getElementById('nutrition-display');
  
  const calories = Math.round(data.calories || 0);
  const protein = Math.round(data.totalNutrients?.PROCNT?.quantity || 0);
  const fat = Math.round(data.totalNutrients?.FAT?.quantity || 0);
  const carbs = Math.round(data.totalNutrients?.CHOCDF?.quantity || 0);
  const fiber = Math.round(data.totalNutrients?.FIBTG?.quantity || 0);
  
  nutritionDisplay.style.display = 'block';
  nutritionDisplay.innerHTML = `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                padding: 25px; 
                border-radius: 15px; 
                color: white;
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);">
      
      <h3 style="margin: 0 0 20px 0; text-align: center; font-size: 22px;">
        📊 Informasi Nutrisi
      </h3>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px;">
        
        <div style="background: rgba(255,255,255,0.2); 
                    padding: 15px; 
                    border-radius: 10px; 
                    text-align: center;
                    backdrop-filter: blur(10px);">
          <div style="font-size: 28px; font-weight: 700;">${calories}</div>
          <div style="font-size: 13px; opacity: 0.9;">🔥 Kalori</div>
        </div>
        
        <div style="background: rgba(255,255,255,0.2); 
                    padding: 15px; 
                    border-radius: 10px; 
                    text-align: center;
                    backdrop-filter: blur(10px);">
          <div style="font-size: 28px; font-weight: 700;">${protein}g</div>
          <div style="font-size: 13px; opacity: 0.9;">🥩 Protein</div>
        </div>
        
        <div style="background: rgba(255,255,255,0.2); 
                    padding: 15px; 
                    border-radius: 10px; 
                    text-align: center;
                    backdrop-filter: blur(10px);">
          <div style="font-size: 28px; font-weight: 700;">${fat}g</div>
          <div style="font-size: 13px; opacity: 0.9;">🧈 Lemak</div>
        </div>
        
        <div style="background: rgba(255,255,255,0.2); 
                    padding: 15px; 
                    border-radius: 10px; 
                    text-align: center;
                    backdrop-filter: blur(10px);">
          <div style="font-size: 28px; font-weight: 700;">${carbs}g</div>
          <div style="font-size: 13px; opacity: 0.9;">🍚 Karbo</div>
        </div>
        
        ${fiber > 0 ? `
        <div style="background: rgba(255,255,255,0.2); 
                    padding: 15px; 
                    border-radius: 10px; 
                    text-align: center;
                    backdrop-filter: blur(10px);">
          <div style="font-size: 28px; font-weight: 700;">${fiber}g</div>
          <div style="font-size: 13px; opacity: 0.9;">🌾 Serat</div>
        </div>
        ` : ''}
        
      </div>
      
      <p style="margin: 15px 0 0 0; 
                 text-align: center; 
                 font-size: 12px; 
                 opacity: 0.8;">
        Data nutrisi untuk keseluruhan resep
      </p>
    </div>
  `;
}

// ==========================================
// RATING SYSTEM
// ==========================================
function setRating(star) {
  const stars = document.querySelectorAll('.stars span');
  const ratingResult = document.getElementById('rating-result');
  
  stars.forEach((s, index) => {
    s.classList.toggle('active', index < star);
  });
  
  const messages = [
    'Terima kasih! Kami akan terus berkembang.',
    'Terima kasih! Kami akan lebih baik lagi.',
    'Terima kasih! Senang kamu menyukainya.',
    'Luar biasa! Terima kasih atas dukungannya.',
    'Sempurna! Kamu luar biasa! ⭐'
  ];
  
  ratingResult.textContent = messages[star - 1];
}

// ==========================================
// CONTACT FORM
// ==========================================
function sendMessage(event) {
  event.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;
  const statusEl = document.getElementById('form-status');
  
  // Simulate sending (ganti dengan real backend kalau ada)
  statusEl.textContent = 'Mengirim pesan...';
  statusEl.style.color = '#fff';
  
  setTimeout(() => {
    statusEl.textContent = `Terima kasih ${name}! Pesan Anda telah terkirim. 📧`;
    statusEl.style.color = '#4ade80';
    document.getElementById('contact-form').reset();
    
    setTimeout(() => {
      statusEl.textContent = '';
    }, 5000);
  }, 1500);
}

// ==========================================
// INITIALIZATION
// ==========================================
window.onload = function() {
  // Set default quick search
  updateQuickSearch(['chicken', 'beef', 'pasta', 'curry']);
  
  // Check if API keys are set
  if (EDAMAM_APP_ID === 'YOUR_APP_ID_HERE' || EDAMAM_APP_KEY === 'YOUR_APP_KEY_HERE') {
    console.warn('⚠️ Edamam API credentials belum diisi! Fitur nutritional info tidak akan bekerja.');
  }
};