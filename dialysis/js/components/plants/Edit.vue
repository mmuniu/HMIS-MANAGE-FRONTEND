<template>
    <v-card>
        <v-card-title class="subheading grey--text text--darken-3">
            Edit a plant's details
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <plant-form :isPlant="isPlant"></plant-form>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    props: [
        "isPlant",
    ],

    components: {
        "plant-form": require("./partials/PlantForm"),
    },
};
</script>

<style scoped>

</style>
