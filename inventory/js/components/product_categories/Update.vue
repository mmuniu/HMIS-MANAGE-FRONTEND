<template>
    <v-card>
        <v-card-title class="subheading grey--text text--darken-3">
            Update product category
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <product-category-form :isProductCategory="isProductCategory"></product-category-form>
        </v-card-text>
    </v-card>
</template>

<script>
import ProductCategoryForm from "./partials/ProductCategoryForm";

export default {
    props: [
        "isProductCategory",
    ],

    components: {
        "product-category-form": ProductCategoryForm,
    },
};
</script>
