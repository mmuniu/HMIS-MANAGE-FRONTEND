/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-04-09
* Time: 15:47
* Project: platform
*/

<template>

    <div>
        <v-card v-if="item">
            <v-card-title primary-title class="teal white--text">
                <div>
                    <p class="headline">{{ item.name }}</p>
                </div>

                <v-spacer></v-spacer>
            </v-card-title>

            <collabmed-loading v-if="!initialised"></collabmed-loading>

            <div v-else>
                <v-card-text v-if="prices.facilityPrices.length > 0">

                    <v-row  v-if="prices.facilityPrices.length > 0">
                        <v-col cols="12" sm="6" md="4" lg="4" v-for="(item, index) in facilities.facilities" :key="index">
                            <v-card class="ml-2 mb-2 elevation-5">
                                <v-card-title>
                                    <strong>Facility:</strong> {{ item.name }}
                                </v-card-title>

                                <v-card-text>

                                    <v-text-field
                                            type="number"
                                            label="Cash Charge"
                                            v-model="prices.facilityPrices[index].cash_charge"
                                            required
                                    >
                                    </v-text-field>

                                    <br/>

                                    <v-text-field
                                            type="number"
                                            label="Insurance Charge"
                                            v-model="prices.facilityPrices[index].insurance_charge"
                                            required
                                    >
                                    </v-text-field>

                                    <v-checkbox
                                            v-model="prices.facilityPrices[index].precharge"
                                            label="Charge procedure at reception?"
                                    ></v-checkbox>

                                    <v-switch
                                            v-model="prices.facilityPrices[index].variable_pricing"
                                            label="Has variable pricing (thus editable)"
                                    ></v-switch>

                                    <v-switch
                                            v-model="prices.facilityPrices[index].requires_preauth"
                                            label="Requires pre-auth"
                                    ></v-switch>


                                    <div v-if="prices.facilityPrices[index].requires_preauth">
                                        <v-switch
                                                v-model="prices.facilityPrices[index].preauth_cash"
                                                label="Requires pre-auth when using cash"
                                        ></v-switch>

                                        <v-switch
                                                v-model="prices.facilityPrices[index].preauth_insurance"
                                                label="Requires pre-auth when using insurance"
                                        ></v-switch>

                                        <v-switch
                                                v-if="prices.facilityPrices[index].preauth_insurance"
                                                v-model="prices.facilityPrices[index].preauth_specific_insurance"
                                                label="Requires pre-auth when only using specific insurance"
                                        ></v-switch>

                                        <v-autocomplete :items="insurances.companies"
                                                  item-text="name"
                                                  item-value="id"
                                                  multiple
                                                  v-if="prices.facilityPrices[index].preauth_specific_insurance"
                                                  v-model="prices.facilityPrices[index].preauth_specific_insurances"
                                                  >
                                        </v-autocomplete>

                                        <v-switch
                                                v-if="prices.facilityPrices[index].preauth_insurance"
                                                v-model="prices.facilityPrices[index].preauth_specific_schemes"
                                                label="Requires pre-auth when only using specific scheme"
                                        ></v-switch>

                                        <v-autocomplete :items="schemes.data"
                                                    multiple
                                                    item-value="id"
                                                    item-text="full_name"
                                                    v-if="prices.facilityPrices[index].preauth_specific_schemes"
                                                    v-model="prices.facilityPrices[index].preauth_specific_schemes_array"
                                        >
                                        </v-autocomplete>
                                    </div>


                                </v-card-text>
                            </v-card>

                        </v-col>
                    </v-row>

                </v-card-text>
            </div>

            <v-card-actions>
                <v-btn color="blue" text @click="close()">Cancel</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="green" dark @click="save()" :loading="saveLoader">Update Prices</v-btn>
            </v-card-actions>

        </v-card>
    </div>
</template>

<script>
import Procedure from '@evaluation/libs/procedures/Procedure';
import _ from 'lodash';
import { mapActions, mapGetters } from 'vuex';

export default {
    props: {
        procedure: {
            required: true,
        },
    },

    data() {
        return {
            saveLoader: false,
            obj: new Procedure,
            prices: {
                facilityPrices: [],
            },
        };
    },

    computed: {
        ...mapGetters({
            insurances: 'getInsurances',
            schemes: 'getSchemes',
            facilities: 'getFacilities',
        }),

        item() {
            return JSON.parse(this.procedure);
        },

        initialised() {
            if (this.facilities.facilities && this.insurances.companies && this.schemes.data) {
                return true;
            }
            return false;
        },

        submitted() {
            return this.obj.form.submitted;
        },

        contaminated() {
            return this.obj.form.errorDetected;
        },

        errors() {
            return this.obj.form.errors;
        },
    },

    watch: {
        show(val) {
            if (val) {
                this.dialog = true;
            }
        },

        submitted(val) {
            if (val) {
                this.saveLoader = false;
                this.obj.form.submitted = false;
                this.saved();
            }
        },

        facilities(val) {
            if (val.facilities) {
                this.prices.facilityPrices = [];

                _.each(this.facilities.facilities, (fac, index) => {
                    const thePrice = _.find(this.item.prices, { facility_id: fac.id });

                    this.prices.facilityPrices.push({
                        facility_id: fac.id,
                        cash_charge: thePrice ? thePrice.cash_charge : 0,
                        insurance_charge: thePrice ? thePrice.insurance_charge : 0,
                        precharge: thePrice ? thePrice.precharge : false,
                        variable_pricing: thePrice ? thePrice.variable_pricing : false,
                        requires_preauth: thePrice ? thePrice.requires_preauth : false,
                        preauth_cash: thePrice ? thePrice.preauth_cash : false,
                        preauth_insurance: thePrice ? thePrice.preauth_insurance : false,
                        preauth_specific_insurance: thePrice ? thePrice.preauth_specific_insurance : false,
                        preauth_specific_insurances: thePrice ? thePrice.preauth_specific_insurances : false,
                        preauth_specific_schemes: thePrice ? thePrice.preauth_specific_scheme : false,
                        preauth_specific_schemes_array: thePrice ? thePrice.preauth_specific_schemes_array : false,
                    });
                });
            }
        },

        contaminated(value) {
            if (value) {
                this.saveLoader = false;
                this.obj.form.errorDetected = false;
            }
        },
    },

    methods: {
        ...mapActions([
            'setInsurances',
            'setSchemes',
            'setFacilities',
        ]),

        close() {
            this.dialog = false;
            this.$emit('close');
        },

        save() {
            if (this.saveLoader === true) {
                flash({ message: 'Wait for previous request to finish', alert: 'error' });
                return;
            }

            this.obj.prices = _.filter(this.prices.facilityPrices, (item) => {
                if (item) {
                    return _.values(item);
                }
            });

            this.saveLoader = true;

            this.obj.updatePrices(this.item.id);
        },

        saved() {
            this.dialog = false;
            this.$emit('saved');
        },
    },

    mounted() {
        this.setFacilities();
        this.setInsurances();
        this.setSchemes();
    },
};
</script>

<style scoped lang="scss">

</style>
