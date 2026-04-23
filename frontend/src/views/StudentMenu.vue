<template>
  <div class="student-module">
    <section id="hero" class="hero-section">
      <div class="hero-content hero-banners">
        <div class="banner-group">
          <h2 class="flex-start signature-title">
            <svg class="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
            Most Sold Foods
          </h2>
          <div v-if="!isLoadingMenu && mostSoldItems.length > 0" class="photo-grid">
            <a v-for="item in mostSoldItems" :key="'hero-' + item.item_id" :href="'#food-' + item.item_id" class="photo-card" @click="scrollToFood('food-' + item.item_id, $event)">
              <img :src="item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'" :alt="item.name" class="photo-img"/>
              <div class="photo-overlay">
                <span class="photo-name">{{ item.name }}</span>
              </div>
            </a>
          </div>
        </div>

        <div class="banner-group">
          <h2 class="flex-start signature-title">
            <svg class="icon-lg" style="color: #1dd1a1;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            New Arrivals
          </h2>
          <div v-if="!isLoadingMenu && newArrivalItems.length > 0" class="photo-grid">
            <a v-for="item in newArrivalItems" :key="'new-' + item.item_id" :href="'#food-' + item.item_id" class="photo-card" @click="scrollToFood('food-' + item.item_id, $event)">
              <img :src="item.image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80'" :alt="item.name" class="photo-img"/>
              <div class="photo-overlay">
                <span class="photo-name">{{ item.name }}</span>
                <span class="badge-new">New</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>

    <header id="fresh-menu" class="module-header">
      <div class="header-content">
        <h2 class="flex-center signature-title">
          <svg class="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>
          Today's Fresh Menu
        </h2>
        <div class="category-filters">
          <button 
            v-for="category in ['All', 'Snacks', 'Lunch', 'Beverages']" 
            :key="category"
            class="filter-btn"
            :class="{ active: selectedCategory === category }"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>
      </div>
      <router-link to="/profile" class="btn-profile">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        My Orders
      </router-link>
    </header>

    <div v-if="isLoadingMenu" class="loading-container">
      <div class="loader"></div>
      <p>Loading menu...</p>
    </div>

    <div v-else class="layout-grid">
      <main class="menu-section">
        <div v-if="filteredMenuItems.length === 0" class="empty-state">
          <p>No menu items available in this category.</p>
        </div>
        <div v-else class="card-grid">
          <div v-for="item in filteredMenuItems" :key="item.item_id" :id="'food-' + item.item_id" class="food-wrapper">
            <FoodCard :item="item" @add-to-cart="addToCart" />
          </div>
        </div>
      </main>

      <Cart
        :cart="cart"
        :cartTotal="cartTotal"
        v-model:pickupTime="pickupTime"
        :isSubmitting="isSubmittingOrder"
        @submit-order="submitOrder"
        @remove-from-cart="removeFromCart"
        @increase-quantity="increaseQuantity"
        @decrease-quantity="decreaseQuantity"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { menuApi, ordersApi } from '../lib/api';
import type { MenuItem, CartItem } from '../types/index';
import FoodCard from '../components/FoodCard.vue';
import Cart from '../components/Cart.vue';
import { useNotifications } from '../composables/useNotifications';

const router = useRouter();
const { alert } = useNotifications();

const mostSoldItems = ref<MenuItem[]>([]);
const menuItems = ref<MenuItem[]>([]);
const cart = ref<CartItem[]>([]);
const pickupTime = ref('');
const isLoadingMenu = ref(false);
const isSubmittingOrder = ref(false);
const selectedCategory = ref('All');

onMounted(async () => {
  await loadMenu();
  await loadMostSold();
  loadCartFromStorage();
});

const loadMenu = async () => {
  isLoadingMenu.value = true;
  try {
    const response = await menuApi.getMenu();
    menuItems.value = response.data;
  } catch (error) {
    console.error('Error fetching menu:', error);
    alert('Failed to load menu. Please refresh the page.', 'error');
  } finally {
    isLoadingMenu.value = false;
  }
};

