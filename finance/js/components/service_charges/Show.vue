<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else class="tallest">
        <v-card-title class="subheading grey--text text--darken-3">
            Schemes registered under charge
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-data-table
                    :headers="schemes.charge_headers"
                    :items="schemes.data"
                    class="mb-3"
                    flat
                    hide-default-footer
            >
                <template v-slot:item.actions="{ item }">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-btn icon v-on="on" class="mx-0" :href="`/users/access/${item.id}`">
                                <v-icon color="blue">edit</v-icon>
                            </v-btn>
                        </template>
                        <span>Edit service charge</span>
                    </v-tooltip>
                </template>

                <template v-slot:item.scheme_name="{ item }">
                    {{ item.name }}
                </template>

                <template v-slot:item.amount="{ item }">
                    {{ item.service_charges[0].pivot.amount }}
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    props: [
        'chargeId',
    ],

    data() {
        return {
            schemes: {},
        };
    },

    watch: {
        getSchemes(value) {
            if (value) {
                this.schemes = value;
            }
        },
    },

    computed: {
        ...mapGetters([
            'getSchemes',
        ]),

        initialised() {
            return this.schemes.hasOwnProperty('data');
        },
    },

    methods: {
        ...mapActions([
            'setSchemes',
        ]),
    },

    mounted() {
        this.setSchemes({
            params: {
                charge_id: this.chargeId,
            },
        });
    },
};
</script>

<style scoped>

</style>
