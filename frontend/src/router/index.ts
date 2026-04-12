import { createRouter, createWebHistory } from 'vue-router'
import StudentMenu from '../views/StudentMenu.vue'
import StudentProfile from '../views/StudentProfile.vue'
import CanteenDashboard from '../views/CanteenDashboard.vue'
import CompletedOrders from '../views/CompletedOrders.vue'
import OrderHistory from '../views/OrderHistory.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      name: 'student',
      component: StudentMenu,
      meta: { requiresAuth: true, role: 'student' } // Protected
    },
    {
      path: '/profile',
      name: 'profile',
      component: StudentProfile,
      meta: { requiresAuth: true, role: 'student' } // Protected
    },
    {
      path: '/admin',
      name: 'admin',
      component: CanteenDashboard,
      meta: { requiresAuth: true, role: 'admin' } // Protected
    },
    {
      path: '/admin/completed',
      name: 'completed-orders',
      component: CompletedOrders,
      meta: { requiresAuth: true, role: 'admin' }
    },
    {
      path: '/admin/order-history',
      name: 'order-history',
      component: OrderHistory,
      meta: { requiresAuth: true, role: 'admin' }
    }
  ]
})

// Navigation Guard: Checks before every page load
router.beforeEach((to, from, next) => {
  const userRole = localStorage.getItem('userRole');
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // If the page needs auth and user is NOT logged in, send to login
  if (requiresAuth && !userRole) {
    next('/login');
  } 
  // If user tries to access a page they don't have the role for
  else if (requiresAuth && to.meta.role !== userRole) {
    // Redirect them back to their proper dashboard
    next(userRole === 'admin' ? '/admin' : '/');
  } 
  // If user is already logged in and tries to visit the login page
  else if (to.path === '/login' && userRole) {
    next(userRole === 'admin' ? '/admin' : '/');
  } 
  // Otherwise, let them through
  else {
    next();
  }
})

export default router