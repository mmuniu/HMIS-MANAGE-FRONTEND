/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-04-14
* Time: 06:14
* Project: platform
*/

<template>
    <div>
        <v-row >
            <v-col cols="6" sm="7" md="10">
                <v-btn color="info" dark @click="expand = !expand">
                    {{ expand ? 'Close' : 'Keep' }} other rows while expanding
                </v-btn>

                <v-btn color="success" dark @click="printChargeSheet()">
                    <v-icon>print</v-icon> Print Chargesheet
                </v-btn>

                <v-btn color="purple lighten-2" dark @click="addVisitRebate()">
                    <v-icon>add</v-icon> Add Rebate
                </v-btn>
                <v-btn @click="printDailyChargeSheet()" small color="primary">print daily chargesheet </v-btn>
                <v-btn @click="printDailyChargeSheet(1)" small color="primary">print daily chargesheet (grouped) </v-btn>
            </v-col>
            <v-spacer></v-spacer>
            <v-col>
                <v-btn color="primary" class="pull-right mb-2" dark @click="initialise()" :loading="saveLoader">
                    <v-icon class="mr-2">cached</v-icon> Refresh ChargeSheet Data
                </v-btn>
            </v-col>
        </v-row>

        <!--procedures-->
        <v-card>
            <v-card-title>
                <h2 class="title">Procedures</h2>
                <v-spacer></v-spacer>
                <v-text-field
                        v-model="search.procedures"
                        append-icon="search"
                        label="Search Procedures"
                        hide-details
                ></v-text-field>
            </v-card-title>

            <v-card-text>

                <collabmed-loading v-if="!initialised"></collabmed-loading>

                <div v-else>
                    <v-data-table
                            :headers="headers.procedures"
                            :items="data.procedures.procedures"
                            :search="search.procedures"
                            :loading="saveLoader"
                            :expand="expand"
                            class="mb-3" flat hide-default-footer
                    >
                        <v-progress-linear v-slot:progress color="red" indeterminate></v-progress-linear>

                        <template v-slot:item.id="{ item }" class="td-id">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                     <span v-on="on">
                                            <v-icon v-if="expanded" small color="red">arrow_upward</v-icon>
                                            <v-icon v-else small color="info">arrow_downward</v-icon>
                                        </span>
                                </template>
                                <span>Click to View changes</span>
                            </v-tooltip>

                            <span class="text-right">#{{ item.id }}</span>
                        </template>
                        <template v-slot:item.name="{ item }">
                            {{ item.procedures ? item.procedures.name : item.procedure }}
                        </template>
                        <template v-slot:item.actions="{ item }">
                            <v-btn v-if="item.invoiced"
                                   dark small
                                   round color="green"
                                   :href="viewInvoice(item.invoiced)"
                                   target="_blank"
                            >
                                Invoiced
                            </v-btn>

                            <v-btn v-else icon small color="primary" @click="updateProcedure(item)">
                                <v-icon small>edit</v-icon>
                            </v-btn>
                        </template>
                        <template v-slot:expanded-item="{ headers, item }">
                            <td :colspan="headers.length">
                                <investigation-changes
                                        :item="item"
                                        :changes="getChargesheetChangesForInvestigation(item.id)"
                                ></investigation-changes>
                            </td>
                        </template>
                    </v-data-table>
                </div>

            </v-card-text>
        </v-card>

        <!--investigations-->
        <v-card class="mt-4">
            <v-card-title>
                <h2 class="title">Investigations</h2>
                <v-spacer></v-spacer>
                <v-text-field
                        v-model="search.investigations"
                        append-icon="search"
                        label="Search Investigations"
                        hide-details
                ></v-text-field>
            </v-card-title>

            <v-card-text>

                <collabmed-loading v-if="!initialised"></collabmed-loading>

                <div v-else>
                    <v-data-table
                            :headers="headers.investigations"
                            :items="data.investigations.investigations"
                            :search="search.investigations"
                            :loading="saveLoader"
                            :expand="expand"
                            class="mb-3" flat hide-default-footer
                    >
                        <template v-slot:item.id="{ item }" class="td-id">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                     <span v-on="on">
                                        <v-icon v-if="expanded" small color="red">arrow_upward</v-icon>
                                        <v-icon v-else small color="info">arrow_downward</v-icon>
                                     </span>
                                </template>
                                <span>Click to View Changes</span>
                            </v-tooltip>
                            <span class="text-right">#{{ item.id }}</span>
                        </template>
                        <template v-slot:item.name="{ item }"> {{ item.procedures ? item.procedures.name : item.procedure }}</template>
                        <template v-slot:item.actions="{ item }">
                            <v-btn v-if="item.invoiced" dark small round color="green" :href="viewInvoice(item.invoiced)" target="_blank">Invoiced</v-btn>

                            <v-btn v-else icon small color="primary" @click="updateProcedure(item)">
                                <v-icon small>edit</v-icon>
                            </v-btn>
                        </template>

                        <template v-slot:expanded-item="{ headers, item }">

                            <td :colspan="headers.length">
                                <investigation-changes
                                        :item="item"
                                        :changes="getChargesheetChangesForInvestigation(item.id)"
                                ></investigation-changes>
                            </td>

                        </template>

                    </v-data-table>
                </div>

            </v-card-text>
        </v-card>

        <!--consumables-->
        <v-card class="mt-4">
            <v-card-title>
                <h2 class="title">Consumables</h2>
                <v-spacer></v-spacer>
                <v-text-field
                        v-model="search.consumables"
                        append-icon="search"
                        label="Search Consumables"
                        hide-details
                ></v-text-field>
            </v-card-title>

            <v-card-text>

                <collabmed-loading v-if="!initialised"></collabmed-loading>

                <div v-else>
                    <v-data-table
                            :headers="headers.consumables"
                            :items="data.consumables.consumables"
                            :search="search.consumables"
                            :loading="saveLoader"
                            :expand="expand"
                            class="mb-3" flat hide-default-footer
                    >
                        <template v-slot:item.id="{ item }" class="td-id">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                            <span v-on="on">
                                                <v-icon v-if="expanded" small color="red">arrow_upward</v-icon>
                                                <v-icon v-else small color="info">arrow_downward</v-icon>
                                            </span>
                                </template>
                                <span>Click to View Changes</span>
                            </v-tooltip>
                            <span class="text-right">#{{ item.id }}</span>
                        </template>
                        <template v-slot:item.name="{ item }">
                            {{ item.product ? item.product.name : item.product_id }}
                        </template>
                        <template v-slot:item.actions="{ item }">
                            <v-btn v-if="item.invoice_id" dark small round color="green" :href="viewInvoice(item.invoice_id)" target="_blank">Invoiced</v-btn>

                            <div v-else>
                                <v-btn icon small color="primary" @click="updateConsumable(item)">
                                    <v-icon small>edit</v-icon>
                                </v-btn>

                                <v-btn icon small dark color="red" @click="cancelConsumable(item)">
                                    <v-icon small>clear</v-icon>
                                </v-btn>
                            </div>
                        </template>

                        <template v-slot:expanded-item="{ headers, item }">

                            <td :colspan="headers.length">
                                <consumable-changes
                                        :item="item"
                                        :changes="getChargesheetChangesForConsumable(item.id)"
                                ></consumable-changes>
                            </td>

                        </template>

                    </v-data-table>
                </div>

            </v-card-text>
        </v-card>

        <!--daily charges-->
        <v-card class="mt-4">
            <v-card-title>
                <h2 class="title">Charges</h2>
                <v-spacer></v-spacer>
                <v-text-field
                        v-model="search.charges"
                        append-icon="search"
                        label="Search Charges"
                        hide-details
                ></v-text-field>
            </v-card-title>

            <v-card-text>

                <collabmed-loading v-if="!initialised"></collabmed-loading>

                <div v-else>
                    <v-data-table
                            :headers="headers.charges"
                            :items="data.daily_charges.daily_charges"
                            :search="search.charges"
                            :loading="saveLoader"
                            :expand="expand"
                            class="mb-3" flat hide-default-footer
                    >
                        <template v-slot:item.id="{ item }" class="td-id">
                            <v-tooltip bottom>
                                        <span slot="activator">
                                            <v-icon v-if="expanded" small color="red">arrow_upward</v-icon>
                                            <v-icon v-else small color="info">arrow_downward</v-icon>
                                        </span>
                                <span>Click to View Changes</span>
                            </v-tooltip>

                            <span class="text-right">#{{ item.id }}</span>
                        </template>
                        <template v-slot:item.name="{ item }">
                            <span v-if="item.charge && item.charge.type === 'recurring'">[RECURRING] </span>
                            {{ item.charge ? item.charge.name : item.charge_id }}
                        </template>
                        <template v-slot:item.actions="{ item }">
                            <v-btn v-if="item.invoice_id" dark small round color="green" :href="viewInvoice(item.invoice_id)" target="_blank">Invoiced</v-btn>

                            <div v-else>
                                <v-btn icon small color="primary" @click="updateCharge(item)">
                                    <v-icon small>edit</v-icon>
                                </v-btn>

                                <v-btn icon small dark color="red" @click="cancelCharge(item)">
                                    <v-icon small>clear</v-icon>
                                </v-btn>
                            </div>
                        </template>

                        <template v-slot:expanded-item="{ headers, item }">

                            <td :colspan="headers.length">
                                <charge-changes
                                        :item="item"
                                        :changes="getChargesheetChangesForCharge(item.id)"
                                ></charge-changes>
                            </td>

                        </template>

                    </v-data-table>
                </div>

            </v-card-text>
        </v-card>

        <!--wards-->
        <v-card class="mt-4">
            <v-card-title>
                <h2 class="title">Ward Charges</h2>
                <v-spacer></v-spacer>
                <v-text-field
                        v-model="search.wards"
                        append-icon="search"
                        label="Search Wards"
                        hide-details
                ></v-text-field>
            </v-card-title>

            <v-card-text>

                <collabmed-loading v-if="!initialised"></collabmed-loading>

                <div v-else>
                    <!-- wards -->
                    <v-data-table
                            :headers="headers.wards"
                            :items="data.wards.individuals"
                            :search="search.wards"
                            :loading="saveLoader"
                            :expand="expand"
                            class="mb-3" flat hide-default-footer
                    >
                        <template v-slot:item.id="{ item }" class="td-id">
                            <v-tooltip bottom>
                                        <span slot="activator">
                                            <v-icon v-if="expanded" small color="red">arrow_upward</v-icon>
                                            <v-icon v-else small color="info">arrow_downward</v-icon>
                                        </span>
                                <span>Click to View Changes</span>
                            </v-tooltip>

                            <span class="text-right">#{{ item.id }}</span>
                        </template>
                        <template v-slot:item.name="{ item }">
                            {{ item.ward ? item.ward.name : item.ward_id }}
                        </template>

                        <template v-slot:item.actions="{ item }">
                            <v-btn v-if="item.invoice_id" dark small round color="green" :href="viewInvoice(item.invoice_id)" target="_blank">Invoiced</v-btn>

                            <div v-else>
                                <v-btn icon small color="primary" @click="updateWard(item)">
                                    <v-icon small>edit</v-icon>
                                </v-btn>

                                <v-btn icon small dark color="red" @click="cancelWard(item)">
                                    <v-icon small>clear</v-icon>
                                </v-btn>
                            </div>
                        </template>

                        <template v-slot:expanded-item="{ headers, item }">
                            <td :colspan="headers.length">
                                <charge-changes
                                        :item="item"
                                        :changes="getChargesheetChangesForWard(item.id)"
                                ></charge-changes>
                            </td>
                        </template>

                    </v-data-table>

                    <!-- rebates -->
                    <div v-if="data.wards.rebates && data.wards.rebates.length > 0">
                        <v-data-table
                            :headers="headers.wards"
                            :items="data.wards.rebates"
                            :loading="saveLoader"
                            :expand="expand"
                            class="mb-3" flat hide-default-footer
                        >
                            <template v-slot:item.id="{ item }" class="td-id">
                                <v-tooltip bottom>
                                            <span slot="activator">
                                                <v-icon v-if="expanded" small color="red">arrow_upward</v-icon>
                                                <v-icon v-else small color="info">arrow_downward</v-icon>
                                            </span>
                                    <span>Click to View Changes</span>
                                </v-tooltip>

                                <span class="text-right">#{{ item.id }}</span>
                            </template>
                            <template v-slot:item.name="{ item }">Rebates</template>
                            <template v-slot:item.actions="{ item }">
                                <div>
                                    <v-btn icon small color="primary" @click="updateRebate(item)">
                                        <v-icon small>edit</v-icon>
                                    </v-btn>

                                    <v-btn icon small dark color="red" @click="cancelRebate(item)">
                                        <v-icon small>clear</v-icon>
                                    </v-btn>
                                </div>
                            </template>

                            <template v-slot:expanded-item="{ headers, item }">
                                <td :colspan="headers.length">
                                    <rebate-changes
                                            :item="item"
                                            :changes="getChargesheetChangesForRebate(item.id)"
                                    ></rebate-changes>
                                </td>
                            </template>

                        </v-data-table>
                    </div>

                </div>

            </v-card-text>
        </v-card>

        <!--prescriptions-->
        <v-card class="mt-4">
            <v-card-title>
                <h2 class="title">Prescriptions</h2>
                <v-spacer></v-spacer>
                <v-text-field
                        v-model="search.prescriptions"
                        append-icon="search"
                        label="Search Prescriptions"
                        hide-details
                ></v-text-field>
            </v-card-title>

            <v-card-text>

                <collabmed-loading v-if="!initialised"></collabmed-loading>

                <div v-else>
                    <v-data-table
                            :headers="headers.prescriptions"
                            :items="data.prescriptions.prescriptions"
                            :search="search.prescriptions"
                            :loading="saveLoader"
                            class="mb-3" flat hide-default-footer
                    >
                        <template v-slot:item.id="{ item }">{{ item.id }}</template>
                        <template v-slot:item.quantity="{ item }">
                                <span v-if="item.for_discharge && !item.dispensed">
                                   <input
                                           type="number"
                                           style="border: 1px solid black"
                                           v-model="item.updated_quantity"
                                           @change="obj.updatePrescription(item)"
                                           :max="item.dispensed | numberFormatInt"
                                   />
                                </span>
                            <span v-else>{{ item.prescribed | numberFormatInt }}</span>
                        </template>
                        <template v-slot:item.actions="{ item }">
                            <span>-</span>
                        </template>
                    </v-data-table>
                </div>

            </v-card-text>


            <v-btn small color="primary" @click="processInpatientBill()">Process the bill</v-btn>
        </v-card>

        <!--modal update-->
        <v-dialog v-model="dialog" width="500" persistent>
            <v-card v-if="obj.item.name">
                <v-card-title class="headline" primary-title>
                    {{ obj.item.name }}
                    <small class="grey--text ml-2">#{{ obj.item.id }}</small>
                    <v-spacer></v-spacer>

                    <v-btn icon dark @click.native="close" absolute right>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <v-text-field
                            label="Price"
                            v-model="obj.item.new_price"
                            type="number"
                            min="0"
                            :step="0.01"
                            :error="errors.has('item.new_price')"
                            outline required
                            :hint="errors.get('item.new_price')" persistent-hint
                            :expand="expand"
                            @keyup="errors.clear('item.new_price')">
                    </v-text-field>

                    <br/>
                    <v-text-field
                            label="Quantity"
                            v-model="obj.item.new_quantity"
                            type="number"
                            min="0"
                            :error="errors.has('item.new_quantity')"
                            outline required
                            :hint="errors.get('item.new_quantity')" persistent-hint
                            @keyup="errors.clear('item.new_quantity')">
                    </v-text-field>

                    <br/>
                    <v-text-field
                            label="Discount"
                            v-model="obj.item.new_discount"
                            type="number"
                            min="0"
                            :step="0.01"
                            :error="errors.has('item.new_discount')"
                            outline required
                            :hint="errors.get('item.new_discount')" persistent-hint
                            @keyup="errors.clear('item.new_discount')">
                    </v-text-field>

                    <br/>
                    <v-text-field
                            label="Amount"
                            v-model="obj.item.new_amount"
                            type="number"
                            min="0"
                            :disabled="true"
                            :step="0.01"
                            :error="errors.has('item.new_amount')"
                            outline required
                            :hint="errors.get('item.new_amount')" persistent-hint
                            @keyup="errors.clear('item.new_amount')">
                    </v-text-field>

                    <v-textarea label="Notes"
                                v-model="obj.item.notes" outline class="mr-3"
                                :error="errors.has('item.reason')"
                                :hint="errors.get('item.reason')" persistent-hint
                                @change="errors.clear('item.reason')"
                    ></v-textarea>

                    <v-alert :value="true" type="error" outline v-if="errors.any()">
                        <div v-html="errors.display()"></div>
                    </v-alert>

                </v-card-text>

                <v-card-actions>
                    <v-btn flat color="warning" @click="close" :loading="saveLoader">Close</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="blue" dark @click="save()" :loading="saveLoader">Save</v-btn>
                </v-card-actions>
            </v-card>

            <v-alert v-else :value="true" type="error">
                None selected
            </v-alert>
        </v-dialog>

        <!--modal cancel-->
        <v-dialog v-model="dialogCancel" width="400" persistent>
            <v-card v-if="obj.item.name">
                <v-card-title class="headline red white--text" primary-title>
                    {{ obj.item.name }}
                    <small class="grey--text ml-2">#{{ obj.item.id }}</small>
                    <v-spacer></v-spacer>

                    <v-btn icon dark @click.native="close" absolute right>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <h4 class="title">Are you sure you want to proceed with the cancellation?</h4>
                    <v-textarea label="Please provide a reason for the cancellation"
                                v-model="obj.item.notes" outline class="mr-3"
                                :error="errors.has('item.reason')"
                                :hint="errors.get('item.reason')" persistent-hint
                                @change="errors.clear('item.reason')"
                    ></v-textarea>
                </v-card-text>

                <v-card-actions>
                    <v-btn flat color="green" @click="close" :loading="saveLoader">Close</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="warning" dark @click="saveCancel()" :loading="saveLoader">Yes, Proceed</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>


        <!--modal rebates-->
        <v-dialog v-model="dialogRebate" width="500" persistent>
            <v-card>
                <v-card-title class="headline purple lighten-2 white--text" primary-title>
                    Add a Rebate to ChargeSheet
                    <small class="grey--text ml-2">#{{ obj.item.id }}</small>
                    <v-spacer></v-spacer>

                    <v-btn icon dark @click.native="close" absolute right>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <v-autocomplete
                            label="Select a Rebate"
                            v-model="obj.rebateItem.rebate_id"
                            :error="errors.has('rebate_id')"
                            outline required
                            :items="rebates"
                            item-text="name"
                            item-value="id"
                            :disabled="! rebates"
                            :hint="errors.get('rebate_id')" persistent-hint
                            :expand="expand"
                            @keyup="errors.clear('rebate_id')"
                            >
                    </v-autocomplete>


                    <v-text-field
                            label="Quantity(Days)"
                            v-model="obj.rebateItem.quantity"
                            type="number"
                            min="1"
                            :error="errors.has('quantity')"
                            outline required
                            :hint="errors.get('quantity')" persistent-hint
                            :expand="expand"
                            @keyup="errors.clear('quantity')">
                    </v-text-field>
                </v-card-text>

                <v-card-actions>
                    <v-btn flat color="green" @click="close" :loading="saveLoader">Close</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" dark @click="saveVisitRebate()" :loading="saveLoader">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </div>
