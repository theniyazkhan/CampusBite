<template>
  <div class="order-card" :style="{ animationDelay: `${index * 0.1}s` }">
    <div class="order-header">
      <div class="order-id-section">
        <div class="order-id">Order #{{ order._id.slice(-6).toUpperCase() }}</div>
        <div class="completion-badge">
          <Icon class="icon-sm" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </Icon>
          Completed
        </div>
      </div>
      <div class="order-time">
        <Icon class="icon-sm" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
        </Icon>
        {{ formatDate(displayTime) }}
      </div>
    </div>

    <div class="order-body">
      <div class="customer-info">
        <div class="info-item">
          <Icon class="icon-sm" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
          </Icon>
          <span>{{ order.customerName || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <Icon class="icon-sm" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
          </Icon>
          <span>{{ order.customerEmail || 'N/A' }}</span>
        </div>
      </div>

      <div class="order-items">
        <h4>Order Items</h4>
        <div class="items-list">
          <div
            v-for="item in items"
            :key="item._id"
            class="item-row"
          >
            <span class="item-name">{{ item.name }}</span>
            <span class="item-details">Qty: {{ item.quantity }} × Tk {{ item.price }}</span>
          </div>
        </div>
      </div>

      <div class="order-summary">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span class="summary-value">Tk {{ computedSubtotal }}</span>
        </div>
        <div v-if="order.deliveryFee" class="summary-row">
          <span>Delivery Fee:</span>
          <span class="summary-value">Tk {{ order.deliveryFee }}</span>
        </div>
        <div class="summary-row total">
          <span>Total:</span>
          <span class="summary-value">Tk {{ computedTotal }}</span>
        </div>
      </div>
    </div>

    <div class="order-footer">
      <div class="completion-date">
        Completed on {{ formatDate(displayTime) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '../styles/OrderCard.css';
import { computed } from 'vue';
import Icon from './Icon.vue';

interface OrderItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  customerName?: string;
  customerEmail?: string;
  items?: OrderItem[] | string;
  items_list?: string | OrderItem[];
  subtotal?: number;
  deliveryFee?: number;
  total?: number;
  completedAt?: string;
  updatedAt?: string;
  created_at?: string;
}

interface Props {
  order: Order;
  index: number;
}

const { order, index } = defineProps<Props>();

const parseItems = (orderData: Order) => {
  if (Array.isArray(orderData.items)) return orderData.items;

  const itemsCandidate = orderData.items_list || orderData.items || '[]';

  if (typeof itemsCandidate === 'string') {
    try {
      const parsed = JSON.parse(itemsCandidate);
      if (Array.isArray(parsed)) return parsed as OrderItem[];
    } catch {
      return [];
    }
  }

  return Array.isArray(itemsCandidate) ? itemsCandidate as OrderItem[] : [];
};

const items = computed<OrderItem[]>(() => parseItems(order));

const calculateSubtotal = (items: OrderItem[]) => {
  return items.reduce((total: number, item: OrderItem) => {
    return total + (item.quantity * item.price);
  }, 0);
};

const computedSubtotal = computed(() => {
  if (typeof order.subtotal === 'number') return order.subtotal;
  return calculateSubtotal(items.value);
});

const computedTotal = computed(() => {
  if (typeof order.total === 'number') return order.total;
  return computedSubtotal.value + (order.deliveryFee || 0);
});

const displayTime = computed(() => order.completedAt || order.updatedAt || order.created_at || 'N/A');

const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>
.order-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.order-id-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.order-id {
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.completion-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.order-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  opacity: 0.9;
}

.order-body {
  padding: 1.5rem;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f2f6;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #636e72;
}

.info-item svg {
  color: #667eea;
  flex-shrink: 0;
}

.order-items h4 {
  margin: 0 0 1rem 0;
  color: #2d3436;
  font-size: 1.1rem;
  font-weight: 600;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.item-row:hover {
  background: #e9ecef;
}

.item-name {
  font-weight: 600;
  color: #2d3436;
}

.item-details {
  color: #667eea;
  font-weight: 500;
}

.order-summary {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #636e72;
}

.summary-row.total {
  border-top: 2px solid #667eea;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3436;
}

.summary-value {
  font-weight: 600;
}

.summary-row.total .summary-value {
  color: #667eea;
}

.order-footer {
  background: #f8f9fa;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
}
