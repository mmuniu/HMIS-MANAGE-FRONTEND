<template>
    <v-card>
        <v-card-title class="subheading grey--text text--darken-3">
            Add tax category
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <tax-category-form :isTaxCategory="null"></tax-category-form>
        </v-card-text>
    </v-card>
</template>

<script>
import TaxCategoryForm from "./partials/TaxCategoryForm";

export default {
    name: "tax-categories-create",

    components: {
        "tax-category-form": TaxCategoryForm,
    },
};
</script>
