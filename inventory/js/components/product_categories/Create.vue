<template>
    <v-card>
        <v-card-title class="subheading grey--text text--darken-3">
            Add product category
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <product-category-form :isProductCategory="null"></product-category-form>
        </v-card-text>
    </v-card>
</template>

<script>
import ProductCategoryForm from "./partials/ProductCategoryForm";

export default {
    components: {
        "product-category-form": ProductCategoryForm,
    },
};
</script>
