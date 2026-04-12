<template>
  <div class="order-ticket" :class="order.status">
    <div class="ticket-header">
      <span class="order-id">#ORD-{{ order.order_id }}</span>
      <span class="pickup-time flex-center">
        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        {{ order.pickup_time }}
      </span>
    </div>

    <div class="student-info">
      <p><strong>Student:</strong> {{ order.name }}</p>
      <p><strong>Contact:</strong> {{ order.phone }}</p>
    </div>

    <ul class="item-list">
      <li v-for="(item, idx) in order.items" :key="idx">{{ item.quantity || 1 }}x {{ item.name }}</li>
    </ul>

    <div class="ticket-actions">
      <button
        v-if="order.status === 'pending'"
        @click="$emit('mark-ready', order.order_id)"
        class="btn-ready flex-center">
        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Mark Ready
      </button>
      <button
        v-if="order.status === 'ready'"
        @click="$emit('mark-completed', order.order_id)"
        class="btn-ready flex-center">
        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Mark Completed
      </button>
      <button
        v-if="order.status !== 'completed' && order.status !== 'cancelled'"
        @click="$emit('cancel-order', order.order_id)"
        class="btn-cancel flex-center">
        Cancel
      </button>
      <span v-if="order.status === 'completed'" class="status-label completed">✓ Completed</span>
      <span v-if="order.status === 'cancelled'" class="status-label cancelled">✕ Cancelled</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import '../styles/OrderTicket.css';

interface OrderItem {
  name: string;
  quantity?: number;
}

interface Order {
  order_id: number;
  name: string;
  phone: string;
  pickup_time: string;
  status: string;
  items: OrderItem[];
}

defineProps<{
  order: Order;
}>();

defineEmits<{
  'mark-ready': [orderId: number];
  'mark-completed': [orderId: number];
  'cancel-order': [orderId: number];
}>();
</script>.order-ticket.ready { border-top-color: #1dd1a1; }
.order-ticket:hover { transform: translateY(-3px); box-shadow: 0 8px 15px rgba(0,0,0,0.1); }
.ticket-header { display: flex; justify-content: space-between; border-bottom: 1px dashed #dfe6e9; padding-bottom: 10px; margin-bottom: 10px; }
.order-id { font-weight: 800; color: #2d3436; }
.pickup-time { font-weight: bold; color: #ff6b6b; }

.student-info { background: #f8f9fa; padding: 0.8rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; }
.student-info p { margin: 0.3rem 0; color: #636e72; }
.student-info strong { color: #2d3436; }

.item-list { list-style: none; padding: 0; margin: 0 0 1.5rem 0; color: #636e72; line-height: 1.6; }

.ticket-actions { display: flex; gap: 0.5rem; }
.btn-ready { flex: 1; display: flex; justify-content: center; align-items: center; gap: 6px; background: #1dd1a1; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; }
.btn-ready:hover { background: #10ac84; }
.status-label { padding: 10px 16px; border-radius: 8px; font-weight: bold; text-align: center; }
.status-label.ready { background: #c3fae8; color: #0b5345; }
.status-label.completed { background: #d4f5ea; color: #0a7c55; }
.status-label.cancelled { background: #ffdcd0; color: #b91d21; }
.btn-cancel { background: #ff6b6b; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; }
.btn-cancel:hover { background: #ee5a52; }

