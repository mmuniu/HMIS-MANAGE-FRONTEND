<template>
    <v-card>
        <v-card-title class="subheading grey--text text--darken-3">
            Add a new plant
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <plant-form :isPlant="null"></plant-form>
        </v-card-text>
    </v-card>
</template>

<script>

import PlantForm from "./partials/PlantForm.vue";

export default {
    components: {
        "plant-form": PlantForm,
    },
};
</script>

<style scoped>

</style>
