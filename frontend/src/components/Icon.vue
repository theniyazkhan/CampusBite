<template>
  <svg
    :viewBox="viewBox"
    :fill="fill"
    :stroke="stroke"
    :stroke-width="strokeWidth"
    :stroke-linecap="strokeLinecap as any"
    :stroke-linejoin="strokeLinejoin as any"
    :class="iconClass"
    :width="size"
    :height="size"
  >
    <slot></slot>
  </svg>
</template>

<script setup lang="ts">
import '../styles/Icon.css';

interface Props {
  name?: string;
  size?: string | number;
  viewBox?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string | number;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  iconClass?: string;
}

withDefaults(defineProps<Props>(), {
  size: '24',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '2',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  iconClass: ''
});
</script>