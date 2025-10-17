<template>
  <div class="hover-card" @mouseenter="openWithDelay(true)" @mouseleave="openWithDelay(false)"  @keydown="handleKey">
    <slot name="trigger">
      <!-- <img class="avatar" src="/avatar.png" alt="avatar" /> -->
    </slot>

    <Transition name="fade-pop">
      <div v-if="open" class="menu" role="menu" :aria-expanded="open">
        <ul class="list">
          <li
            v-for="(item, i) in eventLabels"
            :key="item.label"
            ref="menuItems"
            role="menuitem"
            tabindex="0"
            @keydown.enter.prevent="item.action()"
            @keydown.space.prevent="item.action()"
            @click="item.action()"
          >
            {{ item.label }}
          </li>


          <!-- <li @click="emit('goEventsList')">Event list</li>
          <li @click="emit('goEventsMap')">Event map</li>
          <li v-if="userStore.role === 'admin'" @click="emit('goEventsManager')">Event Manager</li> -->
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'
import { useUserStore } from '@/store/user'

const emit = defineEmits(['goEventsList', 'goEventsMap', 'goEventsManager'])

const open = ref(false)
const menuItems = ref([])



let timer = null
const userStore = useUserStore()

const eventLabels = computed(()=>[
  { label: 'Event list', show: true, action: () => emit('goEventsList') },
  { label: 'Event map', show: true, action: () => emit('goEventsMap') },
  { label: 'Event Manager', show: userStore.isAdmin, action: () => emit('goEventsManager') },
].filter(item => item.show))

function openWithDelay(show) {
  clearTimeout(timer)
  timer = setTimeout(
    async () => {
      open.value = show
      if (show) {
        // wait for DOM update
        await nextTick()
        menuItems.value[0]?.focus()
      }
    },
    show ? 40 : 160,
  )
}

function handleKey(e) {
  if (e.key === 'Escape') {
    openWithDelay(false)
  }
}

defineExpose({
  openWithDelay,
})

</script>

<style scoped>
.hover-card {
  position: relative;
  display: inline-block;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
}

.menu {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 10px;
  z-index: 1000;
}
.fade-pop-enter-active,
.fade-pop-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}
.fade-pop-enter-from,
.fade-pop-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.list li {
  display: flex; /* ensures vertical centering */
  align-items: center; /* centers text vertically */
  justify-content: flex-start; /* text starts at left edge */
  min-height: 40px; /* consistent clickable area */
  padding: 0 14px; /* horizontal padding */
  border-radius: 6px;
  cursor: pointer;
  line-height: 1; /* remove extra line spacing */
  font-size: 15px;
}
.list li:hover {
  background: #f6f7f8;
}
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 600;
}
.level {
  font-size: 12px;
  color: #ff4d4f;
  margin-left: 4px;
}
</style>
