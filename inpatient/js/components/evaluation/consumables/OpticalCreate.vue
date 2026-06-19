<template>
    <div>
        <consumable-form :paymentMode="paymentMode" :visitId="visitId"></consumable-form>
    </div>
</template>
<script>
import ConsumableForm from "./partials/OpticalConsumableForm";

export default {
    props: {
        paymentMode: {
            default: null,
        },
        visitId: {
            default: null,
        },
    },

    components: {
        ConsumableForm,
    },
};
</script>
