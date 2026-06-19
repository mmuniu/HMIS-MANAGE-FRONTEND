<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title class="subheading grey--text text--darken-3">
            Measurement units
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-data-table
                    :headers="units.headers"
                    :items="units.data"
                    class="mb-3" flat
            >
                <template v-slot:item.actions="{ item }">
                    <v-btn class="mx-0 blue" :href="`/inventory/measurement-units/${item.id}/edit`" dark small>
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
            units: null,
            headers: [
                { text: "Name", value: "name" },
                { text: "Description", value: "description" },
                { text: "Actions", value: "actions" },
            ],
        };
    },

    watch: {
        getMeasurementUnits(units) {
            this.units = units;
        },
    },

    computed: {
        ...mapGetters([
            "getMeasurementUnits",
        ]),

        initialised() {
            return this.units;
        },
    },

    methods: {
        ...mapActions([
            "setMeasurementUnits",
        ]),
    },

    mounted() {
        this.setMeasurementUnits();
    },
};
</script>
