<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title class="text-bold grey--text text--darken-1">
            List of all lab test units
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-data-table
                    :headers="units.headers" :items="units.data"
                    class="mb-3" flat
            >
                <template v-slot:item.actions="{ item }">
                    <v-btn slot="activator" class="mx-0 cyan" :href="`/evaluation/setup/lab-test-units/${item.id}/edit`" dark small>
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
    name: 'test-unit-index',

    data() {
        return {
            units: null,
        };
    },

    watch: {
        getLabTestUnits(units) {
            this.units = units;
        },
    },

    computed: {
        ...mapGetters([
            'getLabTestUnits',
        ]),

        initialised() {
            return this.units;
        },
    },

    methods: {
        ...mapActions([
            'setLabTestUnits',
        ]),
    },

    mounted() {
        this.setLabTestUnits();
    },
};
</script>
