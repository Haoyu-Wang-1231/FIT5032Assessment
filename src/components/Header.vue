<template>
    <!-- sm,md,lg,xxl -->

    <div class="container-fluid d-flex justify-content-between gne-header flex-column flex-sm-row">
        <div class="col-xxl-3 col-lg-3 col-md-5 col-sm-5 col-12">
            General Nutrition Educator
        </div>

        <div class="col-xxl-3 col-lg-3 col-md-3 col-sm-4 col-12 d-flex justify-content-around flex-column flex-sm-row">
            <!-- <routerLink to="/home">Home</routerLink> -->
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
}

</style>