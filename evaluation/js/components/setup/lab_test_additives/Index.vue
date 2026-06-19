<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title class="text-bold grey--text text--darken-1">
            List of all lab test additives
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-data-table
                    :headers="additives.headers" :items="additives.data"
                    class="mb-3" flat
            >
                <template v-slot:item.actions="{ item }">
                    <v-btn class="mx-0 cyan" slot="activator" dark small
                           :href="`/evaluation/setup/lab-test-additives/${item.id}/edit`">
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
    name: 'test-additive-index',

    data() {
        return {
            additives: null,
        };
    },

    watch: {
        getLabTestAdditives(additives) {
            this.additives = additives;
        },
    },

    computed: {
        ...mapGetters([
            'getLabTestAdditives',
        ]),

        initialised() {
            return this.additives;
        },
    },

    methods: {
        ...mapActions([
            'setLabTestAdditives',
        ]),
    },

    mounted() {
        this.setLabTestAdditives();
    },
};
</script>
