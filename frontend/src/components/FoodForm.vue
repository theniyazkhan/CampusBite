<template>
  <div class="form-card">
    <h3 class="flex-center section-title">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
      {{ isEditing ? 'Edit Food Item' : 'Add New Food Item' }}
    </h3>
    <form @submit.prevent="$emit('submit-new-food')" class="admin-form">

      <div class="input-group">
        <label>Product Code</label>
        <input type="text" v-model="newFood.product_code" placeholder="e.g., SP-NDL-01" required />
      </div>

      <div class="input-group">
        <label>Food Name</label>
        <input type="text" v-model="newFood.name" placeholder="e.g., Spicy Noodles" required />
      </div>

      <div class="row-group">
        <div class="input-group">
          <label>Price (Tk)</label>
          <input type="number" v-model="newFood.price" placeholder="150" required />
        </div>
        <div class="input-group">
          <label>Category</label>
          <select v-model="newFood.category">
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Snacks</option>
            <option>Beverages</option>
          </select>
        </div>
      </div>

      <div class="input-group">
        <label>Description</label>
        <textarea v-model="newFood.description" placeholder="A brief tasty description..." rows="3"></textarea>
      </div>

      <div class="input-group">
        <label>Food Image</label>
        <input type="file" @change="handleImageChange" accept="image/*" />
      </div>

      <div class="form-actions">
        <button type="button" v-if="isEditing" @click="$emit('reset')" class="btn-cancel">Cancel Edit</button>
        <button type="submit" class="btn-submit flex-center">
          {{ isEditing ? 'Update Item' : 'Publish to Menu' }}
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import '../styles/FoodForm.css';

interface NewFood {
  product_code: string;
  name: string;
  price: string;
  category: string;
  description: string;
  image?: File;
}

const newFood = defineModel<NewFood>({ default: () => ({ product_code: '', name: '', price: '', category: 'Lunch', description: '' }) });

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    newFood.value.image = target.files[0];
  }
};

defineProps<{
  isEditing?: boolean;
}>();

defineEmits<{
  'submit-new-food': [];
  'reset': [];
}>();
</script>