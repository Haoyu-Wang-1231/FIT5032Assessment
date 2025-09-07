<template>
    <!-- sm,md,lg,xxl -->

    <div class="container-fluid d-flex justify-content-between gne-header flex-column flex-sm-row">
        <div class="col-xxl-3 col-lg-3 col-md-5 col-sm-5 col-12">
            General Nutrition Educator
        </div>

        <div class="col-xxl-3 col-lg-3 col-md-3 col-sm-4 col-12 d-flex justify-content-around flex-column flex-sm-row">
            <!-- <routerLink to="/home">Home</routerLink>
            <routerLink to="/recipe">Recipe</routerLink>

            <routerLink to="/register">Register</routerLink>
            <routerLink to="/login">Login</routerLink> -->
            
            <RouterLink v-for="link in links" 
                :key="link.to" 
                :to="link.to" 
                :class="{ active: route.path === link.to }"
                @click = "() => handleActive(link)">
                
                {{ link.name }}
            </RouterLink>


        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink, routerViewLocationKey, useRoute } from 'vue-router';
import { navConfig } from "@/config/nav";

const route = useRoute();


const links = computed(() => {
    const key = route.meta.navkey || 'default';
    return navConfig[key] || [];
})

const handleActive = (link) => {
    // This function can be used to handle any additional logic when a link is clicked
    if (link.name ==='Log out') {
        console.log('Logging out user');
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('usertype');
    }
    
    console.log(`Navigating to ${link.name}`);
}

</script>

<style scoped>
.gne-header {
    background-color: #03fc90;
}
</style>