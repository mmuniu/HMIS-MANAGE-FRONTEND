<template>
    <v-card>
        <v-card-title class="subheading grey-text text-darken-2">
            <h2 class="body-2 ma-0 pa-0">Add a new store</h2>
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <store-form :storeId="null"></store-form>
        </v-card-text>
    </v-card>
</template>

<script>
import StoreForm from "./partials/StoreForm";

export default {
    name: "stores-create",

    components: {
        "store-form": StoreForm,
    },
};
</script>
