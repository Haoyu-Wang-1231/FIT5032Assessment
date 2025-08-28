<template>
    <div class="col-md-12 gne-header">
        <div>
            General Nutrition Educator
        </div>

        <div class="col-md-4 navigator">
            <routerLink to="/home">Home</routerLink>
            <routerLink to="/register">Register</routerLink>
            <routerLink to="/login">Login</routerLink>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink, routerViewLocationKey } from 'vue-router';


</script>

<style scoped>
.gne-header {
    background-color: #03fc90;


    display: flex;
    justify-content: space-between;
}

.navigator {
    padding-left: 2rem;
    padding-right: 2rem;

    display: flex;
    justify-content: space-between;
}
</style>