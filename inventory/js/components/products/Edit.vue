<template>
    <v-card>
        <v-card-title class="subheading grey--text text--darken-3">
            Update a product in the inventory
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <product-form :isProduct="isProduct"></product-form>
        </v-card-text>
    </v-card>
</template>

<script>
import ProductForm from "./partials/ProductForm";

export default {
    name: "product-edit",

    props: [
        "isProduct",
    ],

    components: {
        "product-form": ProductForm,
    },
};
</script>
