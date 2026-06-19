<template>
    <v-card>
        <v-card-title class="subheading grey--text text--darken-3">
            Create a new ward
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <ward-form :isWard="null"></ward-form>
        </v-card-text>
    </v-card>
</template>

<script>

import WardForm from "./partials/WardForm.vue";
export default {
    components: {
        "ward-form": WardForm,
    },
};


</script>

<style scoped>

</style>
