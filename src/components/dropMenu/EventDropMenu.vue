<template>
  <div
    class="hover-card"
    @mouseenter="openWithDelay(true)"
    @mouseleave="openWithDelay(false)"
  >
    <slot name="trigger">
      <!-- <img class="avatar" src="/avatar.png" alt="avatar" /> -->
    </slot>

    <Transition name="fade-pop">
      <div v-if="open" class="menu" role="menu" :aria-expanded="open">
        <ul class="list">
          <li @click="emit('goEventsList')">Event list</li>
          <li @click="emit('goEventsMap')">Event map</li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['goEventsList', 'goEventsMap'])

const open = ref(false)
let timer = null

function openWithDelay(show) {
  clearTimeout(timer)
  timer = setTimeout(() => (open.value = show), show ? 40 : 160)
}
</script>

<style scoped>
.hover-card { position: relative; display: inline-block; }
.avatar { width: 40px; height: 40px; border-radius: 50%; cursor: pointer; }

.menu {
  position: absolute;
  top: 60px; left: 50%;
  transform: translateX(-50%);
  width: 180px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,.15);
  padding: 10px;
  z-index: 1000;
}

.fade-pop-enter-active, .fade-pop-leave-active {
  transition: opacity .16s ease, transform .16s ease;
}
.fade-pop-enter-from, .fade-pop-leave-to {
  opacity: 0; transform: translateY(6px);
}

.list { margin: 6px 0 0; padding: 0; list-style: none; }
.list li { padding: 8px; border-radius: 6px; cursor: pointer; }
.list li:hover { background: #f6f7f8; }
.header { display:flex; align-items:center; justify-content:center; gap:6px; font-weight:600; }
.level { font-size: 12px; color:#ff4d4f; margin-left:4px; }
</style>