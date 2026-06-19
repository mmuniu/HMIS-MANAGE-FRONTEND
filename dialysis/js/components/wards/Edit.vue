<template>
    <v-card>
        <v-card-title class="subheading grey--text text--darken-3">
            Edit a ward's details
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <ward-form :isWard="isWard"></ward-form>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    props: [
        "isWard",
    ],

    components: {
        "ward-form": require("./partials/WardForm"),
    },
};
</script>

<style scoped>

</style>
