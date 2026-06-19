<template>
    <div>
        <finance-insurance-paid :company="insurance" :account="true"></finance-insurance-paid>
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
