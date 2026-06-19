<template>
    <v-card>
        <v-card-title class="subheading grey--text text--darken-3">
            Create a new ward type
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <ward-type-form :isWardType="null"></ward-type-form>
        </v-card-text>
    </v-card>
</template>

<script>
import WardTypeForm from "./partials/WardTypeForm.vue";
export default {
    components: {
        "ward-type-form": WardTypeForm,
    },
};
</script>

<style scoped>

</style>
