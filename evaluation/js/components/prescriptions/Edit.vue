<template>
    <v-row justify="space-around">
        <v-col cols="auto">

            <v-dialog
                    transition="dialog-bottom-transition"
                    max-width="800"
                    v-model="dialog"
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-btn small
                            icon
                            v-bind="attrs"
                            v-on="on"
                    >
                        <v-icon small color="primary">edit</v-icon>
                    </v-btn>
                </template>
                <template v-slot:default="dialog">
                    <v-card>
                        <v-toolbar
                                color="primary"
                                dark
                        >
                            Edit prescription
                            <v-spacer/>

                            <span>{{ drugName }}</span>

                            <v-spacer/>

                            <v-btn small icon @click="dialog = false">
                                <v-icon small color="error">close</v-icon>
                            </v-btn>
                        </v-toolbar>

                        <v-card-text>
                            <v-row>
                                <v-col>
                                    <v-text-field label="units"
                                                  @input="updateChanges()"
                                                  v-model="pres.units"
                                    ></v-text-field>
                                </v-col>
                                <v-col>
                                    <v-text-field label="price"
                                                  @input="updateChanges()"
                                                  v-model="pres.price"
                                    ></v-text-field>
                                </v-col>
                                <v-col>
                                    <v-text-field label="Amount"
                                                  @input="updateChanges()"
                                                  v-model="pres.amount"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                        </v-card-text>

                        <v-card-actions class="justify-end">
                            <v-btn
                                    color="primary"
                                    @click="saveEdits()"
                            >save</v-btn>
                        </v-card-actions>
                    </v-card>
                </template>
            </v-dialog>
        </v-col>
    </v-row>
</template>
<script>
    import Prescription from '@evaluation/libs/notes/Prescription';

    export default {
        props: [
            'prescriptionId',
            'drugName',
            'price',
            'amount',
            'units'
        ],

        data () {
            return {
                dialog: false,
                prescriptionsObj: new Prescription(),
                pres: {
                    units: null,
                    price: null,
                    amount: null,
                }
            }
        },

        methods: {
            async saveEdits() {

                const resp = await this.prescriptionsObj.savePresPriceEdits(this.prescriptionId, this.pres);

                if(resp) {
                    this.dialog = false;
                    window.location.reload();
                }
            },

            updateChanges() {
                this.pres.amount = this.pres.price * this.pres.units;
            },

            init() {
                this.pres.units = parseFloat(this.units);
                this.pres.amount = parseFloat(this.amount);
                this.pres.price = parseFloat(this.price)
            }
        },

        created () {
            this.init();
        }
    }
</script>