const loadMostSold = async () => {
  try {
    const newArrivalIds = newArrivalItems.value.map(item => item.item_id);
    let fetchedItems: MenuItem[] = [];

    // Check if the API method exists and try to fetch from the backend
    if (typeof (menuApi as any).getMostSold === 'function') {
      const response = await (menuApi as any).getMostSold();
      if (response.data && response.data.length > 0) {
        // Filter out items that are already in the "New Arrivals" section
        fetchedItems = response.data.filter((item: MenuItem) => !newArrivalIds.includes(item.item_id));
      }
    }

    // Fill up to 3 items using fallback (cheapest items) if the API didn't return enough unique items
    const existingIds = fetchedItems.map(i => i.item_id);
    const fallbackItems = [...menuItems.value]
      .filter(i => !newArrivalIds.includes(i.item_id) && !existingIds.includes(i.item_id))
      .sort((a, b) => Number(a.price) - Number(b.price));

    mostSoldItems.value = [...fetchedItems, ...fallbackItems].slice(0, 3);
  } catch (error) {
    console.error('Error fetching most sold items:', error);
    // Fallback if there's a network/server error
    const newArrivalIds = newArrivalItems.value.map(item => item.item_id);
    mostSoldItems.value = [...menuItems.value]
      .filter(i => !newArrivalIds.includes(i.item_id))
      .sort((a, b) => Number(a.price) - Number(b.price))
      .slice(0, 3);
  }
};

const loadCartFromStorage = () => {
  const savedCart = localStorage.getItem('campusbite_cart');
  if (savedCart) {
    try {
      cart.value = JSON.parse(savedCart);
    } catch (e) {
      console.error('Error loading cart:', e);
    }
  }
};

const saveCartToStorage = () => {
  localStorage.setItem('campusbite_cart', JSON.stringify(cart.value));
};

const addToCart = (item: MenuItem) => {
  const existing = cart.value.find(c => c.item.item_id === item.item_id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.value.push({ item, quantity: 1 });
  }
  saveCartToStorage();
};

const removeFromCart = (itemId: number) => {
  cart.value = cart.value.filter(c => c.item.item_id !== itemId);
  saveCartToStorage();
};

const increaseQuantity = (itemId: number) => {
  const item = cart.value.find(c => c.item.item_id === itemId);
  if (item) {
    item.quantity++;
    saveCartToStorage();
  }
};

const decreaseQuantity = (itemId: number) => {
  const item = cart.value.find(c => c.item.item_id === itemId);
  if (item) {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      removeFromCart(itemId);
      return;
    }
    saveCartToStorage();
  }
};

const filteredMenuItems = computed(() => {
  if (selectedCategory.value === 'All') {
    return menuItems.value;
  }
  return menuItems.value.filter(item => item.category === selectedCategory.value);
});

const newArrivalItems = computed(() => {
  // Taking the last 3 items from the database as new arrivals
  return [...menuItems.value].reverse().slice(0, 3);
});

const scrollToFood = (id: string, event: Event) => {
  event.preventDefault();
  const el = document.getElementById(id);
  if (el) {
    // Adjust offset slightly to ensure the floating cart/navbar isn't hiding the item
    const y = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top: y, behavior: 'smooth' });
    el.classList.add('highlight-pulse');
    setTimeout(() => el.classList.remove('highlight-pulse'), 1500);
  }
};

const cartTotal = computed(() =>
  cart.value.reduce((sum, c) => sum + Number(c.item.price) * c.quantity, 0)
);

