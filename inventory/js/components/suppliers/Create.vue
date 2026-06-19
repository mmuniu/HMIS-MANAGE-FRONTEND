<template>
    <v-card>
        <v-card-title class="subheading grey-text text-darken-2">
            <h2 class="body-2 ma-0 pa-0">Add a new supplier</h2>
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <supplier-form :supplierId="null"></supplier-form>
        </v-card-text>
    </v-card>
</template>

<script>
import SupplierForm from "./partials/SupplierForm";

export default {
    name: "suppliers-create",

    components: {
        "supplier-form": SupplierForm,
    },
};
</script>
