<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title class="subheading grey--text text--darken-3">
            Tax categories
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-data-table
                    :headers="categories.headers" :items="categories.data"
                    class="mb-3" flat hide-default-footer
            >
                <template v-slot:item.actions="{ item }">
                    <v-btn slot="activator" class="mx-0 blue" :href="`/inventory/tax-categories/${item.id}/edit`" dark small>
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
    name: "tax-categories-index",

    data() {
        return {
            categories: null,
        };
    },

    watch: {
        getTaxCategories(categories) {
            this.categories = categories;
        },
    },

    computed: {
        ...mapGetters([
            "getTaxCategories",
        ]),

        initialised() {
            return this.categories;
        },
    },

    methods: {
        ...mapActions([
            "setTaxCategories",
        ]),
    },

    mounted() {
        this.setTaxCategories();
    },
};
</script>