const submitOrder = async () => {
  if (cart.value.length === 0) {
    alert('Your tray is empty. Add items first.', 'error');
    return;
  }

  if (!pickupTime.value) {
    const future = new Date();
    future.setMinutes(future.getMinutes() + 15);
    pickupTime.value = future.toISOString().slice(11, 16);
  }

  const student_id = localStorage.getItem('studentId');
  if (!student_id) {
    alert('Please login first!', 'error');
    return;
  }

  isSubmittingOrder.value = true;
  try {
    await ordersApi.submitOrder({
      student_id,
      items: cart.value.map(c => ({ item_id: c.item.item_id, quantity: c.quantity })),
      pickup_time: pickupTime.value,
      total_price: cartTotal.value
    });

    alert(`Order Confirmed! Total: Tk ${cartTotal.value}`, 'success');
    cart.value = [];
    pickupTime.value = '';
    saveCartToStorage();

    // Instantly refresh the most sold foods after an order is placed!
    await loadMostSold();
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to submit order.', 'error');
  } finally {
    isSubmittingOrder.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeInScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes slideInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spin { to { transform: rotate(360deg); } }

.student-module { padding: 2rem; background-color: #f5f6fa; min-height: 100vh; animation: fadeUp 0.6s ease-out; color: #2d3436; }
.module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; gap: 2rem; animation: slideInUp 0.5s ease-out 0.2s both; scroll-margin-top: 80px; }
.header-content { flex: 1; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; padding-right: 1.5rem; }
.header-content h2 { margin: 0; }
.signature-title { font-family: 'Dancing Script', cursive; font-size: 2.4rem; color: #2d3436; }

.category-filters { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 4px; }
.filter-btn { padding: 6px 16px; border-radius: 20px; background: white; border: 1px solid #dfe6e9; color: #636e72; font-weight: 600; font-size: 0.9rem; transition: 0.2s; cursor: pointer; white-space: nowrap; }
.filter-btn:hover { border-color: #1dd1a1; color: #1dd1a1; }
.filter-btn.active { background: #1dd1a1; border-color: #1dd1a1; color: white; }

.btn-profile { display: flex; align-items: center; justify-content: center; gap: 8px; background: #1dd1a1; color: white; padding: 10px 16px; border-radius: 8px; font-weight: bold; text-decoration: none; transition: 0.2s; white-space: nowrap; }
.btn-profile:hover { background: #10ac84; transform: translateY(-2px); }

.layout-grid { display: flex; gap: 2rem; align-items: flex-start; animation: fadeInScale 0.8s ease-out 0.6s both; }

.loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 1rem; }
.loader { width: 50px; height: 50px; border: 4px solid #e0e0e0; border-top-color: #1dd1a1; border-radius: 50%; animation: spin 1s linear infinite; }

.flex-center { display: flex; align-items: center; justify-content: center; gap: 8px; }
.icon { width: 18px; height: 18px; }
.icon-lg { width: 28px; height: 28px; color: #ff6b6b; }

.hero-section { background: white; border-radius: 16px; padding: 1.5rem 2rem; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 2rem; scroll-margin-top: 80px; animation: fadeInScale 0.8s ease-out 0.4s both; }
.hero-banners { display: flex; gap: 2rem; } /* Default to row for desktop */
.banner-group { flex: 1; } /* Each banner group takes equal space */
.banner-group h2 { margin-bottom: 1.2rem; color: #2d3436; animation: slideInUp 0.5s ease-out 0.2s both; }
.flex-start { display: flex; align-items: center; justify-content: flex-start; gap: 8px; }

.photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.2rem; }
.photo-card { position: relative; border-radius: 12px; overflow: hidden; display: block; aspect-ratio: 16/10; box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: transform 0.2s, box-shadow 0.2s; text-decoration: none; }
.photo-card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
.photo-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s; }
.photo-card:hover .photo-img { transform: scale(1.05); }
.photo-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.85)); padding: 2rem 1rem 1rem; color: white; display: flex; justify-content: space-between; align-items: flex-end; }
.photo-name { font-weight: bold; font-size: 1.1rem; text-shadow: 0 2px 4px rgba(0,0,0,0.6); }
.badge-new { background: #1dd1a1; color: white; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
.badge-hot { background: #ff6b6b; color: white; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }

.food-wrapper { border-radius: 14px; transition: box-shadow 0.3s, transform 0.3s; }
.highlight-pulse { box-shadow: 0 0 0 4px rgba(29, 209, 161, 0.6); transform: scale(1.02); }

.menu-section { flex: 2.5; }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; }

.empty-state { text-align: center; color: #a4b0be; padding: 3rem 0; font-style: italic; animation: fadeUp 0.6s ease-out; }

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .student-module { padding: 1rem; }
  .module-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .header-content h2 { font-size: 1.3rem; }
  .btn-profile { width: 100%; }

  .hero-banners {
    flex-direction: column; /* Stack banners on mobile */
  }
  .layout-grid {
    flex-direction: column; /* Stack menu and cart on mobile */
  }
  .photo-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
}
</style>
