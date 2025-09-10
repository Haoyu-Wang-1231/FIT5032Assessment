        <!-- <button class="btn btn-primary" label="Show" @click="visible = true" >Rating</button> -->



<template>
    <div class="card flex justify-center">
        <button class="btn btn-primary" label="Show" @click="visible = true">Rating</button>
        <Dialog v-model:visible="visible" modal header="Edit Profile" :style="{ width: '25rem' }">
            <span class="text-surface-500 dark:text-surface-400 block mb-8">Sharing your comment</span>
            <div class="flex items-center gap-4 mt-2 mb-4">
                <label for="username" class="font-semibold w-24">Rating</label>
                <input id="username" class="flex-auto" autocomplete="off" />
                <Dropdown v-model="selectedNumber" :options="numbers" placeholder="Select a number" class="w-40" />
            </div>
            <div class="flex items-center gap-4 mb-3">
                <label for="email" class="font-semibold w-24">Email</label>
                <input id="email" class="flex-auto" autocomplete="off" />
            </div>
            <div class="mt-2 flex justify-end gap-2">
                <button class="btn btn-secondary me-2" type="button" label="Cancel" severity="secondary"
                    @click="visible = false">Cancel</button>
                <button class="btn btn-primary" type="button" label="Save" @click="visible = false">Save</button>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { ref } from "vue";
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown'

const visible = ref(false);
</script>
