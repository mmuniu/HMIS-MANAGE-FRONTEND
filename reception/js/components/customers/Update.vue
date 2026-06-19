<template>
    <div v-if="customer">
        <customer-form :profile="customer" :editing-mode="true"></customer-form>
    </div>
</template>



<script>
import CustomerForm from './partials/CustomerForm.vue';
import Customer from '@reception/libs/patients/Patient';

export default {
    props: {
        patientId: {
            required: true,
        },
    },

    components: { 'customer-form': CustomerForm },


    data() {
        return {
            customerObj: new Customer(),
            saveLoader: false,
        };
    },

    computed: {
        customer() {
            return this.customerObj.patient;
        },

        submitted() {
            return this.customerObj.form.submitted;
        },

        contaminated() {
            return this.customerObj.form.errorDetected;
        },

        errors() {
            return this.customerObj.form.errors;
        },
    },

    watch: {
        submitted() {
            this.saveLoader = false;
        },
    },

    methods: {

    },

    mounted() {
        if (this.patientId) {
            this.customerObj.find(this.patientId);
        }
    },
};
</script>
