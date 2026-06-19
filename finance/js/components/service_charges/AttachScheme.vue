<template>
    <v-card class="tallest">
        <v-card-title class="subheading grey--text text--darken-3">
            Attach a scheme to service
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <div class="title py-2">{{ charge.service_code }}</div>
            <p>{{ charge.description }}</p>

            <v-divider></v-divider>

            <v-row >
                <v-col cols="12">
                    <v-autocomplete label="Select a scheme" :items="schemes" item-text="name" item-value="id" outline
                                    v-model="chargeObj.scheme_id" :error="errors.has('scheme_id')"
                                    :hint="errors.get('scheme_id')" persistent-hint @change="errors.clear('scheme_id')"
                    >
                    </v-autocomplete>
                </v-col>

                <v-col cols="12">
                    <v-text-field label="Amount (fee)" v-model="chargeObj.amount" :error="errors.has('amount')" outline
                                  :hint="errors.get('amount')" persistent-hint @keyup="errors.clear('amount')"></v-text-field>
                </v-col>
            </v-row>
        </v-card-text>

        <v-card-actions class="pa-3">
            <div class="descend">
                <v-btn color="primary" class="mb-2" block large @click="attachScheme()"
                       :loading="loader" :disabled="loader" :dark="!loader">Save scheme details</v-btn>
            </div>
        </v-card-actions>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import SchemeCharge from '@finance/libs/serviceCharges/SchemeCharge';

export default {
    props: [
        'serviceCharge',
    ],

    data() {
        return {
            charge: JSON.parse(this.serviceCharge),
            chargeObj: new SchemeCharge(),
            schemes: [],
            loader: false,
        };
    },

    watch: {
        getSchemes(value) {
            if (value) {
                this.schemes = value.data;
            }
        },

        contaminated(value) {
            if (value) {
                this.loader = false;
                this.chargeObj.form.errorDetected = false;
            }
        },

        submitted(value) {
            if (value) {
                this.loader = false;
                this.chargeObj.form.submitted = false;
                this.setSchemes({
                    params: {
                        charge_id: this.serviceCharge.id,
                    },
                });
            }
        },
    },

    computed: {
        ...mapGetters([
            'getSchemes',
        ]),

        initialised() {
            return this.schemes.length > 0;
        },

        errors() {
            return this.chargeObj.form.errors;
        },

        submitted() {
            return this.chargeObj.form.submitted;
        },

        contaminated() {
            return this.chargeObj.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            'setSchemes',
        ]),

        attachScheme() {
            this.loader = true;
            this.chargeObj.save();
        },
    },

    mounted() {
        this.setSchemes();
        this.chargeObj.charge_id = this.charge.id;
    },
};
</script>
