<template>
    <v-card class="mx-3 kinda-tall">
        <v-card-title class="subheading font-weight-bold grey--text">
            Prescribe drugs
        </v-card-title>

        <v-divider class="pa-0 ma-0"></v-divider>

        <prescribe-drugs is-of-type="dialysis" @reloadPrescriptionsTable="reset()"></prescribe-drugs>
    </v-card>
</template>

<script>
import Evaluator from "@dialysis/libs/evaluation/Evaluator";
import StoreProduct from "@inventory/libs/products/StoreProduct";

export default {
    props: [
        "content",
    ],

    data() {
        return {
            evaluator: new Evaluator(),
            product: new StoreProduct(),
        };
    },

    watch: {
        item(value) {
            if (value) {
                this.product.search.results = [];
                this.product.search.term = false;
            }
        },

        term(value) {
            if (value) {
                if (value.length > 2) {
                    this.product.index(this.evaluator.prescriptions.department_id);
                } else {
                    this.product.search.reset();
                }
            }
        },

        reset() {
            this.evaluator.fetch(this.$route.params.visitId, "prescriptions");
        },
    },

    computed: {
        term() {
            return this.product.search.term;
        },
    },
};
</script>
