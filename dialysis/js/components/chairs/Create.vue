<template>
    <v-card>
        <v-card-title class="subheading grey--text text--darken-3">
            Add a new chair
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <chair-form :isChair="null"></chair-form>
        </v-card-text>
    </v-card>
</template>

<script>
import ChairsForm from "./partials/ChairForm";


export default {
    components: {
        "chair-form": ChairsForm,
    },
};
</script>

<style scoped>

</style>
