<template>
  <div class="stat-card">
    <div class="stat-icon">
      <slot name="icon">
        <Icon viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </Icon>
      </slot>
    </div>
    <div class="stat-info">
      <span class="stat-number">{{ number }}</span>
      <span class="stat-label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import '../styles/StatsCard.css';
import Icon from './Icon.vue';

interface Props {
  number: string | number;
  label: string;
}

defineProps<Props>();
</script>