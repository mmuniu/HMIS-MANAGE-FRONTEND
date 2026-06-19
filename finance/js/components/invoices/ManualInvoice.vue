<template>
    <v-card flat>
        <div class="px-6 py-3">

            <h4>
                Invoice details
            </h4>
            <!--invoice details-->
            <div>
                <v-row>
                    <v-col cols="4">
                        <v-text-field v-model="invData.patient_name"
                                      label="Patient Name">
                        </v-text-field>
                    </v-col>
                    <v-col cols="4">
                        <v-text-field v-model="invData.patient_no"
                                      label="Patient no">
                        </v-text-field>
                    </v-col>
                    <v-col cols="4">
                        <v-text-field v-model="invData.policy_no"
                                      label="Policy No">
                        </v-text-field>
                    </v-col>


                    <v-col cols="3">
                        <v-text-field v-model="invData.invoice_no"
                                      label="Invoice no">
                        </v-text-field>
                    </v-col>
                    <v-col class="px-2" cols="12" sm="3">
                        <v-autocomplete :items="insurances.companies"
                                        @change="companySelected($event)"
                                        item-text="name"
                                        return-object
                                        clearable
                                        @click:clear="companyCleared()"
                                        v-model="insurance_company"
                                        label="Insurance Company"
                        ></v-autocomplete>
                    </v-col>

                    <v-col class="px-2" cols="12" sm="3" >
<!--                        <settings-schemes-search :disabled="!invData.company_id"-->
<!--                                                 @results="schemeSelected"-->
<!--                                                 @clearedSelected="clearScheme"-->
<!--                                                 :company-id="invData.company_id">-->
<!--                        </settings-schemes-search>-->
                        <v-autocomplete v-model="invData.scheme_id"
                                        :disabled="insuranceSchemes.length < 1"
                                        :items="insuranceSchemes"
                                        clearable
                                        @click:clear="schemeCleared()"
                                        item-text="full_name" item-value="id"
                                        label="Insurance Schemes"
                        ></v-autocomplete>
                    </v-col>
                    <v-col cols="3">
                        <collabmed-date-time-picker
                                @input="setInvoiceDate"
                                dateOnly
                                :datetime="invData.invoice_date"
                                label="Invoice date">
                        </collabmed-date-time-picker>
                    </v-col>
                </v-row>
            </div>

            <h4>
                Invoice Items
            </h4>
            <!-- invoice items -->
            <div>
                <v-row v-for="(item, index) in invData.items" :key="index">
                    <v-col cols="5">
                        <v-text-field v-model="item.item_name"
                                      label="Item name"
                        >
                        </v-text-field>
                    </v-col>
                    <v-col cols="2">
                        <v-select
                                label="Item type"
                                :items="[
                                    'investigation',
                                    'prescription',
                                    'consumable',
                                    'Admission + Daily charges',
                                    'Ward charge',
                                    'rebate',
                                    'copay'
                                  ]"
                                v-model="item.item_type">
                        </v-select>
                    </v-col>
                    <v-col cols="1">
                        <v-text-field v-model="item.price"
                                      label="price"
                                      @input="updateTotals(index)"
                        >
                        </v-text-field>
                    </v-col>
                    <v-col cols="1">
                        <v-text-field v-model="item.units"
                                      label="Units"
                                      @input="updateTotals(index)"
                        >
                        </v-text-field>
                    </v-col>
                    <v-col cols="1">
                        <v-text-field v-model="item.amount"
                                      readonly
                                      label="Amount"
                        >
                        </v-text-field>
                    </v-col>
                    <v-col cols="1">
                        <v-btn icon small color="error" @click="removeItem(index)">
                            <v-icon small>
                                delete
                            </v-icon>
                        </v-btn>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="8">
                        <div v-if="invData.amount > 0">
                            <span style="font-size: 13px; font-weight: bold">
                                Total: {{ invData.amount }}
                            </span>
                        </div>
                    </v-col>
                </v-row>

                <v-row v-if="errors.length > 0">
                    <v-col cols="8">
                        <v-alert color="error">
                            <li v-for="(error, key) in errors" :key="key">
                                <span v-for="(e, index) in error" :key="index">{{ e }}</span>
                            </li>
                        </v-alert>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="4">
                        <v-text-field
                                v-model="invData.set_amount"
                                label="Set invoice amount"
                                @change="setInvoiceAmount()"
                        >
                        </v-text-field>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="8">
                        <v-card-actions>
                            <v-btn small color="primary" @click="addItem()">
                                add item
                            </v-btn>
                            <v-spacer/>
                            <v-btn small color="primary" @click="saveManualInv()">
                                save
                            </v-btn>
                        </v-card-actions>
                    </v-col>
                </v-row>
            </div>

        </div>
    </v-card>
</template>
<script>
    import { mapActions, mapGetters } from 'vuex';
    import Invoice from '@finance/libs/invoices/Invoice';

    export default {
        data: () => ({
            invObj: new Invoice(),
            insuranceSchemes: [],
            insurance_company: null,
            errors: [],
            invData: {
                invoice_no: null,
                policy_no: null,
                patient_no: null,
                set_amount: null,
                invoice_date: null,
                company_id: null,
                scheme_id: null,
                amount: 0,
                patient_name: null,
                items: [
                    {
                        item_name: null,
                        item_type: null,
                        units: null,
                        price: null,
                        amount: null
                    },
                    {
                        item_name: null,
                        item_type: null,
                        units: null,
                        price: null,
                        amount: null
                    }
                ]
            }
        }),

        computed: {
            ...mapGetters({
                insurances: 'getInsurances',
            })
        },

        methods: {
            ...mapActions({
                fetchInsurances: 'setInsurances',
            }),

            updateTotals(index) {

                let item = this.invData.items[index];

                if(item.price !== null && item.units !== null) {

                    item.amount = item.price * item.units;

                    this.updateInvoiceTotalAmount();
                }
            },

            setInvoiceDate (date) {
                this.invData.invoice_date = date;
            },

            updateInvoiceTotalAmount() {
                let total = 0;

                this.invData.items.forEach((item) => {
                    if(item.item_type === 'rebate') {
                        total -= item.amount;
                    } else {
                        total += item.amount;
                    }
                })

                this.invData.amount = total;
            },

            companyCleared() {
                this.insuranceSchemes = [];
                this.invData.scheme_id = null;
                this.invData.company_id = null;
            },

            schemeCleared() {
                this.invData.scheme_id = null;
            },

            companySelected(company) {
                if (company) {
                    this.insuranceSchemes = company.schemes;
                    this.invData.company_id = company.id;
                }
            },

            schemeSelected(scheme) {
                if (company) {
                    this.invData.scheme_id = scheme.id;
                }
            },
            clearScheme(scheme) {
                this.invData.scheme_id = null;
            },

            addItem() {
                this.invData.items.push({
                    item_name: null,
                    item_type: null,
                    units: null,
                    price: null,
                    amount: null
                });
            },

            removeItem(index) {
                this.invData.items.splice(index, 1);
            },

            async saveManualInv() {
                const response = await this.invObj.saveManualInv(this.invData);

                if(response) {
                    console.log(response);

                    if(response.errors) {
                        this.errors = response.errors;
                    } else {
                        if(response.alert) {
                            if(response.alert === 'success') {
                                this.$emit('manualSaved');

                                this.invData.items = [];
                            }
                        }
                    }
                }
            }
        },

        mounted() {
            this.fetchInsurances();
        }

    }
</script>
