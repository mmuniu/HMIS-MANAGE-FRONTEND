<template>
    <v-card>
        <v-card-title class="subheading grey--text text--darken-3">
            Edit a ward's details
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <ward-type-form :isWardType="isWardType"></ward-type-form>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    props: [
        "isWardType",
    ],

    components: {
        "ward-type-form": require("./partials/WardTypeForm"),
    },
};
</script>

<style scoped>

</style>
