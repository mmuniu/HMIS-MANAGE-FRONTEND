<template>
    <v-dialog v-model="billBreakDownDialog" width="800" persistent>

        <template v-slot:activator="{ on }">
            <v-btn color="brown" small dark v-on="on">
                <v-icon>add</v-icon> {{ label }}
            </v-btn>
        </template>

        <v-card>

            <v-card-title class="headline purple white--text" primary-title>

                {{ invoice ? 'Add/Manage approved amounts' : 'Add bill breakdowns' }}

                <v-spacer></v-spacer>

                <v-btn icon dark @click.native="close" absolute right>
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text>
                <collabmed-loading v-if="!insuranceCompanies.companies"></collabmed-loading>

                <v-container v-else>

                    <div v-if="!invoice">
                        <h6 class="grey--text">Please note that the info here is just for presentation and has no effect on the final bill</h6>
                        <h6 class="grey--text">Let's just say this will help you send a partially processed chargesheet to either the patient,
                            or the insurance company with probable breakdowns of how much each might need to pay
                        </h6>
                    </div>

                    <div v-for="(billBreakdown, index) in billBreakdowns" :key="index">
                        <v-row  v-if="!invoice">

                            <v-col class="px-2" cols="11">
                                <v-switch v-model="billBreakdown.by_patient"
                                          label="The patient will be covering this bill"
                                ></v-switch>
                            </v-col>

                            <v-col>
                                <v-btn icon color="white" small :disabled="index < 1" @click="removeBreakDown(index)">
                                    <v-icon color="error">delete</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>

                        <v-row >
                            <v-col class="px-2" cols="12" sm="4" >
                                <v-autocomplete :items="insuranceCompanies.companies"
                                                @change="selectSchemes($event, index)"
                                                item-text="name"
                                                clearable
                                                item-value="id"
                                                :disabled="billBreakdown.by_patient"
                                                @click:clear="companyCleared()"
                                                v-model="billBreakdown.company_id"
                                                label="Insurance Company" outline
                                ></v-autocomplete>
                            </v-col>

                            <v-col class="px-2" cols="12" sm="4" >
                                <v-autocomplete v-model="billBreakdown.scheme_id"
                                                :disabled="billBreakdown.schemes.length < 1 || billBreakdown.by_patient"
                                                :items="billBreakdown.schemes"
                                                clearable
                                                @click:clear="schemeCleared()"
                                                item-text="full_name" item-value="id"
                                                label="Insurance Schemes" outline
                                ></v-autocomplete>
                            </v-col>

                            <v-col class="px-2" cols="12" sm="4" >
                                <v-text-field
                                        v-model="billBreakdown.amount"
                                        outline
                                        label="Amount"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </div>

                    <v-row >
                        <v-col class="px2" cols="12">
                            <v-btn small color="primary" @click="addBreakdown()">
                                <v-icon small color="white">add</v-icon>
                                add
                            </v-btn>
                            <v-btn small color="success" @click="saveBreakdowns()">
                                <v-icon small color="white">save</v-icon>
                                submit
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-container>


                <br/>

                <div v-if="getBreakdowns">
                    <v-data-table :headers="headers" :items="getBreakdowns">
                        <template v-slot:item.actions="{ item }">
                            <v-btn icon small color="error" class="white--text" @click="deleteBreakdown(item.id)">
                                <v-icon>delete</v-icon>
                            </v-btn>
                        </template>
                    </v-data-table>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import { _ } from 'vue-underscore';
import { mapActions, mapGetters } from 'vuex';
import Chargesheet from '@inpatient/libs/chargesheet/Chargesheet';

export default {
    name: 'AddBillChargeBreakDown',

    props: {
        visitId: {
            required: true,
        },

        invoice: {
            type: String,
            default: null,
        },

        label: {
            type: String,
            default: 'Bill splitting (visual only)',
        },
    },

    data: () => ({
        billBreakDownDialog: false,
        obj: new Chargesheet,
        loading: false,
        insuranceSchemes: [],
        insurance_company: null,
        billBreakdowns: [
            {
                schemes: [],
                company_id: null,
                scheme_id: null,
                by_patient: false,
            },
        ],
        headers: [
            { text: "Insurance", value: "insurance" },
            { text: "Scheme", value: "scheme" },
            { text: "Amount", value: "amount" },
            { text: "Actions", value: "actions" },
        ],
    }),

    computed: {
        ...mapGetters({
            insuranceCompanies: 'getInsurances',
            getBreakdowns: 'getPartialBreakdowns',
        }),
    },

    methods: {
        ...mapActions({
            fetchInsurances: 'setInsurances',
            fetchBreakdowns: 'setPartialBreakdowns',
        }),

        close() {
            this.billBreakDownDialog = false;
        },

        /* companyCleared () {
                this.insuranceSchemes = [];
                this.billBreakdown.scheme_id = null;
                this.billBreakdown.company_id = null;
            },*/

        /* schemeCleared () {
                this.billBreakdown.scheme_id = null;
            },*/

        selectSchemes(company_id, index) {
            if (company_id) {
                this.billBreakdowns[index].schemes = _.findWhere(this.insuranceCompanies.companies, { id: company_id }).schemes;
            }
        },

        removeBreakDown(index) {
            this.billBreakdowns.splice(index, 1);
        },

        async saveBreakdowns() {

            const response = this.obj.recordBreakDowns( this.billBreakdowns, this.visitId, this.invoice ? this.invoice : null);

            if (response) {
                this.close();
                this.billBreakdowns = [
                    {
                        schemes: [],
                        company_id: null,
                        scheme_id: null,
                        by_patient: false,
                    },
                ];

                this.initialize();
            }
        },

        addBreakdown() {
            this.billBreakdowns.push({
                schemes: [],
                company_id: null,
                scheme_id: null,
                by_patient: false,
            });
        },

        async deleteBreakdown(id) {
            const response = await this.obj.deleteBreakdown(id);

            if(response) {
                window.location.reload();
            }
        },

        initialize() {
            this.fetchInsurances();
            if(this.visitId){
              this.fetchBreakdowns({
                params: {
                  visit_id: this.visitId,
                  invoice_id: this.invoice,
                }
              });
            }

        },
    },

    mounted() {
        this.initialize();
    },
};
</script>

<style scoped>

</style>
