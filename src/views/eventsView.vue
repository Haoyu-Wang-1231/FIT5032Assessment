<script setup>

import { ref, onMounted } from 'vue';
import { onAuthStateChanged } from "firebase/auth";
import { httpsCallable } from 'firebase/functions';
import { useUserStore } from '@/store/user';
import { db, auth, functions } from '@/firebase'
import DataView from 'primevue/dataview';

const events = ref([])


function waitforAuth() {
    return new Promise(resolve => {
        const off = onAuthStateChanged(auth, u => { off(); resolve(u) })
    })
}

async function loadEvents() {
    try {
        const call = httpsCallable(functions, "getEvents");
        const result = await call();
        events.value = result.data;
        // totalRows.value = events.value.length;
        // console.log('Events loaded:', events.value);
    } catch (e) {
        console.log(e)
    }
}

onMounted(async () => {
    const user = await waitforAuth();
    if (user) {
        console.log('User is signed in: ', user.email);
        // await userStore.setUser(user.uid, user.email)        
        // await loadRecipes()
        await loadEvents();
    }

});
// onMounted(async () => {
//     const user = await waitForAuth();
//     if(user){
//         console.log('User is signed in: ', user.email);
//         // await userStore.setUser(user.uid, user.email)        
//         await loadRecipes()
//     }
// })


</script>

<template>
    <div class="container">
        <div>events</div>


        <DataView :value="events" paginator :rows="10" :rowsPerPageOptions="[5, 10, 15]">
            <template #list="slotProps">
                <div v-for="event in slotProps.items" :key="event.id"
                    class="flex align-items-center p-3 border-bottom-1 surface-border">
                    <div class="flex-1">
                        <div class="fw-bold">ID: {{ event.id }}</div>
                        <div class="text-muted">title: {{ event.title }}</div>
                    </div>
                </div>

            </template>

        </DataView>

    </div>

</template>
