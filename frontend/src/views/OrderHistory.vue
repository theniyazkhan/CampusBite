<template>
  <div class="history-container">
    <!-- Header -->
    <header class="history-header">
      <div class="header-left">
        <h1>Order History</h1>
        <p class="subtitle">Sales data for selected date</p>
      </div>
      <div class="header-right">
        <button class="btn btn-back" @click="goBack">
          ← Back
        </button>
      </div>
    </header>

    <!-- Date Selection -->
    <section class="date-selector-section">
      <div class="date-picker-group">
        <label for="date-picker">Select Date:</label>
        <input
          id="date-picker"
          type="date"
          v-model="selectedDate"
          :max="today"
          @change="loadOrdersForDate"
          class="date-picker"
        />
      </div>
      <div class="date-info" v-if="selectedDateFormatted">
        {{ selectedDateFormatted }}
      </div>
    </section>

    <!-- Stats for Selected Date -->
    <section v-if="hasData" class="stats-section">
      <div class="stat-card">
        <div class="stat-value">{{ selectedDateStats.completed }}</div>
        <div class="stat-label">Completed Orders</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">Tk {{ selectedDateStats.revenue.toLocaleString() }}</div>
        <div class="stat-label">Total Revenue</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ selectedDateStats.items }}</div>
        <div class="stat-label">Items Sold</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">Tk {{ selectedDateStats.avgOrder.toLocaleString() }}</div>
        <div class="stat-label">Avg Order</div>
      </div>
    </section>

    <!-- Orders List -->
    <section class="orders-history-section">
      <h2 class="section-title">Orders ({{ historyOrders.length }})</h2>

      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading orders...</p>
      </div>

      <div v-else-if="historyOrders.length === 0" class="empty-section">
        <p>No orders found for this date</p>
      </div>

      <div v-else class="orders-list">
        <div v-for="order in historyOrders" :key="order.order_id" class="order-card">
          <div class="order-header">
            <span class="order-id">#{{ order.order_id }}</span>
            <span class="order-time">{{ formatTime(order.created_at) }}</span>
            <span class="status-badge">Completed</span>
          </div>

          <div class="order-body">
            <div class="student-info">
              <strong>{{ order.name }}</strong>
              <span class="student-id">{{ order.student_id }}</span>
            </div>

            <div class="pickup-time">
              <span class="label">Pickup:</span>
              <span class="time">{{ order.pickup_time }}</span>
            </div>

            <div class="items-section">
              <div class="items-list">
                <div v-for="(item, idx) in parseItems(order.items_list)" :key="idx" class="item">
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-qty">× {{ item.quantity }}</span>
                  <span class="item-price">Tk {{ (item.quantity * Number(item.price || 0)).toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <div class="order-total">
              Tk {{ Number(order.total_price || 0).toLocaleString() }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ordersApi } from '../lib/api';

const router = useRouter();

const allOrders = ref<any[]>([]);
const selectedDate = ref<string>(new Date().toISOString().split('T')[0] || '');
const isLoading = ref(false);

// Set default date to today
onMounted(() => {
  loadOrdersForDate();
});

const today = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const selectedDateFormatted = computed(() => {
  if (!selectedDate.value) return '';
  const date = new Date(selectedDate.value + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const parseItems = (itemsList: any) => {
  if (!itemsList) return [];
  if (typeof itemsList === 'string') {
    try {
      return JSON.parse(itemsList);
    } catch {
      return [];
    }
  }
  return Array.isArray(itemsList) ? itemsList : [];
};

const getItemCount = (itemsList: any) => {
  const items = parseItems(itemsList);
  return items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
};

const formatTime = (datetime: string) => {
  return new Date(datetime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const loadOrdersForDate = async () => {
  try {
    isLoading.value = true;
    const response = await ordersApi.getPendingOrders();
    allOrders.value = response.data || [];
  } catch (error) {
    console.error('Error loading orders:', error);
    allOrders.value = [];
  } finally {
    isLoading.value = false;
  }
};

const historyOrders = computed(() => {
  if (!selectedDate.value) return [];

  const selectedDateObj = new Date(selectedDate.value + 'T00:00:00');
  const nextDateObj = new Date(selectedDateObj);
  nextDateObj.setDate(nextDateObj.getDate() + 1);

  return allOrders.value.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= selectedDateObj && orderDate < nextDateObj && order.status === 'completed';
  }).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
});

const hasData = computed(() => historyOrders.value.length > 0);

const selectedDateStats = computed(() => {
  return {
    completed: historyOrders.value.length,
    revenue: historyOrders.value.reduce((sum: number, o: any) => sum + Number(o.total_price || 0), 0),
    items: historyOrders.value.reduce((sum: number, o: any) => sum + getItemCount(o.items_list), 0),
    avgOrder: historyOrders.value.length > 0
      ? Math.round(historyOrders.value.reduce((sum: number, o: any) => sum + Number(o.total_price || 0), 0) / historyOrders.value.length)
      : 0
  };
});

const goBack = () => {
  router.push('/admin');
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.history-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

/* Header */
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.header-left h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #2d3436;
}

.subtitle {
  margin: 0.5rem 0 0 0;
  color: #636e72;
  font-size: 0.9rem;
}

.header-right {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  font-size: 0.95rem;
}

.btn-back {
  background: #1dd1a1;
  color: white;
}

.btn-back:hover {
  background: #10ac84;
}

/* Date Selector */
.date-selector-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.date-picker-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.date-picker-group label {
  font-weight: 600;
  color: #2d3436;
  white-space: nowrap;
}

.date-picker {
  padding: 10px 15px;
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.2s;
}

.date-picker:focus {
  outline: none;
  border-color: #1dd1a1;
  box-shadow: 0 0 0 3px rgba(29, 209, 161, 0.1);
}

.date-info {
  color: #636e72;
  font-size: 0.95rem;
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  text-align: center;
  border-top: 3px solid #1dd1a1;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: bold;
  color: #1dd1a1;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #636e72;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Orders History Section */
.orders-history-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.section-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.2rem;
  color: #2d3436;
  font-weight: 600;
  border-bottom: 2px solid #1dd1a1;
  padding-bottom: 0.8rem;
}

.empty-section {
  text-align: center;
  padding: 3rem 2rem;
  color: #a4b0be;
}

.loading-container {
  text-align: center;
  padding: 3rem 2rem;
  color: #a4b0be;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-radius: 50%;
  border-top: 4px solid #1dd1a1;
  animation: spin 0.6s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Orders List */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 800px;
  overflow-y: auto;
}

.order-card {
  background: #f8f9fa;
  border: 1px solid #dfe6e9;
  border-left: 4px solid #1dd1a1;
  border-radius: 8px;
  padding: 1.2rem;
  transition: 0.2s;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dfe6e9;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.order-id {
  font-weight: 600;
  font-size: 1rem;
  color: #2d3436;
}

.order-time {
  color: #636e72;
  font-size: 0.85rem;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #d4edda;
  color: #155724;
}

.order-body {
  font-size: 0.95rem;
}

.student-info {
  background: white;
  padding: 0.8rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.student-info strong {
  color: #2d3436;
  display: block;
  font-weight: 600;
}

.student-id {
  color: #636e72;
  font-size: 0.85rem;
  display: block;
  margin-top: 0.3rem;
}

.pickup-time {
  padding: 0.8rem;
  background: white;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.pickup-time .label {
  color: #636e72;
  display: block;
  font-size: 0.85rem;
  margin-bottom: 0.2rem;
  font-weight: 500;
}

.pickup-time .time {
  font-weight: 600;
  color: #2d3436;
  display: block;
  font-size: 0.95rem;
}

.items-section {
  padding: 0.8rem;
  background: white;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f2f6;
  color: #2d3436;
  font-size: 0.9rem;
}

.item:last-child {
  border-bottom: none;
}

.item-name {
  flex: 1;
  font-weight: 500;
}

.item-qty {
  color: #636e72;
  margin: 0 0.8rem;
  min-width: 40px;
  text-align: center;
}

.item-price {
  font-weight: 600;
  color: #1dd1a1;
  min-width: 80px;
  text-align: right;
}

.order-total {
  display: flex;
  justify-content: flex-end;
  padding: 0.8rem;
  background: white;
  border-radius: 6px;
  font-weight: 600;
  color: #1dd1a1;
  font-size: 1rem;
  border-top: 1px solid #dfe6e9;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .history-container {
    padding: 1rem;
  }

  .history-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .date-selector-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .date-picker {
    width: 100%;
  }

  .item {
    flex-direction: column;
    gap: 0.3rem;
    padding: 0.5rem 0;
  }

  .item-qty,
  .item-price {
    text-align: left;
  }
}
</style>
