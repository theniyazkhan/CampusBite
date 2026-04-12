<template>
  <div class="completed-module">
    <div class="module-header">
      <div class="header-content">
        <h2 class="flex-center">
          <Icon class="icon-lg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
          </Icon>
          Order History
        </h2>
        <div class="date-picker-group">
          <label for="date-picker">Select Date:</label>
          <input
            id="date-picker"
            type="date"
            v-model="selectedDate"
            :max="today"
            class="date-picker"
          />
        </div>
      </div>
      <button class="btn-back" @click="goBack">
        <Icon class="icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path>
        </Icon>
        Back to Dashboard
      </button>
    </div>

    <div v-if="filteredOrders.length > 0" class="stats-bar">
      <StatsCard :number="filteredOrders.length" label="Total Completed">
        <template #icon>
          <Icon viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </Icon>
        </template>
      </StatsCard>

      <StatsCard :number="`Tk ${totalRevenue.toLocaleString()}`" label="Total Revenue">
        <template #icon>
          <Icon viewBox="0 0 20 20" fill="currentColor">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>
          </Icon>
        </template>
      </StatsCard>

      <StatsCard :number="`Tk ${averageOrderValue.toFixed(0)}`" label="Avg Order Value">
        <template #icon>
          <Icon viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
          </Icon>
        </template>
      </StatsCard>
    </div>

    <div v-if="filteredOrders.length === 0" class="empty-state">
      <div class="empty-icon">
        <Icon viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </Icon>
      </div>
      <h3>No Completed Orders</h3>
      <p>No completed orders found for the selected date.</p>
    </div>

    <div v-else class="orders-grid">
      <OrderCard
        v-for="(order, index) in filteredOrders"
        :key="order.order_id"
        :order="order"
        :index="index"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Icon from '../components/Icon.vue';
import StatsCard from '../components/StatsCard.vue';
import OrderCard from '../components/OrderCard.vue';
import '../styles/CompletedOrders.css';

const router = useRouter();
const allCompletedOrders = ref<any[]>([]);
const today = new Date().toISOString().split("T")[0];
const selectedDate = ref(today);

const fetchCompleted = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/orders/completed');
    allCompletedOrders.value = response.data;
  } catch (error) {
    console.error('Error loading completed orders:', error);
  }
};

onMounted(() => {
  fetchCompleted();
});

const goBack = () => router.push('/admin');

// Computed properties for stats
const filteredOrders = computed(() => {
  if (!selectedDate.value) return [];
  const startOfDay = new Date(selectedDate.value + 'T00:00:00');
  const endOfDay = new Date(selectedDate.value + 'T23:59:59');

  return allCompletedOrders.value.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= startOfDay && orderDate <= endOfDay;
  });
});

const totalRevenue = computed(() => {
  return filteredOrders.value.reduce((total, order) => total + (order.total_price || 0), 0);
});

const averageOrderValue = computed(() => {
  if (filteredOrders.value.length === 0) return 0;
  return totalRevenue.value / filteredOrders.value.length;
});
</script>