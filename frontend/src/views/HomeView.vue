<template>
  <div class="menu-container">
    <h1>Today's Menu</h1>
    
    <div v-if="loading">Loading delicious food...</div>
    
    <div v-else class="menu-grid">
      <div v-for="item in menuItems" :key="item.item_id" class="menu-card">
        <h3>{{ item.name }}</h3>
        <p class="desc">{{ item.description }}</p>
        <p class="category">{{ item.category }}</p>
        
        <div class="card-footer">
          <span class="price">Tk {{ item.price }}</span>
          <button class="add-btn">Add to Cart</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import '../styles/HomeView.css';

// Define our reactive variables
const menuItems = ref([]);
const loading = ref(true);

// This function runs automatically when the page loads
onMounted(async () => {
  try {
    // Make a GET request to our Node backend
    const response = await axios.get('https://campusbite-vj5w.onrender.com/api/menu');
    // Store the data from the database into our variable
    menuItems.value = response.data;
  } catch (error) {
    console.error("Error fetching menu from backend:", error);
  } finally {
    loading.value = false;
  }
});
</script>