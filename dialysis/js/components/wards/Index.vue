<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title class="subheading grey--text text--darken-3">
            List of all dialysis wards
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-data-table
                    :headers="wards.headers"
                    :items="wards.data"
                    class="mb-3"
                    flat
                    hide-default-footer
            >
                <template slot="items" slot-scope="props">
                    <td>{{ props.item.name }}</td>
                    <td>{{ props.item.number }}</td>
                    <td>{{ props.item.ward_type.name }}</td>
                    <td>{{ props.item.facility.name }}</td>
                    <td>{{ props.item.service_charge.service_code }}</td>
                    <td>
                            <v-btn icon slot="activator" class="mx-0" :href="`/dialysis/wards/${props.item.id}/edit`">
                                <v-icon color="blue">edit</v-icon>
                            </v-btn>
                    </td>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
    data() {
        return {
            wards: null,
        };
    },

    watch: {
        getDialysisWards(wards) {
            this.wards = wards;
        },
    },

    computed: {
        ...mapGetters([
            "getDialysisWards",
        ]),

        initialised() {
            return this.wards;
        },
    },

    methods: {
        ...mapActions([
            "setDialysisWards",
        ]),
    },

    mounted() {
        this.setDialysisWards();
    },
};
</script>

<style scoped>

</style>
