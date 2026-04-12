<template>
  <div class="kitchen-dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-left">
        <h1>Kitchen Dashboard</h1>
        <p class="subtitle">Today: {{ todayDate }}</p>
      </div>
      <div class="header-right">
        <button class="btn btn-history" @click="goToHistory">
          History
        </button>
      </div>
    </header>

    <!-- Today's Stats -->
    <section class="stats-section">
      <div class="stat-card">
        <div class="stat-value">{{ todayStats.completed }}</div>
        <div class="stat-label">Completed Today</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ todayStats.pending }}</div>
        <div class="stat-label">Pending</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">Tk {{ todayStats.revenue.toLocaleString() }}</div>
        <div class="stat-label">Today's Revenue</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ todayStats.items }}</div>
        <div class="stat-label">Items Sold</div>
      </div>
    </section>

    <!-- Main Content Grid -->
    <div class="dashboard-grid">
      <!-- Active Orders Section -->
      <section class="orders-section">
        <h2 class="section-title">Active Orders</h2>

        <div v-if="activeOrders.length === 0" class="empty-section">
          <p>No active orders</p>
        </div>

        <div v-else class="orders-container">
          <div v-for="order in activeOrders" :key="order.order_id" class="order-ticket" :class="order.status">
            <div class="ticket-header">
              <span class="order-id">#{{ order.order_id }}</span>
              <span class="status-badge" :class="order.status">
                {{ order.status === 'pending' ? 'Preparing' : 'Ready' }}
              </span>
            </div>

            <div class="ticket-body">
              <div class="student-info">
                <strong>{{ order.name }}</strong>
                <div class="student-details">
                  <span class="student-id">ID: {{ order.student_id }}</span>
                  <span class="student-phone">📞 {{ order.phone || 'N/A' }}</span>
                </div>
              </div>

              <div class="pickup-time">
                <span class="label">Pickup:</span>
                <span class="time">{{ formatPickupTime(order.pickup_time) }}</span>
              </div>

              <div class="items-list">
                <div v-for="(item, idx) in order.items" :key="idx" class="item">
                  {{ item.name }} × {{ item.quantity }}
                </div>
              </div>

              <div class="ticket-footer">
                <span class="total">Tk {{ Number(order.total_price || 0).toFixed(2) }}</span>
                <div class="actions">
                  <button v-if="order.status === 'pending'"
                    @click="promptCancelOrder(order.order_id)"
                    class="btn-cancel">
                    Cancel
                  </button>
                  <button v-if="order.status === 'pending'"
                    @click="markReady(order.order_id)"
                    class="btn-ready">
                    Mark Ready
                  </button>
                  <button v-if="order.status === 'ready'"
                    @click="markCompleted(order.order_id)"
                    class="btn-complete">
                    Complete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Completed Today Section -->
      <section class="completed-section">
        <h2 class="section-title">Completed Today ({{ todayStats.completed }})</h2>

        <div v-if="completedTodayOrders.length === 0" class="empty-section">
          <p>No completed orders yet today</p>
        </div>

        <div v-else class="completed-list">
          <div v-for="order in completedTodayOrders" :key="order.order_id" class="completed-item">
            <div class="completed-header">
              <span class="order-id">#{{ order.order_id }}</span>
              <span class="completed-time">{{ formatTime(order.created_at) }}</span>
            </div>
            <div class="completed-info">
              <div><strong>{{ order.name }}</strong></div>
              <div class="items-count">{{ getItemCount(order.items) }} items</div>
              <div class="price">Tk {{ Number(order.total_price || 0).toFixed(2) }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Menu Management Section -->
    <section class="management-grid">
      <FoodForm v-model="newFood" :is-editing="isEditing !== null" @submit-new-food="submitNewFood" @reset="resetForm" />
      <div class="menu-list-card">
        <h3 class="section-title">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Current Menu
        </h3>
        <div class="menu-list">
          <div v-if="menuItems.length === 0" class="empty-section"><p>No menu items found.</p></div>
          <MenuItem v-else v-for="item in menuItems" :key="item.item_id" :item="item" @edit-food="editFood" @delete-food="deleteFood" />
        </div>
      </div>
    </section>

    <!-- Cancellation Confirmation Modal -->
    <div v-if="showCancelConfirm" class="notification-overlay" style="z-index: 2000;">
      <div class="notification-container">
        <div class="notification-content error">
          <div class="notification-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
          <div class="notification-message" style="flex: 1;">
            <h3>Confirm Cancellation</h3>
            <p style="margin-bottom: 1.2rem;">Are you sure you want to cancel order #{{ orderToCancel }}?</p>
            <div style="display: flex; gap: 10px;">
              <button @click="cancelAndCloseModal" class="btn-secondary" style="padding: 8px 14px; font-size: 0.9rem;">No, Keep It</button>
              <button @click="confirmCancelOrder" class="btn-danger" style="padding: 8px 14px; font-size: 0.9rem;">Yes, Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ordersApi, menuApi } from '../lib/api';
