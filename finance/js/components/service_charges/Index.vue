<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else class="tallest">
        <v-card-title class="subheading grey--text text--darken-3">
            List of all service charges
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-data-table
                    :headers="charges.headers"
                    :items="charges.data"
                    class="mb-3"
                    flat
                    hide-default-footer
            >
                <template v-slot:item.actions="{ item }">
                    <v-btn :href="`/finance/service-charges/${item.id}`" class="pink" dark small>
                        Configure
                    </v-btn>
                    <v-btn :href="`/finance/service-charges/${item.id}/edit`" class="blue" dark small>
                        edit
                    </v-btn>
                    <!--<v-tooltip bottom v-if="can('finance.service-charges.update')">-->

                    <!--<span>Edit charge</span>-->
                    <!--</v-tooltip>-->
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    data() {
        return {
            charges: null,
        };
    },

    watch: {
        getServiceCharges(wards) {
            this.charges = wards;
        },
    },

    computed: {
        ...mapGetters([
            'getServiceCharges',
        ]),

        initialised() {
            return this.charges;
        },
    },

    methods: {
        ...mapActions([
            'setServiceCharges',
        ]),
    },

    mounted() {
        this.setServiceCharges();
    },
};
</script>

<style scoped>

</style>
