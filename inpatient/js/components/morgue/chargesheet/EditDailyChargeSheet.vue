<template>
    <v-card>
        <collabmed-loading v-if="!charges"></collabmed-loading>

        <div v-else>

            <inpatient-evaluation-navigation :visit-id="visitId"
                                             v-if="patientManagement"
                                             active="daily-charge-sheet">
            </inpatient-evaluation-navigation>

            <v-row  class="px-4">
                <v-col cols="6" sm="7" md="10">
                    <v-checkbox v-model="use_org" label="Use organization details on printouts" />
                    <v-menu transition="slide-y-transition" bottom>
                        <template v-slot:activator="{ on }">
                            <v-btn class="purple" color="primary" dark v-on="on" small>
                                Print outs
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-item>
                                <v-btn @click="printDailyChargeSheet()" small color="primary">print daily chargesheet </v-btn>
                            </v-list-item>
                            <v-list-item>
                                <v-btn @click="printDailyChargeSheet(1)" small color="primary">print daily chargesheet (grouped) </v-btn>
                            </v-list-item>
                            <v-list-item>
                                <v-btn color="success" small dark @click="printChargeSheet()">
                                    <v-icon>print</v-icon> Print Chargesheet (Departmental)
                                </v-btn>
                            </v-list-item>
                        </v-list>
                    </v-menu>

                    <inpatient-add-rebate :visitId="visitId"></inpatient-add-rebate>

                    <add-bill-charges-breakdown :insuranceCompanies="insurances"
                                                :visitId="visitId">
                    </add-bill-charges-breakdown>

                    <v-btn @click="viewChargesheet()"
                           small
                           color="primary"
                           v-if="patientManagement">
                        view chargesheet
                    </v-btn>

                </v-col>
                <v-col class="text-right" cols="12" md="2">
                    <v-btn small color="primary" @click="processInpatientBill()">Process the bill</v-btn>
                </v-col>
            </v-row>

            <v-row  class="px-4">
                <v-col class="mx-8">
                    <h5>Please note the following:</h5>
                    <ul>
                        <li>Updating price of a daily charge or a ward charge will take effect across all days</li>
                        <li>Increasing the units of a daily charge/ward charge will only have it appear out from days after the last day it was charged</li>
                        <li>Decreasing the units of a daily charge/ward charge will remove the charge from days from the days last days</li>
                        <li>To remove a charge from the chargesheet, you can reduce it's quantity to 0 on any of the days or tap the delete button</li>
                        <li>changes to a daily charge or a ward charge require page reload to take effect: this is done automatically for you though</li>
                    </ul>
                </v-col>
            </v-row>


            <div v-for="(dateCharges, date) in charges.data" :key="date" class="px-4 py-2">

                <h4 style="font-style: italic; width: 100%" class="grey lighten-2 pa-2" >{{ date }}</h4>

                <div>
                    <div>
                        <p class="display-inline headers" style="width: 3%">#</p>
                        <p class="display-inline headers" style="width: 30%">Name</p>
                        <p class="display-inline headers" style="width: 10%">Type</p>
                        <p class="display-inline headers" style="width: 8%">Units</p>
                        <p class="display-inline headers" style="width: 10%">Price</p>
                        <p class="display-inline headers" style="width: 15%">Total</p>
                        <p class="display-inline headers" style="width: 15%">Date</p>
                        <p class="display-inline headers" style="width: 5%" v-if="can('inpatient.remove-items-from-chargesheet')">Actions</p>
                    </div>
                </div>

                <div v-for="(charge, index) in dateCharges" :key="index">
                    <div class="lighten-4"
                         v-if="charge != null"
                         :style="{ 'background-color' : charge.checked }"
                         :class="{
                         'orange' : charge.removed_from_chargesheet != null,
                         'grey' : index % 2 === 0 && charge.removed_from_chargesheet === null,
                     }">
                        <p class="display-inline" style="width: 3%">
                            <v-checkbox
                                    v-model="charge.checked"
                                    primary
                                    hide-details
                            ></v-checkbox>
                        </p>
                        <p class="display-inline" style="width: 30%">{{ charge.name }}</p>
                        <p class="display-inline" style="width: 10%">{{ charge.type }}</p>

                        <p class="display-inline" style="width: 8%">

                            <input
                                    type="number"
                                    style="width: 60%"
                                    :disabled="!can('inpatient.edit-chargesheet-quantities')"
                                    v-model="charge.units"
                                    @change="editObserved(charge, date, index)"
                            />
                        </p>

                        <p class="display-inline" style="width: 10%">
                            <span v-if="!can('inpatient.process-inpatient-bill')">{{ charge.cost }}</span>
                            <input
                                    v-else
                                    type="number"
                                    style="width: 90%"
                                    :disabled="!can('inpatient.edit-chargesheet-prices')"
                                    v-model="charge.cost"
                                    @change="editObserved(charge, date, index)"
                            />
                        </p>
                        <p class="display-inline" style="width: 15%">{{ charge.total }}</p>
                        <p class="display-inline" style="width: 15%">{{ charge.date }}</p>
                        <p class="display-inline" style="width: 5%" v-if="can('inpatient.remove-items-from-chargesheet')">

                            <v-tooltip bottom v-if="!charge.removed_from_chargesheet">
                                <template v-slot:activator="{ on }">
                                    <v-icon small color="error"
                                            style="cursor: pointer"
                                            v-on="on"
                                            @click="removeFromChargeSheet(charge, date, index)"
                                    >
                                        delete
                                    </v-icon>
                                </template>

                                <span>Remove item from chargesheet and patient bill</span>
                            </v-tooltip>

                            <v-tooltip bottom v-else>
                                <template v-slot:activator="{ on }">
                                    <v-icon small color="primary"
                                            style="cursor: pointer"
                                            v-on="on"
                                            @click="removeFromChargeSheet(charge, date, index)"
                                    >
                                        undo
                                    </v-icon>
                                </template>

                                <span>Undo removal from chargesheet</span> <br/>
                                <span>{{ charge.removed_from_chargesheet }}</span>
                            </v-tooltip>

                        </p>
                    </div>
                </div>
            </div>


            <!-- edit rebates data -->
            <div class="px-4 py-2" v-if="charges.available_rebates">
                <h3 style="font-weight: bold">Rebates</h3>

                <div class="py-2">
                    <div>
                        <p class="display-inline headers" style="width: 30%">Name</p>
                        <p class="display-inline headers" style="width: 10%">Quantity</p>
                        <p class="display-inline headers" style="width: 10%">Price</p>
                        <p class="display-inline headers" style="width: 15%">Total</p>
                        <p class="display-inline headers" style="width: 5%" v-if="can('inpatient.remove-items-from-chargesheet')">Actions</p>
                    </div>

                    <div v-for="(rebate, index) in charges.available_rebates" :key="rebate.id">
                        <p class="display-inline" style="width: 30%">{{ rebate.name }}</p>
                        <p class="display-inline" style="width: 10%">
                            <input
                                    type="number"
                                    style="width: 60%"
                                    :disabled="!can('inpatient.edit-chargesheet-quantities')"
                                    v-model="rebate.quantity"
                                    @change="rebateChangesMade(rebate, index)"
                            />
                        </p>
                        <p class="display-inline" style="width: 10%">
                            <input
                                    type="number"
                                    style="width: 90%"
                                    :disabled="!can('inpatient.edit-chargesheet-prices')"
                                    v-model="rebate.price"
                                    @change="rebateChangesMade(rebate, index)"
                            />
                        </p>
                        <p class="display-inline" style="width: 15%">{{ rebate.amount }}</p>
                        <p class="display-inline" style="width: 5%" v-if="can('inpatient.remove-items-from-chargesheet')">
                            <v-tooltip bottom v-if="!rebate.removed_from_chargesheet">
                                <template v-slot:activator="{ on }">
                                    <v-icon small color="error"
                                            style="cursor: pointer"
                                            slot="activator"
                                            @click="deleteRebate(rebate, index)"
                                    >
                                        delete
                                    </v-icon>
                                </template>

                                <span>Delete rebate</span>
                            </v-tooltip>
                        </p>
                    </div>
                </div>
            </div>


            <hr style="height: 20px;"/>

            <div v-if="charges">
                <v-row  class="text-right font-weight-black" >
                    <v-col cols="8" md="9">Grand total: </v-col>
                    <v-col cols="4" md="1">{{ charges.grandTotal }}</v-col>
                    <v-col cols="4" md="1">&nbsp;</v-col>
                </v-row>

                <v-row  class="text-right font-weight-black" v-if="charges.rebates_total > 0">
                    <v-col cols="8" md="9">NHIF rebates: </v-col>
                    <v-col cols="4" md="1">{{ charges.rebates_total }}</v-col>
                    <v-col cols="4" md="1">&nbsp;</v-col>
                </v-row>

                <v-row  class="text-right font-weight-black" v-if="charges.rebates_total > 0">
                    <v-col cols="8" md="9">Balance: </v-col>
                    <v-col cols="4" md="1">{{ (charges.balance)  }}</v-col>
                    <v-col cols="4" md="1">&nbsp;</v-col>
                </v-row>

                <v-row  class="text-right  font-weight-black"  v-for="(breakDown, index) in charges.billInfo" :key="index">
                    <v-col cols="8" md="9">{{ breakDown.name }}:</v-col>
                    <v-col cols="4" md="1">{{ breakDown.amount}}</v-col>
                    <v-col cols="4" md="1">
                        <v-icon small color="error" @click="deleteBreakdown(breakDown.id)">cancel</v-icon>
                    </v-col>
                </v-row>
            </div>


            <hr style="height: 20px;"/>

            <div class="mx-8">
                <!-- v-if="can('process-inpatient-bill')"-->
                <v-btn small color="primary" @click="processInpatientBill()"
                       v-if="can('inpatient.process-inpatient-bill')  && !patientManagement">
                    Process the bill
                </v-btn>

                <v-btn small color="primary"
                       v-if="can('inpatient.verify-final-chargesheet') && !charges.discharge_finalized"
                       @click="finalizeChargesheet()">
                    Finalize Chargesheet and submit
                </v-btn>

                <v-btn small disabled v-if="charges.discharge_finalized">Finalized by: {{ charges.finalized_by }}</v-btn>


                <v-tooltip bottom v-if="can('inpatient.discharge-patients') && !patientManagement">
                    <template v-slot:activator="{ on }">
                        <v-btn color="warning"
                               small
                               slot="activator"
                               @click="dischargePatient()">
                            discharge (only when done editing)
                        </v-btn>
                    </template>

                    <span>Only confirm discharge when you are done making edits</span> <br/>
                </v-tooltip>
            </div>
        </div>
        <br/>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import AddBillChargesBreakdown from './AddBillChargeBreakDown';
