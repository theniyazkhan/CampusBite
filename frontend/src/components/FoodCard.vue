<template>
  <div class="food-card">
    <div class="image-wrapper">
      <img :src="item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'" alt="Food" />
      <span class="category-badge">{{ item.category }}</span>
    </div>

    <div class="card-body">
      <h3>{{ item.name }}</h3>
      <p class="description">{{ item.description }}</p>
      <div class="card-footer">
        <span class="price">Tk {{ item.price }}</span>
        <button @click="$emit('add-to-cart', item)" class="btn-add">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '../styles/FoodCard.css';
import type { MenuItem } from '../types/index';

defineProps<{
  item: MenuItem;
}>();

defineEmits<{
  'add-to-cart': [item: MenuItem];
}>();
</script>