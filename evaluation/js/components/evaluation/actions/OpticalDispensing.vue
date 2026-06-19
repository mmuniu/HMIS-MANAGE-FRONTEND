<template>
    <collabmed-loading v-if="!paymentMode"></collabmed-loading>
    <div v-else>
       <!-- order a consumable-->
        <order-consumable :paymentMode="paymentMode" :visitId="visitId"></order-consumable>

        <!-- list of ordered consumables-->
        <ordered-consumables :paymentMode="paymentMode" :visitId="visitId"></ordered-consumables>
    </div>
</template>
<script>
import OrderConsumable from '@inpatient/components/evaluation/consumables/Create';
import OrderedConsumables from '@inpatient/components/evaluation/consumables/Index';
import Visit from '@reception/libs/visits/Visit';

export default {
    components: {
        OrderConsumable, OrderedConsumables,
    },

    data: () => ({
        visitObj: new Visit(),
    }),

    computed: {
        visitId() {
            return this.$route.params.visitId;
        },

        paymentMode() {
            if (this.visitObj.selectedVisit) {
                return this.visitObj.selectedVisit.payment_mode;
            } else {
                return 'cash';
            }
        },
    },

    mounted() {
        this.visitObj.find(this.$route.params.visitId);
    },
};
</script>
