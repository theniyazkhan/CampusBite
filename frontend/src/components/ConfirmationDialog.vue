<template>
  <transition name="modal-fade" appear>
    <div v-if="show" class="modal-overlay" @click="close">
      <div class="modal-container" @click.stop>
        <div class="modal-content">
          <div class="modal-icon">
            <svg v-if="type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <svg v-else-if="type === 'danger'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

          <div class="modal-body">
            <h3 class="modal-title">{{ title }}</h3>
            <p class="modal-message">{{ message }}</p>
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" @click="close">
              {{ cancelText }}
            </button>
            <button class="btn-confirm" :class="type" @click="confirm">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import '../styles/ConfirmationDialog.css';

interface Props {
  show: boolean;
  type?: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'warning',
  confirmText: 'Confirm',
  cancelText: 'Cancel'
});

const emit = defineEmits<{
  'update:show': [value: boolean];
  'confirm': [];
  'cancel': [];
}>();

const close = () => {
  emit('update:show', false);
  emit('cancel');
};

const confirm = () => {
  emit('update:show', false);
  emit('confirm');
};
</script>