import FoodForm from '../components/FoodForm.vue';
import MenuItem from '../components/MenuItem.vue';
import { useNotifications } from '../composables/useNotifications';

const router = useRouter();
const { alert } = useNotifications();

const allOrders = ref<any[]>([]);
const menuItems = ref<any[]>([]);
const newFood = ref({ product_code: '', name: '', price: '', category: 'Lunch', description: '', image: undefined as File | undefined });
const isEditing = ref<number | null>(null);
const showCancelConfirm = ref(false);
const orderToCancel = ref<number | null>(null);
const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

onMounted(async () => {
  await loadOrders();
  await loadMenu();
});

const loadOrders = async () => {
  try {
    // Fetch both pending and completed orders from the database
    const [pendingRes, completedRes] = await Promise.all([
      ordersApi.getPendingOrders(),
      ordersApi.getCompletedOrders()
    ]);
    
    // Filter completed orders to only show today's revenue and stats
    const todayStr = new Date().toDateString();
    const todayCompleted = (completedRes.data || []).filter((o: any) => new Date(o.created_at).toDateString() === todayStr);
    
    allOrders.value = [...(pendingRes.data || []), ...todayCompleted];
  } catch (error) {
    console.error('Error loading orders:', error);
    alert('Failed to load orders from database.', 'error');
  }
};

const loadMenu = async () => {
  try {
    const response = await menuApi.getMenu();
    menuItems.value = response.data;
  } catch (error) {
    console.error('Error fetching menu:', error);
  }
};

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
  const items = Array.isArray(itemsList) ? itemsList : parseItems(itemsList);
  return items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
};

const formatTime = (datetime: string) => {
  return new Date(datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const formatPickupTime = (time: string) => {
  if (!time) return '';
  if (typeof time === 'string' && time.match(/^\d{2}:\d{2}:\d{2}/)) {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    return `${formattedH}:${minutes} ${ampm}`;
  }
  return time;
};

const activeOrders = computed(() => {
  return allOrders.value.filter(o => o.status === 'pending' || o.status === 'ready')
    .sort((a: any, b: any) => a.status === 'pending' ? -1 : 1);
});

const completedTodayOrders = computed(() => {
  return allOrders.value.filter(o => o.status === 'completed');
});

const todayStats = computed(() => {
  return {
    pending: allOrders.value.filter(o => o.status === 'pending').length,
    completed: completedTodayOrders.value.length,
    ready: allOrders.value.filter(o => o.status === 'ready').length,
    revenue: completedTodayOrders.value.reduce((sum: number, o: any) => sum + Number(o.total_price || 0), 0),
    items: completedTodayOrders.value.reduce((sum: number, o: any) => sum + getItemCount(o.items), 0)
  };
});

const markReady = async (orderId: number) => {
  try {
    await ordersApi.updateOrderStatus(orderId, 'ready');
    const order = allOrders.value.find(o => o.order_id === orderId);
    if (order) order.status = 'ready';
    alert(`Order #${orderId} marked as ready!`, 'success');
  } catch (error) {
    console.error('Error updating order:', error);
    alert('Failed to mark order as ready.', 'error');
  }
};

const markCompleted = async (orderId: number) => {
  try {
    await ordersApi.updateOrderStatus(orderId, 'completed');
    const order = allOrders.value.find(o => o.order_id === orderId);
    if (order) order.status = 'completed';
    alert(`Order #${orderId} completed successfully!`, 'success');
  } catch (error) {
    console.error('Error updating order:', error);
    alert('Failed to complete order.', 'error');
  }
};

const promptCancelOrder = (orderId: number) => {
  orderToCancel.value = orderId;
  showCancelConfirm.value = true;
};

const confirmCancelOrder = async () => {
  if (orderToCancel.value === null) return;
  try {
    await ordersApi.updateOrderStatus(orderToCancel.value, 'cancelled');
    const order = allOrders.value.find(o => o.order_id === orderToCancel.value);
    if (order) order.status = 'cancelled';
    alert(`Order #${orderToCancel.value} was successfully cancelled.`, 'info');
  } catch (error) {
    console.error('Error cancelling order:', error);
    alert('Failed to cancel order.', 'error');
  } finally {
    showCancelConfirm.value = false;
    orderToCancel.value = null;
  }
};

const cancelAndCloseModal = () => {
  showCancelConfirm.value = false;
  orderToCancel.value = null;
};

const submitNewFood = async () => {
  const formData = new FormData();
  formData.append('name', newFood.value.name);
  formData.append('price', newFood.value.price);
  formData.append('category', newFood.value.category);
  formData.append('description', newFood.value.description);
  formData.append('product_code', newFood.value.product_code);
  if (newFood.value.image) {
    formData.append('image', newFood.value.image);
  }

  try {
    if (isEditing.value !== null) {
      await menuApi.updateMenuItem(isEditing.value, formData);
    } else {
      await menuApi.addMenuItem(formData);
    }
    resetForm();
    await loadMenu();
  } catch (error) {
    console.error('Error submitting food item:', error);
  }
};

const deleteFood = async (itemId: number) => {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      await menuApi.deleteMenuItem(itemId);
      await loadMenu();
    } catch (error) {
      console.error('Error deleting food item:', error);
    }
  }
};

