<template>

    <v-dialog v-model="dialogRebate" width="500" persistent>

        <template v-slot:activator="{ on }">
            <v-btn color="purple lighten-2" small dark v-on="on">
                <v-icon>add</v-icon> Add Rebate
            </v-btn>
        </template>

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
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import Chargesheet from "@inpatient/libs/chargesheet/Chargesheet";

export default {

    props: [
        "visitId",
    ],

    data: () => ({
        dialogRebate: false,
        expand: false,
        saveLoader: false,
        obj: new Chargesheet,
        rebates: null,
    }),

    computed: {
        ...mapGetters([
            "getRebates",
        ]),

        errors() {
            return this.obj.form.errors;
        },

        contaminated() {
            return this.obj.form.errorDetected;
        },

        submitted() {
            return this.obj.form.submitted;
        },

        saved() {
            return this.obj.saved;
        },

    },

    watch: {
        contaminated() {
            this.saveLoader = false;
            this.obj.form.submitted = false;
            this.obj.form.errorDetected = false;
        },

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
                this.obj.saved = false;
            }
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

                this.obj.patientVisitId = this.visitId;
            }
        },
    },

    methods: {
        ...mapActions({
            fetchRebates: "setRebates",
        }),

        saveVisitRebate() {
            this.saveLoader = true;
            this.obj.addVisitRebate();
        },

        close() {
            this.dialogRebate = false;
            this.obj.reset();
        },
    },

    mounted() {
        this.fetchRebates();
    },

};
</script>
