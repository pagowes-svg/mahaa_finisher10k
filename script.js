// ==========================================
// STATE MANAGEMENT
// ==========================================
let currentMode = 'meal'; // 'meal' atau 'drink'

// ==========================================
// TAB SWITCHING
// ==========================================
function switchTab(mode) {
  currentMode = mode;
  
  document.getElementById('tab-meal').classList.toggle('active', mode === 'meal');
  document.getElementById('tab-drink').classList.toggle('active', mode === 'drink');
  
  const searchInput = document.getElementById('search');
  if (mode === 'meal') {
    searchInput.placeholder = 'Cari resep makanan...';
    updateQuickSearch(['chicken', 'beef', 'pasta', 'curry']);
  } else {
    searchInput.placeholder = 'Cari resep minuman...';
    updateQuickSearch(['coffee', 'tea', 'mojito', 'smoothie']);
  }
  
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

window.onclick = function(event) {
  const modal = document.getElementById('modal');
  if (event.target == modal) {
    closeModal();
  }
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
  updateQuickSearch(['chicken', 'beef', 'pasta', 'curry']);
};
