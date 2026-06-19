<template>
    <v-dialog v-model="modal" persistent width="360">
        <v-form @submit.prevent="submit()">
            <v-card>
                <v-card-title class="py-0">
                    <h2 class="subheading"> Adjust product stock</h2>
                    <v-spacer />
                    <v-btn icon flat color="red" @click="$emit('close')">
                        <v-icon flat>cancel</v-icon>
                    </v-btn>
                </v-card-title>
                <v-divider class="my-2"/>
                <v-card-text>
                    <v-col cols="12">
                        <v-text-field label="New Quantity" v-model="adjust.new_quantity" :error="errors.has('new_quantity')" outline required
                                      :hint="errors.get('new_quantity')" persistent-hint @keyup="errors.clear('new_quantity')"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-textarea label="Reason" v-model="adjust.reason" :error="errors.has('reason')" outline required
                                      :hint="errors.get('reason')" persistent-hint @keyup="errors.clear('reason')"></v-textarea>
                    </v-col>
                </v-card-text>
                <v-card-actions>
                    <v-row>
                        <v-col cols="12">
                            <v-btn :loading="loading" type="submit" block large color="blue" dark>Adjust </v-btn>
                        </v-col>
                    </v-row>
                </v-card-actions>
            </v-card>
        </v-form>
    </v-dialog>
</template>
<script>
import Adjustments from "@inventory/libs/stores/Adjustment";

export default {

    props: [
        "product", "modal", "userId",
    ],

    data() {
        return {
            loading: false,
            adjust: new Adjustments(),
        };
    },

    watch: {
        submitted(value) {
            if (value) {
                this.loading = false;
                this.$emit("close");
                this.adjust.form.submitted = false;
            }
        },

        contaminated(value) {
            if (value) {
                this.loading = false;
                this.adjust.form.errorDetected = false;
            }
        },
    },

    computed: {
        storeId() {
            return this.$route.params.storeId;
        },

        submitted() {
            return this.adjust.form.submitted;
        },

        errors() {
            return this.adjust.form.errors;
        },

        contaminated() {
            return this.adjust.form.errorDetected;
        },
    },

    methods: {
        adjustStockQuantity() {
            this.dialog = false;
        },

        prepare() {
            this.adjust.store_product_id = this.product.id;
            this.adjust.previous_quantity = this.product.quantity;
            this.adjust.user_id = this.userId;
        },

        submit() {
            if (!this.loading) {
                this.prepare();
                this.loading = true;
                this.adjust.save();
            }
        },
    },
};
</script>
