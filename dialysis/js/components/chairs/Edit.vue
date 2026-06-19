<template>
    <v-card>
        <v-card-title class="subheading grey--text text--darken-3">
            Edit a chair's details
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <chair-form :isChair="isChair"></chair-form>
        </v-card-text>
    </v-card>
</template>

<script>
import ChairsForm from "./partials/ChairForm";

export default {
    props: [
        "isChair",
    ],

    components: {
        "chair-form": ChairsForm,
    },
};
</script>
