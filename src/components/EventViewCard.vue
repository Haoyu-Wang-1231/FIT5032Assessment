<template>
  <div class="flex align-items-center p-3 border-bottom-1 surface-border">
    <div class="flex-1">
      <div class="text-muted">title: {{ event.title }}</div>
      <div v-if="event.organizer">Organizer: {{ event.organizer }}</div>
      <div>Location: lat: {{ event.lat }} lng: {{ event.lng }}</div>
      <div v-if="event.organizer">Description: {{ event.description }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  event: {
    type: Object,
    required: true,
  },
})
</script>
