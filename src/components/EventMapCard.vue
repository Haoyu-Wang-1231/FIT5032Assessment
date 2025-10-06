<template>
  <div class="marker-card">
    <div class="mc-head">
      <div class="mc-badge" v-if="event.category">{{ event.category }}</div>
      <div class="mc-title" :title="event.title">{{ event.title }}</div>
      <div class="mc-sub" v-if="event.organizer">
        <!-- <div class="mc-body">Organizer: {{ event.organizer }}</div> -->
        <div class="mc-org">Organizer</div>
        <div class="mc-chip">{{ event.organizer }}</div>
        <!-- <span class="mc-chip">Organizer</span>
        <span class="mc-org" :title="event.organizer">{{ event.organizer }}</span> -->
        <!-- <span class="mc-chip">Organizer</span>
        <span class="mc-org" :title="event.organizer">{{ event.organizer }}</span> -->
      </div>
    </div>

    <div class="mc-body" v-if="event.description">
      {{ event.description }}
    </div>

    <div class="mc-meta" v-if="event.date">
      <div v-if="event.date" class="mc-meta-item">
        <div>Event time: {{ displayDate }}</div>
      </div>
    </div>

    <div class="mc-actions">
      <button class="mc-btn" type="button">Register</button>
      <button class="mc-link" type="button" @click="checkDetails">Details</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { toJsDate, formatYMDHMS } from '@/utils/datetime'
import { RouterLink, routerViewLocationKey, useRoute, useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  event: Object,
})

const checkDetails = () => {
  console.log(props.event.id)
  router.push({ name: 'EventDetails', params: { id: props.event.id } })
}

const displayDate = computed(() => {
  return formatYMDHMS(toJsDate(props.event.date))
})
</script>

<style scoped>
.marker-card {
  --mc-bg: #ffffff;
  --mc-text: #1f2937;
  --mc-sub: #6b7280;
  --mc-border: #e5e7eb;
  --mc-accent: #2563eb;
  --mc-accent-weak: #dbeafe;
  --mc-shadow: 0 6px 18px rgba(2, 6, 23, 0.12);

  width: 280px;
  max-width: 90vw;
  background: var(--mc-bg);
  color: var(--mc-text);
  border: 1px solid var(--mc-border);
  border-radius: 14px;
  box-shadow: var(--mc-shadow);
  overflow: hidden;
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial;
}

/* ------- Head ------- */
.mc-head {
  padding: 12px 14px 6px;
  background:
    radial-gradient(120px 80px at 0% 0%, var(--mc-accent-weak), transparent 60%),
    linear-gradient(180deg, #fff, #fff 60%);
}

.mc-badge {
  display: inline-block;
  font-size: 12px;
  line-height: 1;
  padding: 6px 8px;
  border-radius: 999px;
  background: var(--mc-accent-weak);
  color: var(--mc-accent);
  font-weight: 600;
  margin-bottom: 8px;
}

.mc-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.mc-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--mc-sub);
  font-size: 12px;
  margin-bottom: 6px;
}

.mc-chip {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #374151;
  padding: 4px 6px;
  border-radius: 6px;
  font-weight: 600;
}

.mc-org {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ------- Body ------- */
.mc-body {
  padding: 0 14px 8px;
  color: #374151;
  font-size: 13px;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  overflow: hidden;
}

/* ------- Meta ------- */
.mc-meta {
  padding: 0 14px 10px;
  display: grid;
  gap: 8px;
}

.mc-meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--mc-sub);
  font-size: 12px;
}

.mc-meta-item svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
  flex: none;
}

/* ------- Actions ------- */
.mc-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px 12px;
  border-top: 1px solid var(--mc-border);
}

.mc-btn {
  appearance: none;
  border: none;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--mc-accent);
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition:
    transform 0.05s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
  box-shadow: 0 6px 12px rgba(37, 99, 235, 0.25);
}
.mc-btn:hover {
  background: #1d4ed8;
}
.mc-btn:active {
  transform: translateY(1px);
}

.mc-link {
  background: transparent;
  border: none;
  color: var(--mc-accent);
  font-weight: 700;
  font-size: 13px;
  padding: 8px 8px;
  border-radius: 8px;
  cursor: pointer;
}
</style>
