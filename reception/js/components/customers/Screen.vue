<template>
    <div>
        <patient-form screen></patient-form>
    </div>
</template>
<script>
import CustomerForm from './partials/CustomerForm.vue';

export default {
    components: {
        PatientForm: CustomerForm,
    },
};
</script>
