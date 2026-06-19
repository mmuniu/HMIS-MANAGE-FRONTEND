<template>
    <v-card flat>
        <collabmed-loading v-if="!initialised"></collabmed-loading>

        <div v-else>
            <div v-if="posData.is_pharmacy">
                <pharmacy-pos v-if="can('inventory.make-pos-sales')" :station="posData"></pharmacy-pos>
            </div>


            <div v-else>
                <point-of-sale v-if="can('inventory.make-pos-sales')" :station="posData"></point-of-sale>
            </div>

            <sales-listing v-if="can('inventory.receive-pos-payments')" :station="posData"></sales-listing>
        </div>
    </v-card>
</template>
<script>
import PharmacyPos from './partials/PharmacyPos';
import PointOfSale from './partials/PointOfSale';
import SalesListing from './partials/SalesListing';

export default {
    props: ['station'],

    components: {
        PharmacyPos, PointOfSale, SalesListing,
    },

    computed: {
        initialised() {
            return !!this.station;
        },

        posData() {
            return JSON.parse(this.station);
        },
    },
};
</script>
