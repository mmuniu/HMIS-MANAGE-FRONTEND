<template>
    <v-card>
        <v-card-title class="subheading grey--text text--darken-3">
            <h2 class="body-2 ma-0 pa-0">Add a product to inventory</h2>
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <product-form :isProduct="null"></product-form>
        </v-card-text>
    </v-card>
</template>

<script>
import ProductForm from "./partials/ProductForm";

export default {
    name: "product-create",

    components: {
        "product-form": ProductForm,
    },
};
</script>
