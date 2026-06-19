<template>
    <form @submit.prevent="!supplierId ? save() : update()">
        <v-row >
            <v-col cols="12" md="6">
                <div class="mx-3">
                    <v-text-field label="Supplier name" v-model="supplier.name" :error="errors.has('name')" outline required
                                  :hint="errors.get('name')" persistent-hint @keyup="errors.clear('name')"></v-text-field>
                </div>
            </v-col>

            <v-col cols="12" md="6">
                <div class="mx-3">
                    <v-text-field label="Postal code" v-model="supplier.post_code" :error="errors.has('post_code')" outline
                                  :hint="errors.get('post_code')" persistent-hint @keyup="errors.clear('post_code')"></v-text-field>
                </div>
            </v-col>

            <v-col cols="12" md="6">
                <div class="mx-3">
                    <v-text-field label="Postal address *" v-model="supplier.address" :error="errors.has('address')" outline required
                                  :hint="errors.get('address')" persistent-hint @keyup="errors.clear('address')"></v-text-field>
                </div>
            </v-col>

            <v-col cols="12" md="6">
                <div class="mx-3">
                    <v-text-field label="Mobile number" v-model="supplier.mobile" :error="errors.has('mobile')" outline
                                  :hint="errors.get('mobile')" persistent-hint @keyup="errors.clear('mobile')"></v-text-field>
                </div>
            </v-col>

            <v-col cols="12" md="6">
                <div class="mx-3">
                    <v-text-field label="Telephone number *" v-model="supplier.telephone" :error="errors.has('telephone')" outline required
                                  :hint="errors.get('telephone')" persistent-hint @keyup="errors.clear('telephone')"></v-text-field>
                </div>
            </v-col>

            <v-col cols="12" md="6">
                <div class="mx-3">
                    <v-text-field label="Street" v-model="supplier.street" :error="errors.has('street')" outline
                                  :hint="errors.get('street')" persistent-hint @keyup="errors.clear('street')"></v-text-field>
                </div>
            </v-col>

            <v-col cols="12" md="6">
                <div class="mx-3">
                    <v-text-field label="City/Town *" v-model="supplier.town" :error="errors.has('town')" outline required
                                  :hint="errors.get('town')" persistent-hint @keyup="errors.clear('town')"></v-text-field>
                </div>
            </v-col>

            <v-col cols="12" md="6">
                <div class="mx-3">
                    <v-text-field label="Building" v-model="supplier.building" :error="errors.has('building')" outline
                                  :hint="errors.get('building')" persistent-hint @keyup="errors.clear('building')"></v-text-field>
                </div>
            </v-col>

            <v-col cols="12" md="6">
                <div class="mx-3">
                    <v-text-field label="Email Address *" v-model="supplier.email" :error="errors.has('email')" outline required
                                  :hint="errors.get('email')" persistent-hint @keyup="errors.clear('email')"></v-text-field>
                </div>
            </v-col>

            <v-col cols="12" md="6">
                <div class="mx-3">
                    <v-text-field label="Fax number" v-model="supplier.fax" :error="errors.has('fax')" outline
                                  :hint="errors.get('fax')" persistent-hint @keyup="errors.clear('fax')"></v-text-field>
                </div>
            </v-col>

            <v-col cols="12" class="text-right mx-2">
                <v-btn
                        type="submit"
                        color="blue"
                        class="caption"
                        :dark="!loading"
                        :loading="loading"
                        :disabled="loading"
                        large
                >
                    {{ !supplierId ? 'Save ' : 'Update ' }} details
                </v-btn>
            </v-col>

        </v-row>
    </form>
</template>

<script>
import Supplier from "@inventory/libs/suppliers/Supplier";

export default {
    name: "SupplierForm",

    props: [
        "supplierId",
    ],

    data() {
        return {
            supplier: new Supplier(),
            loading: false,
        };
    },

    watch: {
        submitted(value) {
            if (value) {
                this.loading = false;
                this.supplier.form.submitted = false;
            }
        },

        contaminated(value) {
            if (value) {
                this.loading = false;
                this.supplier.form.errorDetected = false;
            }
        },
    },

    computed: {
        errors() {
            return this.supplier.form.errors;
        },

        submitted() {
            return this.supplier.form.submitted;
        },

        contaminated() {
            return this.supplier.form.errorDetected;
        },
    },

    methods: {
        save() {
            if (!this.loading) {
                this.loading = true;
                this.supplier.store();
            }
        },

        update() {

        },
    },

    mounted() {
        if (this.supplierId) {
            this.supplier.show( this.supplierId );
        }
    },
};
</script>
