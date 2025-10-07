let currentTab = 'meal'; // Default tab

function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tab-meal').classList.remove('active');
  document.getElementById('tab-drink').classList.remove('active');
  document.getElementById(`tab-${tab}`).classList.add('active');

  document.getElementById('result').innerHTML = '';
  document.getElementById('result-info').innerHTML = '';
  document.getElementById('search').placeholder = 
    tab === 'meal' ? 'Cari resep makanan...' : 'Cari resep minuman...';
}

// Loading spinner
function showLoading() {
  document.getElementById('loading').classList.add('active');
  document.getElementById('result').innerHTML = '';
  document.getElementById('result-info').innerHTML = '';
}
function hideLoading() {
  document.getElementById('loading').classList.remove('active');
}

// Search
function searchContent() {
  const query = document.getElementById('search').value;
  if (!query.trim()) return alert('Masukkan kata kunci!');
  currentTab === 'meal' ? getMeals(query) : getDrinks(query);
}
function quickSearch(keyword) {
  document.getElementById('search').value = keyword;
  searchContent();
}

// Fetch meals
async function getMeals(query) {
  showLoading();
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
    const data = await res.json();
    hideLoading();
    displayMeals(data.meals, query);
  } catch {
    hideLoading();
    alert('Gagal memuat resep makanan.');
  }
}

// Fetch drinks
async function getDrinks(query) {
  showLoading();
  try {
    const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${query}`);
    const data = await res.json();
    hideLoading();
    displayDrinks(data.drinks, query);
  } catch {
    hideLoading();
    alert('Gagal memuat resep minuman.');
  }
}

// Display meals
function displayMeals(meals, query) {
  const container = document.getElementById('result');
  const info = document.getElementById('result-info');
  container.innerHTML = '';

  if (!meals) {
    info.innerHTML = '';
    container.innerHTML = `<div class="no-results"><div class="no-results-icon">😞</div><h2>Tidak ada makanan ditemukan untuk "${query}"</h2></div>`;
    return;
  }

  info.innerHTML = `Ditemukan ${meals.length} resep makanan untuk "${query}"`;
  meals.forEach(meal => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-image">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <div class="card-badge">${meal.strCategory}</div>
      </div>
      <div class="card-content">
        <h3>${meal.strMeal}</h3>
        <div class="card-info">
          <span>🌍 ${meal.strArea}</span>
        </div>
        <div class="card-footer">
          <button class="btn-detail" onclick="showMealDetail('${meal.idMeal}')">Lihat Resep →</button>
        </div>
      </div>`;
    container.appendChild(card);
  });
}

// Display drinks
function displayDrinks(drinks, query) {
  const container = document.getElementById('result');
  const info = document.getElementById('result-info');
  container.innerHTML = '';

  if (!drinks) {
    info.innerHTML = '';
    container.innerHTML = `<div class="no-results"><div class="no-results-icon">😞</div><h2>Tidak ada minuman ditemukan untuk "${query}"</h2></div>`;
    return;
  }

  info.innerHTML = `Ditemukan ${drinks.length} resep minuman untuk "${query}"`;
  drinks.forEach(drink => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-image">
        <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
        <div class="card-badge">${drink.strCategory}</div>
      </div>
      <div class="card-content">
        <h3>${drink.strDrink}</h3>
        <div class="card-info">
          <span>🍸 ${drink.strAlcoholic}</span>
        </div>
        <div class="card-footer">
          <button class="btn-detail" onclick="showDrinkDetail('${drink.idDrink}')">Lihat Detail →</button>
        </div>
      </div>`;
    container.appendChild(card);
  });
}

// Detail meals
async function showMealDetail(id) {
  showLoading();
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
  const data = await res.json();
  hideLoading();
  displayDetail(data.meals[0]);
}

// Detail drinks
async function showDrinkDetail(id) {
  showLoading();
  const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`);
  const data = await res.json();
  hideLoading();
  displayDetail(data.drinks[0]);
}

// Universal detail modal
function displayDetail(item) {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  modal.classList.add('active');

  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const ing = item[`strIngredient${i}`];
    const measure = item[`strMeasure${i}`];
    if (ing && ing.trim()) ingredients.push(`${measure || ''} ${ing}`);
  }

  modalBody.innerHTML = `
    <img src="${item.strMealThumb || item.strDrinkThumb}" class="modal-header-image">
    <div class="modal-body-content">
      <h2 class="modal-title">${item.strMeal || item.strDrink}</h2>
      <div class="modal-section">
        <h3>Bahan-bahan</h3>
        ${ingredients.map(i => `<div class="ingredient-item">${i}</div>`).join('')}
      </div>
      <div class="modal-section">
        <h3>Cara Membuat</h3>
        <p>${item.strInstructions}</p>
      </div>
    </div>`;
}

// Close modal
function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

window.onclick = e => {
  const modal = document.getElementById('modal');
  if (e.target === modal) closeModal();
};

// Load default
window.addEventListener('DOMContentLoaded', () => getMeals('chicken'));

// ========================
// Rating Feature
// ========================
function setRating(value) {
  const stars = document.querySelectorAll('.stars span');
  stars.forEach((star, index) => {
    star.classList.toggle('active', index < value);
  });
  document.getElementById('rating-result').textContent = `Terima kasih! Kamu memberi ${value} bintang ⭐`;
}

// ========================
// Contact Form Feature
// ========================
function sendMessage(event) {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  // Simulasi kirim pesan (karena tidak ada backend)
  document.getElementById('form-status').textContent = `Terima kasih, ${name}! Pesanmu telah terkirim.`;
  document.getElementById('contact-form').reset();
}