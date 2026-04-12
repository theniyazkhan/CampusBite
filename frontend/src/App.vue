<template>
  <div id="app-container">
    <nav v-if="isLoggedIn" class="top-nav">
      <RouterLink v-if="userRole === 'student'" to="/#hero" class="nav-brand" style="text-decoration: none; color: white;" @click="scrollToHero">
        <svg class="icon-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>
        <span class="logo-text">CampusBite</span>
      </RouterLink>
      <div v-else class="nav-brand">
        <svg class="icon-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>
        <span class="logo-text">CampusBite</span>
      </div>
      
      <div class="nav-links">
        <RouterLink v-if="userRole === 'student'" to="/#fresh-menu" class="nav-item" @click="scrollToFreshMenu">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          Menu
        </RouterLink>

        <RouterLink v-if="userRole === 'admin'" to="/admin" class="nav-item">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          Kitchen Dashboard
        </RouterLink>

        <button @click="handleLogout" class="btn-logout">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Logout
        </button>
      </div>
    </nav>

    <main>
      <RouterView />
    </main>

    <!-- Global Notifications -->
    <Notification
      v-for="notification in notifications"
      :key="notification.id"
      :show="true"
      :type="notification.type"
      :title="notification.title"
      :message="notification.message"
      :duration="notification.duration"
      @update:show="removeNotification(notification.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Notification from './components/Notification.vue';
import { useNotifications } from './composables/useNotifications';
import './styles/App.css';

const route = useRoute();
const router = useRouter();
const { notifications, remove: removeNotification } = useNotifications();

const isLoggedIn = ref(false);
const userRole = ref('');

// This watches the local storage and route changes to update the navbar instantly
watchEffect(() => {
  // We trigger this to re-run whenever the route changes
  const currentPath = route.path; 
  userRole.value = localStorage.getItem('userRole') || '';
  isLoggedIn.value = !!userRole.value;
});

const scrollToHero = () => {
  // Add a slight delay to ensure route navigation is complete before scrolling
  setTimeout(() => {
    const hero = document.getElementById('hero');
    if (hero) {
      hero.scrollIntoView({ behavior: 'smooth' });
    }
  }, 50);
};

const scrollToFreshMenu = () => {
  setTimeout(() => {
    const freshMenu = document.getElementById('fresh-menu');
    if (freshMenu) {
      freshMenu.scrollIntoView({ behavior: 'smooth' });
    }
  }, 50);
};

const handleLogout = () => {
  localStorage.removeItem('userRole');
  localStorage.removeItem('studentId');
  localStorage.removeItem('studentName');
  router.push('/login');
};
</script>