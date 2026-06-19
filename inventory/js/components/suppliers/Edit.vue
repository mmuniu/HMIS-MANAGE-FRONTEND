<template>
    <v-card>
        <v-card-title class="subheading grey-text text-darken-2">
            <h2 class="body-2 ma-0 pa-0">Update supplier details</h2>
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <supplier-form :supplierId="supplierId"></supplier-form>
        </v-card-text>
    </v-card>
</template>

<script>
import SupplierForm from "./partials/SupplierForm";

export default {
    name: "suppliers-edit",

    props: [
        "supplierId",
    ],

    components: {
        "supplier-form": SupplierForm,
    },
};
</script>