import Chargesheet from '@inpatient/libs/chargesheet/Chargesheet';


export default {

    props: [
        'chargesheetdata', 'visitId',
    ],

    components: {
        AddBillChargesBreakdown,
    },

    data: () => ({
        chargeSheet: new Chargesheet(),
        charges: null,
        use_org: false,
    }),

    computed: {
        ...mapGetters({
            insurances: 'getInsurances',
        }),

        patientManagement() {
            return this.$route.query.p_manage ? true : false;
        },
    },

    methods: {
        ...mapActions({
            fetchInsurances: 'setInsurances',
        }),

        async editObserved(charge, date, index) {
            const self = this;

            const response = await this.chargeSheet.updateDaysCharge(charge, date, this.visitId);

            if (response) {
                self.charges.data[date][index].total = charge.units * charge.cost;

                if (charge.type === 'Ward charge' || charge.type === 'Daily charge') {
                    // window.location.reload();
                }
            }
        },

        async removeFromChargeSheet(charge, date, index) {
            const self = this;

            const response = await this.chargeSheet.removeFromChargeSheet(charge, date, this.visitId);

            if (response) {
                self.charges.data[date][index].removed_from_chargesheet = charge.removed_from_chargesheet ? null : 1;
            }
        },

        printChargeSheet() {
            const main_url = '/inpatient/discharge-requests/visit/' + this.visitId + '/print/chargesheet?';

            const use_org = this.use_org ? '&use_org=1' : '&use_org=0';

            window.open(main_url + use_org, '_blank');
        },

        processInpatientBill() {
            window.open(`/finance/split-bill/${this.visitId}`, '_blank');
        },

        printDailyChargeSheet(grouped = 0) {
            const main_url = '/inpatient/discharge-requests/visit/' + this.visitId + '/print/daily-chargesheet?&without_removed=1';

            const group = grouped ? '&group_data=1' : '&group_data=0';

            const use_org = this.use_org ? '&use_org=1' : '&use_org=0';

            window.open(main_url + group + use_org, '_blank');
        },

        viewChargesheet() {
            window.open(`/inpatient/evaluations/${this.visitId}/daily-charge-sheet`, '_self');
        },

        dischargePatient() {
            window.open(`/inpatient/discharge-requests/${this.visitId}/confirm`, '_self');
        },

        async rebateChangesMade(rebate, index) {
            const self = this;

            const response = await this.chargeSheet.rebateChangesMade(rebate);

            if (response) {
                self.charges.available_rebates[index].amount = this.charges.available_rebates[index].price * rebate.quantity;
            }
        },

        async deleteRebate(rebate, index) {
            const self = this;

            const response = await this.chargeSheet.deleteRebate(rebate);

            if (response) {
                self.charges.available_rebates.splice(index, 1);
            }
        },

        async finalizeChargesheet() {
            const response = await this.chargeSheet.finalizeChargesheet(this.visitId);

            if (response.alert == 'success') {
                window.open('/inpatient/discharge-requests', '_self');
            }
        },

        async deleteBreakdown(id) {
            const response = await this.chargeSheet.deleteBreakdown(id);

            if (response) {
                window.location.reload();
            }
        },


        async initialize() {
            await this.fetchInsurances();
        },
    },

    mounted() {
        this.charges = JSON.parse(this.chargesheetdata);
        this.initialize();
    },
};
</script>
<style scoped>
    input[type=number] {
        padding: 7px 15px;
        margin: 3px 0;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
    }

    .headers {
        font-size: 16px;
        font-weight: bold;
    }
    .display-inline {
        display: inline-block;
        padding-left: 20px;
        padding: 7px 7px;
        margin: 3px 0;
    }
</style>