</template>

<script>
import  { mapActions, mapGetters } from "vuex";

import Chargesheet from "@inpatient/libs/chargesheet/Chargesheet";
import InvestigationChanges from "./partials/InvestigationChanges";
import ConsumableChanges from "./partials/ConsumableChanges";
import ChargeChanges from "./partials/ChargeChanges";
import RebateChanges from "./partials/RebateChanges";
import { consumableChangeMixin } from "@inpatient/libs/chargesheet/consumableChangeMixin";
import { investigationChangeMixin } from "@inpatient/libs/chargesheet/investigationChangeMixin";
import { chargeChangeMixin } from "@inpatient/libs/chargesheet/chargeChangeMixin";
import { wardChangeMixin } from "@inpatient/libs/chargesheet/wardChangeMixin";

export default {
    props: {
        visitId: {
            required: true,
        },
    },

    components: {
        InvestigationChanges,
        ConsumableChanges,
        ChargeChanges,
        RebateChanges,
    },

    mixins: [
        consumableChangeMixin,
        investigationChangeMixin,
        chargeChangeMixin,
        wardChangeMixin,
    ],

    data() {
        return {
            obj: new Chargesheet,
            expand: false,
            saveLoader: false,
            dialog: false,
            dialogCancel: false,
            dialogRebate: false,
            rebates: null,
            search: {
                procedures: "",
                investigations: "",
                prescriptions: "",
                consumables: "",
                charges: "",
                wards: "",
            },
            headers: {
                procedures: [
                    { text: "#", value: "id" },
                    { text: "Name", value: "name" },
                    { text: "Type", value: "type" },
                    { text: "Price", value: "price", align: "right" },
                    { text: "Qty.", value: "quantity", align: "right" },
                    { text: "Discount", value: "discount", align: "right" },
                    { text: "Amount", value: "amount", align: "right" },
                    { text: "Added on", value: "created_at" },
                    { text: "Action", value: "actions" },
                ],

                investigations: [
                    { text: "#", value: "id" },
                    { text: "Name", value: "name" },
                    { text: "Type", value: "type" },
                    { text: "Price", value: "price", align: "right" },
                    { text: "Qty.", value: "quantity", align: "right" },
                    { text: "Discount", value: "discount", align: "right" },
                    { text: "Amount", value: "amount", align: "right" },
                    { text: "Added on", value: "created_at" },
                    { text: "Action", value: "actions" },
                ],

                consumables: [
                    { text: "#", value: "id" },
                    { text: "Name", value: "name" },
                    { text: "Type", value: "consumable_type_name" },
                    { text: "Price", value: "price", align: "right" },
                    { text: "Q", value: "quantity", align: "right" },
                    { text: "Discount", value: "discount", align: "right" },
                    { text: "Amount", value: "amount", align: "right" },
                    { text: "Date", value: "created_at" },
                    { text: "Action", value: "actions" },
                ],

                charges: [
                    { text: "#", value: "id" },
                    { text: "Name", value: "name" },
                    { text: "Price", value: "price", align: "right" },
                    { text: "Q", value: "quantity", align: "right" },
                    { text: "Discount", value: "discount", align: "right" },
                    { text: "Amount", value: "amount", align: "right" },
                    { text: "Date", value: "created_at" },
                    { text: "Action", value: "actions" },
                ],

                wards: [
                    { text: "#", value: "id" },
                    { text: "Name", value: "name" },
                    { text: "Price", value: "price", align: "right" },
                    { text: "Days", value: "quantity", align: "right" },
                    { text: "Amount", value: "amount", align: "right" },
                    { text: "Created At", value: "created_at" },
                    { text: "Action", value: "actions" },
                ],

                prescriptions: [
                    { text: "#", value: "id" },
                    { text: "Name", value: "drug" },
                    { text: "Quantity", value: "quantity", align: "left" },
                    { text: "Dispensed", value: "dispensed", align: "right" },
                    { text: "Administered", value: "administered", align: "right" },
                    { text: "Price", value: "price", align: "right" },
                    { text: "Discount", value: "discount", align: "right" },
                    { text: "Amount", value: "total", align: "right" },
                    { text: "Added on", value: "created_at" },
                    { text: "Action", value: "actions" },
                ],
            },
        };
    },

    computed: {
        ...mapGetters([
            "getRebates",
        ]),

        submitted() {
            return this.obj.form.submitted;
        },

        saved() {
            return this.obj.saved;
        },

        data() {
            return this.obj.chargesheetData;
        },

        chargesheetChanges() {
            return this.data.chargesheet_changes;
        },

        initialised() {
            return this.data;
        },

        errors() {
            return this.obj.form.errors;
        },

        contaminated() {
            return this.obj.form.errorDetected;
        },

        selected() {
            return this.obj.item;
        },

        selectedPrice() {
            return this.obj.item.new_price;
        },

        selectedDiscount() {
            return this.obj.item.new_discount;
        },

        selectedQuantity() {
            return this.obj.item.new_quantity;
        },
    },

    watch: {
        submitted(val) {
            if (val) {
                this.saveLoader = false;
                this.close();
                this.obj.form.submitted = false;
            }
        },

        saved(val) {
            if (val) {
                this.saveLoader = false;
                this.close();
                this.initialise();
                this.obj.saved = false;
            }
        },

        contaminated() {
            this.saveLoader = false;
            this.obj.form.submitted = false;
            this.obj.form.errorDetected = false;
        },

        selectedPrice(val) {
            this.calc();
        },

        selectedQuantity(val) {
            this.calc();
        },

        selectedDiscount(val) {
            this.calc();
        },

        getRebates(val) {
            if (val) {
                this.rebates = _.map(val.data, (item) => {
                    let name = "Kshs. " + item.amount + " : ";

                    item.scheme ? name += item.scheme.full_name : null;
                    item.facility ? name += "  Facility:" + item.facility.name : null;

                    return {
                        name: name,
                        id: item.id,
                    };
                });
            }
        },

    },

    methods: {
        ...mapActions([
            "setRebates",
        ]),

        initialise() {
            this.saveLoader = true;
            this.obj.get(parseInt(this.visitId));
        },

        printChargeSheet() {
            window.open("/inpatient/discharge-requests/visit/" + this.visitId + "/print/chargesheet", "_blank");
        },

        calc() {
            this.obj.item.new_amount = (this.obj.item.new_price * this.obj.item.new_quantity) - this.obj.item.new_discount;
        },

        close() {
            this.dialog = false;
            this.dialogCancel = false;
            this.dialogRebate = false;
            this.obj.reset();
        },

        update(item) {
            this.obj.item.id = item.id;
            this.obj.item.new_price = this.obj.item.old_price = item.price;
            this.obj.item.new_quantity = this.obj.item.old_quantity = item.quantity;
            this.obj.item.new_discount = this.obj.item.old_discount = item.discount;
            this.obj.item.new_amount = this.obj.item.old_amount = item.amount;

            this.dialog = true;
        },

        cancel(item) {
            this.obj.item.id = item.id;
            this.obj.item.new_price = this.obj.item.old_price = item.price;
            this.obj.item.new_quantity = this.obj.item.old_quantity = item.quantity;
            this.obj.item.new_discount = this.obj.item.old_discount = item.discount;
            this.obj.item.new_amount = this.obj.item.old_amount = item.amount;

            this.dialogCancel = true;
        },

        save() {
            this.saveLoader = true;
            this.obj.update();
        },

        saveCancel() {
            this.saveLoader = true;
            this.obj.cancel();
        },

        viewInvoice(invoideId) {
            return route("finance.view_invoice_bill", invoideId).relative();
        },

        addVisitRebate() {
            this.setRebates();

            this.dialogRebate = true;
        },

        saveVisitRebate() {
            this.saveLoader = true;
            this.obj.addVisitRebate();
        },

        processInpatientBill() {
            window.open(`/finance/split-bill/${this.visitId}`, "_self");
        },

        printDailyChargeSheet(grouped = 0) {
            if (grouped) {
                window.open(`/inpatient/discharge-requests/visit/${this.visitId}/print/daily-chargesheet?group_data=1`);
            } else {
                window.open(`/inpatient/discharge-requests/visit/${this.visitId}/print/daily-chargesheet`);
            }
        },
    },

    mounted() {
        this.initialise();
    },
};
</script>

<style scoped lang="scss">
    .pointer {
        cursor: pointer;
    }
    .td-id {
        min-width: 100px;
    }
</style>
