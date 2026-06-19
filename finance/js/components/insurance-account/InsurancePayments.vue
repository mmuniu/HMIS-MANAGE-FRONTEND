<template>
    <div>
        <finance-insurance-payments :company="insurance" :account="true"></finance-insurance-payments>
    </div>
</template>
<script>
export default {
    props: {
        insurance: {
            type: Object,
            required: true,
        },
    },
};
</script>
