<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title class="subheading grey--text text--darken-3">
            Product categories
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-data-table
                    :headers="headers" :items="categories.data"
                    class="mb-3" flat
            >
                <template v-slot:item.actions="{ item }">
                    <v-btn slot="activator" class="mx-0 blue" :href="`/inventory/product-categories/${item.id}/edit`" dark small>
                        edit
                    </v-btn>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            categories: null,
            headers: [
                { text: "Name", value: "name" },
                { text: "Parent name", value: "parent_name" },
                { text: "Cash markup", value: "cash_markup" },
                { text: "Credit markup", value: "credit_markup" },
                { text: "Actions", value: "actions" },
            ],
        };
    },

    watch: {
        getProductCategories(categories) {
            this.categories = categories;
        },
    },

    computed: {
        ...mapGetters([
            "getProductCategories",
        ]),

        initialised() {
            return this.categories;
        },
    },

    methods: {
        ...mapActions([
            "setProductCategories",
        ]),
    },

    mounted() {
        this.setProductCategories();
    },
};
</script>
