<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-row v-else>
        <!-- Enter Reasons -->
        <v-dialog v-model="reasonDialog" max-width="450" persistent>
            <v-card>
                <v-card-title>
                    <h2 class="subheading pa-0 ma-0">Enter reason for procedure</h2>
                    <v-spacer></v-spacer>
                    <v-btn flat icon color="red" small @click="reasonDialog = false">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-divider class="ma-0 pa-o"></v-divider>

                <v-card-text>
                    <v-textarea label="Reason for procedure" min="0" outline rows="7"></v-textarea>
                </v-card-text>

                <v-card-actions>
                    <v-col cols="12" class="px-2 pb-2">
                        <v-btn color="green" large block :dark="!saveReason" :loading="saveReason" :disabled="saveReason">Save investigation</v-btn>
                    </v-col>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- End of Reasons -->

        <v-col cols="12">
            <div class="mb-3">
                <v-col cols="7" class="pt-2">
                    <v-text-field flat single-line hide-details outline label="Search for a procedure ..." v-model="search"
                    ></v-text-field>
                </v-col>
            </div>

            <v-card flat>
                <v-data-table :headers="headers" :items="procedures" class="mb-3" flat hide-default-footer>
                    <template v-slot:item.price="{ item }">
                        <div class="slim-row">
                            <v-text-field type="number" :disabled="false" solo flat
                            ></v-text-field>
                        </div>
                    </template>

                    <template v-slot:item="{ item }">
                        <div class="slim-row no-border">
                            <v-text-field type="number" solo flat readonly :value="item.price"></v-text-field>
                        </div>
                    </template>
                </v-data-table>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Procedure from '@evaluation/libs/procedures/Procedure';

export default {
    data() {
        return {
            procedure: new Procedure(),
            selectedProcedure: null,
            reasonDialog: false,
            saveReason: false,
            search: '',
            headers: [
                { text: 'Procedure name', value: 'name' },
                { text: 'Quantity', value: 'quantity' },
                { text: 'Price', value: 'price' },
            ],
            cartHeaders: [
                { text: 'Procedure', value: 'procedure' },
                { text: 'Amount', value: 'amount' },
            ],
        };
    },

    computed: {
        ...mapGetters([
            'getProcedures',
        ]),

        initialised() {
            return this.getProcedures;
        },

        procedures() {
            return this.getProcedures.nursing;
        },
    },

    methods: {
        ...mapActions([
            'setProcedures',
        ]),

        selectProcedure(procedure) {
            this.reasonDialog = true;

            console.log(procedure);
            // this.procedure.addToCart(procedure);
        },
    },

    mounted() {
        this.setProcedures({
            params: {
                category: 'nursing',
            },
        });
    },
};
</script>

<style type="scss">
    .v-tabs__item {
        font-weight: 600;
    }

    a:hover, a:active, a:focus {
        color: #333;
    }

    table.v-table thead th{
        font-size: 15px;
    }

    .slim-row > .v-text-field.v-text-field--solo .v-input__control {
        min-height: 32px;
    }

    .slim-row > .v-input {
        font-size: 14px !important;
        height: 32px;
        width: 90px !important;
        border: 1px solid #ddd;
        color: #333 !important;
    }

    .slim-row.no-border > .v-input {
        border: none !important;

    }
</style>
