<template>
    <div class="col-md-12 gne-header">
        <div>
            General Nutrition Educator
        </div>

        <div class="col-md-4 navigator">
            <routerLink to="/">Home</routerLink>

            <RouterLink to="/register">Register</RouterLink>

            <RouterLink to="/login">Login</RouterLink>

        </div>
    </div>

</template>

<script>
import { RouterLink, routerViewLocationKey } from 'vue-router';
</script>

<style scoped>
.gne-header {
    background-color: #03fc90;
    padding-left: 2rem;
    padding-right: 2rem;

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