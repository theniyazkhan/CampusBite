<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ordersApi } from '../lib/api';
import type { Order } from '../types/index';
import { useNotifications } from '../composables/useNotifications';
import axios from 'axios';

const router = useRouter();
const { alert } = useNotifications();

const studentId = ref(localStorage.getItem('studentId') || '');
const studentName = ref(localStorage.getItem('studentName') || '');
const studentPhone = ref(localStorage.getItem('studentPhone') || 'Not provided');
const orders = ref<any[]>([]);
const isLoading = ref(false);
const isEditingProfile = ref(false);
const isSaving = ref(false);
const editFormData = ref({ name: '', phone: '' });

onMounted(async () => {
  await loadOrders();
});

const loadOrders = async () => {
  isLoading.value = true;
  try {
    const response = await ordersApi.getStudentOrders(studentId.value);
    // Assuming the backend now returns a correctly structured 'items' array with each order
    orders.value = response.data;
  } catch (error) {
    console.error('Error loading orders:', error);
    alert('Failed to load orders.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const logout = () => {
  localStorage.removeItem('userRole');
  localStorage.removeItem('studentId');
  localStorage.removeItem('studentName');
  localStorage.removeItem('campusbite_cart');
  router.push('/login');
};

const editProfile = () => {
  editFormData.value.name = studentName.value;
  editFormData.value.phone = studentPhone.value === 'Not provided' ? '' : studentPhone.value;
  isEditingProfile.value = true;
};

const saveProfile = async () => {
  if (!editFormData.value.name || !editFormData.value.phone) {
    alert('Name and phone number are required.', 'error');
    return;
  }
  isSaving.value = true;
  try {
    await axios.put('https://campusbite-vj5w.onrender.com/api/auth/update', {
      student_id: studentId.value,
      name: editFormData.value.name,
      phone: editFormData.value.phone
    });
    studentName.value = editFormData.value.name;
    studentPhone.value = editFormData.value.phone;
    localStorage.setItem('studentName', studentName.value);
    localStorage.setItem('studentPhone', studentPhone.value);
    alert('Profile updated successfully!', 'success');
    isEditingProfile.value = false;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    const msg = error.response?.data?.message || 'Failed to update profile.';
    alert(String(msg), 'error');
  } finally {
    isSaving.value = false;
  }
};

const formatDate = (date: string) => new Date(date).toLocaleDateString();
const formatTime = (time: string) => {
  if (!time) return '';
  if (typeof time === 'string' && time.match(/^\d{2}:\d{2}:\d{2}/)) {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    return `${formattedH}:${minutes} ${ampm}`;
  }
  if (time.length === 5) return time; // Already in HH:MM format
  const d = new Date(time);
  if (!isNaN(d.getTime())) {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  return time;
};
</script>

<template>
  <div class="profile-container">

    <header class="profile-header">
      <h2 class="flex-center">
        <svg class="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        My Profile & Orders
      </h2>
    </header>

    <div class="profile-grid">
      <section class="info-card">
        <h3 class="section-title">Student Information</h3>
        <div class="info-group">
          <label>Name</label>
          <p>{{ studentName }}</p>
        </div>
        <div class="info-group">
          <label>Student ID</label>
          <p>{{ studentId }}</p>
        </div>
        <div class="info-group">
          <label>Phone Number</label>
          <p>{{ studentPhone }}</p>
        </div>
        <button @click="editProfile" class="btn-edit-profile">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          Edit Profile
        </button>
        <!-- <button @click="logout" class="btn-logout">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Logout
        </button> -->
      </section>

      <section class="orders-section">
        <h3 class="section-title">Your Orders</h3>

        <div v-if="isLoading" class="loading">
          <div class="spinner"></div>
          <p>Loading orders...</p>
        </div>

        <div v-else-if="orders.length === 0" class="empty-state">
          <p>No orders yet. <router-link to="/" class="link">Start ordering!</router-link></p>
        </div>

        <div v-else class="orders-list">
          <div v-for="order in orders" :key="order.order_id" class="order-card" :class="order.status">
            <div class="order-header">
              <span class="order-id">#ORD-{{ order.order_id }}</span>
              <span class="status-badge" :class="order.status">
                {{ order.status === 'pending' ? '⏳ Preparing...' : order.status === 'ready' ? '✓ Ready' : order.status === 'cancelled' ? '✗ Cancelled' : '✓ Completed' }}
              </span>
            </div>

            <div class="order-details">
              <p><strong>Pickup Time:</strong> {{ formatTime(order.pickup_time) }}</p>
              <p><strong>Order Date:</strong> {{ formatDate(order.created_at) }}</p>
              <p v-if="order.total_price"><strong>Total:</strong> Tk {{ Number(order.total_price).toFixed(2) }}</p>

              <div class="items-list">
                <strong>Items:</strong>
                <ul>
                  <li v-for="(item, idx) in order.items" :key="idx">
                    {{ item.name }} × {{ item.quantity }} = Tk {{ (Number(item.price) * item.quantity).toFixed(2) }}
                  </li>
                </ul>
              </div>

              <div v-if="order.status === 'ready'" class="ready-alert">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Your order is ready for pickup!</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="isEditingProfile" class="modal-overlay">
      <div class="modal-content">
        <h3 class="modal-title">Edit Profile</h3>
        <div class="input-group">
          <label>Full Name</label>
          <input type="text" v-model="editFormData.name" placeholder="Your Name" />
        </div>
        <div class="input-group">
          <label>Phone Number</label>
          <input type="tel" v-model="editFormData.phone" placeholder="10-11 digits" />
        </div>
        <div class="modal-actions">
          <button @click="isEditingProfile = false" class="btn-secondary">Cancel</button>
          <button @click="saveProfile" class="btn-primary" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spin { to { transform: rotate(360deg); } }

.profile-container { padding: 2rem; background-color: #f5f6fa; min-height: 100vh; animation: fadeUp 0.6s ease-out; }
.profile-header { margin-bottom: 2rem; }
.profile-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; }

.hero-section { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 2rem; }
.most-sold-content { padding: 1rem; }
.info-card, .orders-section { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.section-title { display: flex; align-items: center; gap: 8px; margin-bottom: 1rem; color: #2d3436; }
.info-group { margin-bottom: 1rem; }
.info-group label { display: block; font-weight: 600; color: #636e72; margin-bottom: 0.5rem; }
.info-group p { color: #2d3436; font-size: 1.1rem; }

.btn-logout { display: flex; align-items: center; gap: 8px; width: 100%; background: #ff6b6b; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; margin-top: 1rem; }
.btn-logout:hover { background: #ee5a52; }

.btn-edit-profile { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: #1dd1a1; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; margin-top: 1rem; }
.btn-edit-profile:hover { background: #10ac84; }

.loading { text-align: center; padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.spinner { width: 40px; height: 40px; border: 4px solid #e0e0e0; border-top-color: #1dd1a1; border-radius: 50%; animation: spin 1s linear infinite; }

.empty-state { text-align: center; color: #a4b0be; padding: 2rem; font-style: italic; }
.link { color: #1dd1a1; text-decoration: none; font-weight: bold; }

.orders-list { display: flex; flex-direction: column; gap: 1rem; }
.order-card { background: white; border: 2px solid #dfe6e9; border-radius: 12px; padding: 1.5rem; transition: 0.3s; }
.order-card.pending { border-left-color: #f39c12; }
.order-card.ready { border-left-color: #1dd1a1; }
.order-card.completed { border-left-color: #27ae60; }
.order-card.cancelled { border-left-color: #e74c3c; }

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
}
.order-id { font-weight: bold; color: #2d3436; font-size: 1.1rem; }

.order-card.completed .order-header,
.order-card.ready .order-header { background-color: #27ae60; color: white; }
.order-card.pending .order-header { background-color: #f39c12; color: white; }
.order-card.cancelled .order-header { background-color: #e74c3c; color: white; }

.order-header .order-id { color: inherit; }

.status-badge { padding: 6px 12px; border-radius: 20px; font-weight: bold; font-size: 0.9rem; }
.order-header .status-badge { background: rgba(255, 255, 255, 0.2); color: white; }

.order-details { color: #2d3436; }
.order-details p { margin: 0.5rem 0; }
.items-list { margin-top: 1rem; }
.items-list strong { display: block; margin-bottom: 0.5rem; }
.items-list ul { list-style: none; padding: 0; margin: 0.5rem 0; }
.items-list li { padding: 0.4rem 0; color: #636e72; }

.ready-alert { display: flex; align-items: center; gap: 8px; background: #d4edda; color: #155724; padding: 1rem; border-radius: 8px; margin-top: 1rem; }
.icon { width: 18px; height: 18px; }
.icon-lg { width: 28px; height: 28px; color: #ff6b6b; }
.flex-center { display: flex; align-items: center; justify-content: center; gap: 8px; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 400px;
}

.modal-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2d3436;
  text-align: center;
  border-bottom: 2px solid #f1f2f6;
  padding-bottom: 1rem;
}

.input-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
.input-group label { font-size: 0.9rem; font-weight: bold; color: #636e72; }
.input-group input { padding: 10px; border: 1px solid #dfe6e9; border-radius: 8px; font-family: inherit; transition: 0.2s; }
.input-group input:focus { outline: none; border-color: #1dd1a1; box-shadow: 0 0 0 3px rgba(29, 209, 161, 0.1); }

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-secondary { padding: 10px 20px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; background-color: #b2bec3; color: white; transition: 0.2s; }
.btn-secondary:hover { background-color: #636e72; }
.btn-primary { padding: 10px 20px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; background-color: #1dd1a1; color: white; transition: 0.2s; }
.btn-primary:hover:not(:disabled) { background-color: #10ac84; }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

@media (max-width: 768px) {
  .profile-grid { grid-template-columns: 1fr; }
}
</style>
