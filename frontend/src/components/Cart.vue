<template>
  <aside class="cart-section">
    <h3 class="flex-center">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
      Your Tray
    </h3>
    <div v-if="cart.length === 0" class="empty-cart">
      <p>Your tray is empty. Add some food!</p>
    </div>
    <div v-else class="cart-content">
      <ul class="cart-items">
        <li v-for="c in cart" :key="c.item.item_id" class="cart-item">
          <div class="item-info">
            <span class="item-name">{{ c.item.name }}</span>
            <span class="item-price">Tk {{ c.item.price }}</span>
          </div>
          <div class="item-controls">
            <button @click="$emit('decrease-quantity', c.item.item_id)" class="control-btn">-</button>
            <span class="quantity">{{ c.quantity }}</span>
            <button @click="$emit('increase-quantity', c.item.item_id)" class="control-btn">+</button>
            <button @click="$emit('remove-from-cart', c.item.item_id)" class="remove-btn" title="Remove item">×</button>
          </div>
        </li>
      </ul>
      <div class="cart-summary">
        <div class="total">
          <span>Total</span>
          <span>Tk {{ cartTotal.toFixed(2) }}</span>
        </div>
        <div class="pickup-time">
          <label for="pickup-time">Pickup Time:</label>
          <input
            id="pickup-time"
            type="time"
            :value="pickupTime"
            @input="$emit('update:pickupTime', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <button @click="$emit('submit-order')" class="btn-submit" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-wrapper">
            <div class="spinner-small"></div>
            Placing Order...
          </span>
          <span v-else>Confirm Order</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { CartItem } from '../types';

defineProps({
  cart: {
    type: Array as PropType<CartItem[]>,
    required: true,
  },
  cartTotal: {
    type: Number,
    required: true,
  },
  pickupTime: {
    type: String,
    required: true,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
});

defineEmits([
  'submit-order',
  'remove-from-cart',
  'increase-quantity',
  'decrease-quantity',
  'update:pickupTime',
]);
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }

.cart-section { flex: 1; background: white; padding: 1.5rem; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); position: sticky; top: 100px; max-width: 400px; }
.cart-section h3 { margin-top: 0; margin-bottom: 1.5rem; text-align: center; color: #2d3436; }
.empty-cart { text-align: center; color: #a4b0be; padding: 2rem 0; }
.cart-items { list-style: none; padding: 0; margin: 0 0 1rem 0; max-height: 300px; overflow-y: auto; }
.cart-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0.25rem; border-bottom: 1px solid #f0f0f0; }
.item-info { display: flex; flex-direction: column; }
.item-name { font-weight: 600; }
.item-price { color: #636e72; font-size: 0.9rem; }
.item-controls { display: flex; align-items: center; gap: 0.5rem; }
.control-btn { background: #f0f0f0; border: none; width: 28px; height: 28px; border-radius: 50%; font-weight: bold; cursor: pointer; transition: background 0.2s; }
.control-btn:hover { background: #e0e0e0; }
.quantity { font-weight: 600; min-width: 20px; text-align: center; }
.remove-btn { background: transparent; border: none; color: #ff6b6b; font-size: 1.4rem; font-weight: bold; cursor: pointer; line-height: 1; padding: 0 4px; }
.cart-summary { border-top: 2px dashed #dfe6e9; padding-top: 1.5rem; }
.total { display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: bold; margin-bottom: 1rem; }
.pickup-time { margin-bottom: 1rem; }
.pickup-time label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
.pickup-time input { width: 100%; padding: 0.5rem; border: 1px solid #dfe6e9; border-radius: 8px; }
.btn-submit { width: 100%; padding: 0.75rem; background: #1dd1a1; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 1rem; cursor: pointer; transition: 0.2s; }
.btn-submit:hover:not(:disabled) { background: #10ac84; }
.btn-submit:disabled { background: #b2bec3; cursor: not-allowed; }
.spinner-wrapper { display: flex; align-items: center; justify-content: center; gap: 8px; }
.spinner-small { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.5); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
.flex-center { display: flex; align-items: center; justify-content: center; gap: 8px; }
.icon { width: 20px; height: 20px; }
</style>