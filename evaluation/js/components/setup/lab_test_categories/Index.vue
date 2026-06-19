<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title class="text-bold grey--text text--darken-1">
            List of all lab test categories
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-data-table
                    :headers="categories.headers" :items="categories.data"
                    class="mb-3" flat
            >
                <template v-slot:item.actions="{ item }">
                    <v-btn slot="activator" class="mx-0 cyan" :href="`/evaluation/setup/lab-test-categories/${item.id}/edit`" dark small>
                        edit
                    </v-btn>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    name: 'test-category-index',

    data() {
        return {
            categories: null,
        };
    },

    watch: {
        getLabTestCategories(categories) {
            this.categories = categories;
        },
    },

    computed: {
        ...mapGetters([
            'getLabTestCategories',
        ]),

        initialised() {
            return this.categories;
        },
    },

    methods: {
        ...mapActions([
            'setLabTestCategories',
        ]),
    },

    mounted() {
        this.setLabTestCategories();
    },
};
</script>
