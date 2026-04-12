// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Imports the router we just set up
import { useNotifications } from './composables/useNotifications'

const app = createApp(App)

app.use(router) // Tells your app to use the routing system

// Provide notification system globally
app.provide('notifications', useNotifications())

app.mount('#app')