const editFood = (item: any) => {
  isEditing.value = item.item_id;
  newFood.value = { ...item, image: undefined };
};

const resetForm = () => {
  isEditing.value = null;
  newFood.value = { product_code: '', name: '', price: '', category: 'Lunch', description: '', image: undefined as any };
};

const goToHistory = () => {
  router.push('/admin/order-history');
};

const logout = () => {
  localStorage.removeItem('userRole');
  router.push('/login');
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.kitchen-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

/* Header */
.dashboard-header {
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
  font-size: 2rem;
  color: #2d3436;
}

.subtitle {
  margin: 0;
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

.btn-history {
  background: #1dd1a1;
  color: white;
}

.btn-history:hover {
  background: #10ac84;
}

.btn-logout {
  background: #ff6b6b;
  color: white;
}

.btn-logout:hover {
  background: #ee5a52;
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.management-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.orders-section, .completed-section, .menu-list-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: #2d3436;
  font-weight: 600;
  border-bottom: 2px solid #1dd1a1;
  padding-bottom: 0.8rem;
}

.empty-section {
  text-align: center;
  padding: 2rem;
  color: #a4b0be;
}

/* Order Tickets */
.orders-container {
  display: flex; flex-direction: column;
  gap: 1rem;
  max-height: 600px;
  overflow-y: auto;
}

.order-ticket {
  background: #f8f9fa;
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  padding: 1.2rem;
  transition: 0.2s;
}

.order-ticket.pending {
  border-left: 5px solid #f39c12;
  background: #fffbf0;
}

.order-ticket.ready {
  border-left: 5px solid #1dd1a1;
  background: #f0fdfb;
}

.order-ticket:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #dfe6e9;
}

.order-id {
  font-weight: bold;
  font-size: 1.1rem;
  color: #2d3436;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.ready {
  background: #d4edda;
  color: #155724;
}

.ticket-body {
  font-size: 0.95rem;
}

.student-info {
  background: white;
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 0.8rem;
}

.student-info strong {
  color: #2d3436;
  display: block;
}

.student-details {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  color: #636e72;
  font-size: 0.85rem;
}

.pickup-time {
  padding: 0.8rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 0.8rem;
}

.pickup-time .label {
  color: #636e72;
  display: block;
  font-size: 0.85rem;
}

.pickup-time .time {
  font-weight: bold;
  color: #e74c3c;
  display: block;
  font-size: 1.1rem;
}

.items-list {
  background: white;
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 0.8rem;
}

.item {
  padding: 0.4rem 0;
  border-bottom: 1px solid #f1f2f6;
  color: #2d3436;
}

.item:last-child {
  border-bottom: none;
}

.ticket-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.8rem;
  border-top: 1px solid #dfe6e9;
}

.total {
  font-weight: bold;
  font-size: 1.2rem;
  color: #1dd1a1;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-cancel {
  background: #e74c3c;
  color: white;
}

.btn-ready, .btn-complete {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}

.btn-ready {
  background: #f39c12;
  color: white;
}

.btn-ready:hover {
  background: #e67e22;
}

.btn-complete {
  background: #1dd1a1;
  color: white;
}

.btn-complete:hover {
  background: #10ac84;
}

/* Completed Section */
.completed-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  max-height: 600px;
  overflow-y: auto;
}

.completed-item {
  background: #f0fdfb;
  border: 1px solid #d4edda;
  border-left: 4px solid #1dd1a1;
  padding: 1rem;
  border-radius: 8px;
}

.completed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.order-id {
  font-weight: bold;
  color: #2d3436;
}

.completed-time {
  color: #636e72;
  font-size: 0.85rem;
}

.completed-info {
  font-size: 0.9rem;
  color: #2d3436;
}

.completed-info strong {
  display: block;
  margin-bottom: 0.3rem;
}

.items-count {
  color: #636e72;
  font-size: 0.85rem;
}

.price {
  font-weight: bold;
  color: #1dd1a1;
  margin-top: 0.3rem;
}

.menu-list {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-right {
    justify-content: center;
    width: 100%;
  }
}
</style>
