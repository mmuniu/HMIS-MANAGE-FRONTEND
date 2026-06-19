<template>
    <v-card class="mt-2" flat>
        <v-card-title>
            <h4 class="px-3">Previously Ordered Consumables</h4>
        </v-card-title>

        <v-card-text>
            <v-data-table
                    :headers="headers"
                    :items="consumables.data"
                    class="mb-3"
                    disable-pagination
                    hide-default-footer
            >
                <template v-slot:item.actions="{ item }">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-btn small icon v-on="on" color="primary" dark @click="updateConsumableDate(item)">
                                <v-icon small>edit</v-icon>
                            </v-btn>
                        </template>

                        <span>update dates</span>
                    </v-tooltip>

                    <v-btn color="blue" small dark @click="editConsumable(item)">
                        edit
                    </v-btn>
                    <v-btn color="error" small dark @click="cancelConsumable(item)">
                        cancel
                    </v-btn>
                </template>
            </v-data-table>

            <!-- pagination -->
            <collabmed-paginator :meta="consumables.meta" @change="navigate"></collabmed-paginator>
            <!-- edit consumable -->
            <v-dialog v-model="dialog" persistent max-width="800" >
                <v-card>
                    <v-card-title class="headline primary">
                        <span class="white--text"> Edit consumable</span>
                        <v-btn icon dark @click.native="closeDialog()" absolute right>
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-card-title>

                    <v-card-text>
                        <consumable-form :paymentMode="paymentMode" :visitId="visitId" :consumableData="consumableData"></consumable-form>
                    </v-card-text>
                </v-card>
            </v-dialog>


            <!-- cancel consumable -->
            <v-dialog v-model="cancel_dialog" persistent max-width="500" >
                <v-card>
                    <v-card-title class="headline primary">
                        <span class="white--text"> Cancel consumable</span>
                        <v-btn icon dark @click.native="closeCancelDialog()" absolute right>
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-card-title>

                    <v-card-text>
                        <v-row >
                            <v-col class="x12" >
                                <v-textarea
                                        class="px-3"
                                        outline
                                        label="Cancel Reason"
                                        v-model="cancel_reason"
                                        persistent-hint>
                                </v-textarea>
                            </v-col>
                        </v-row>

                        <v-row >
                            <v-col class="px-3" cols="12" >
                                <v-btn color="primary" @click="removeConsumable()">Save</v-btn>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-dialog>

            <!-- date update dialog -->
            <v-dialog v-model="consumableDateUpdateDialog" width="500" v-if="consumableData">
                <v-card>
                    <v-card-title class="headline primary" primary-title>
                        <span class="font-weight-bold white--text">{{ consumableData.consumable | ucwords }} </span>

                        <v-btn icon small dark @click.native="consumableDateUpdateDialog = false" absolute right>
                            <v-icon small>close</v-icon>
                        </v-btn>
                    </v-card-title>

                    <v-card-text>
                        <v-row>
                            <v-col>
                                <collabmed-date-time-picker outline @input="updateDate" :datetime="consumableData.non_formatted_created_at" label="update date"></collabmed-date-time-picker>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-card-text>
    </v-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import ConsumableForm from "./partials/ConsumableForm";
import Consumable from "@inpatient/libs/consumables/Consumables";

export default {
    props: [
        "visitId", "paymentMode",
    ],

    components: {
        ConsumableForm,
    },

    data: () => ({
        dialog: false,
        cancel_dialog: false,
        consumableDateUpdateDialog: false,
        cancel_reason: null,
        consumableData: null,
        cancelConsumableData: null,
        consumable: new Consumable(),
        headers: [
            { text: "Consumables", value: "name" },
            { text: "Price", value: "price" },
            { text: "Quantity", value: "quantity" },
            { text: "Discount (%)", value: "discount" },
            { text: "Amount", value: "amount" },
            { text: "Notes", value: "notes" },
            { text: "Date", value: "date" },
            { text: "Action", value: "actions" },
        ],
    }),

    computed: {
        ...mapGetters({
            consumables: "getConsumables",
        }),
    },

    methods: {
        ...mapActions([
            "setConsumables",
        ]),

        updateConsumableDate(item) {
            this.consumableData = item;
            this.consumableDateUpdateDialog = true;
        },

        async updateDate(updatedDate) {
            const data = {
                edit_system_timestamp: true,
                adjusted_date: updatedDate,
                date_adjusted_from: this.consumableData.non_formatted_created_at,
            };

            const response = await this.consumable.update(this.consumableData.id, data);

            if (response) {
                this.consumableDateUpdateDialog = false;
                this.initialize();
            }
        },

        editConsumable(item) {
            this.consumableData = item;
            this.dialog = true;
        },

        removeConsumable() {
            if (this.cancel_reason) {
                this.consumable.cancelConsumable(this.cancelConsumableData).then(() => {
                    this.setConsumables({
                        params: {
                            visit_id: this.visitId,
                        },
                    });
                    this.cancel_dialog = false;
                });
            } else {
                flash({
                    message: "Please provide a reason for the cancellation",
                    alert: "error",
                });
            }
        },

        cancelConsumable(item) {
            this.cancel_dialog = true;
            this.cancelConsumableData = item;
        },

        navigate(page) {
            this.setConsumables({
                page: page,
                params: {
                    visit_id: this.visitId,
                },
            });
        },

        closeDialog() {
            this.dialog = false;
            this.consumableData = null;
        },

        closeCancelDialog() {
            this.cancel_dialog = false;
            this.cancelConsumableData = null;
        },

        initialize() {
            this.setConsumables({
                params: {
                    visit_id: this.visitId,
                },
            });
        },
    },

    mounted() {
        this.initialize();
    },
};
</script>
