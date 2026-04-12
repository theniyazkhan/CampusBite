<template>
  <transition name="notification-fade" appear>
    <div v-if="show" class="notification-overlay" @click="close">
      <div class="notification-container" @click.stop>
        <div class="notification-content" :class="type">
          <div class="notification-icon">
            <svg v-if="type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <svg v-else-if="type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="notification-message">
            <h3>{{ title }}</h3>
            <p>{{ message }}</p>
          </div>
          <button class="notification-close" @click="close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import '../styles/Notification.css';
import { watch } from 'vue';

interface Props {
  show: boolean;
  type?: 'success' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 4000,
});

const emit = defineEmits<{
  'update:show': [value: boolean];
}>();

const close = () => {
  emit('update:show', false);
};

watch(
  () => props.show,
  (newShow) => {
    if (newShow && props.duration > 0) {
      setTimeout(() => {
        close();
      }, props.duration);
    }
  }
);
</script>