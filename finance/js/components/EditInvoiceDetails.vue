<template>
    <v-dialog v-model="dialog" persistent max-width="900">
        <template v-slot:activator="{ on }">
            <v-btn dark v-on="on" icon small>
                <v-icon small color="primary">edit</v-icon>
            </v-btn>
        </template>
        <v-card>
            <v-card-title class="headline primary">
                <span class="white--text">Update invoice details</span>
                <v-btn icon dark @click.native="closeDialog()" absolute right>
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text>
                <v-row  >
                    <v-col class="px4" md="6">
                        <v-text-field
                                class="px-3"
                                outline flat
                                v-model="update_details.claim_no"
                                label="Claim Number"
                                persistent-hint>
                        </v-text-field>
                    </v-col>
                    <v-col class="px4" md="6">
                        <collabmed-date-time-picker outline class="px-3" dateOnly  @input="setInvoiceDate" :datetime="update_details.invoice_date" label="Effective date "></collabmed-date-time-picker>
                    </v-col>
                </v-row>

                <v-row >
                    <v-col cols="12">
                        <v-btn small color="success" @click="saveInvoiceDetails()">update</v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
import Invoice from '@finance/libs/invoices/Invoice';

export default {
    props: [
        'claim_no', 'invoice_date', 'company', 'scheme', 'patient', 'invoice_id',
    ],

    data: () => ({
        dialog: false,
        invoice: new Invoice(),
        update_details: {
            claim_no: null,
            invoice_date: '',
            invoice_id: null,
        },
    }),

    methods: {
        closeDialog() {
            this.dialog = false;
        },

        setInvoiceDate(date) {
            this.update_details.invoice_date = date;
        },

        saveInvoiceDetails() {
            this.invoice.updateInvoiceDetails(this.update_details);
        },
    },

    mounted() {
        this.update_details.claim_no = this.claim_no;
        this.update_details.invoice_date = this.invoice_date;
        this.update_details.invoice_id = this.invoice_id;
    },
};
</script>
