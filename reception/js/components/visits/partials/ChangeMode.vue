<template>
    <div v-if="!visit"></div>
    <div v-else>
        <v-row justify="center">
            <v-dialog v-model="dialog" persistent max-width="500">
                <v-card>
                    <v-card-title class="subheading">
                        Change payment mode
                        <v-spacer></v-spacer>
                        <v-btn text icon color="red" small @click="dialog = false">
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-card-title>

                    <v-divider class="ma-0 pa-0"></v-divider>

                    <v-card-text>
                        <v-row >
                            <v-col cols="12">
                                <v-radio-group v-model="mode" row>
                                    <v-radio label="Cash" value="cash"></v-radio>
                                    <v-radio label="Insurance" value="insurance"></v-radio>
                                </v-radio-group>
                            </v-col>

                            <v-col cols="12" v-if="mode === 'insurance'">
                                <v-select label="select Insurance Schemes" v-model="scheme_id"
                                          :items="schemes" item-text="scheme_name" item-value="id" outline>
                                </v-select>
                            </v-col>
                        </v-row>
                    </v-card-text>

                    <v-card-actions>
                        <v-btn class="mb-2" color="blue" large block
                               :dark="!loader" :loading="loader" :disabled="loader"
                               @click="swapPaymentMode()">
                            Change payment mode
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
    </div>
</template>
<script>
import Visit from '@reception/libs/visits/Visit';

export default {
    props: [
        'visit', 'dialogState',
    ],

    data: () => ({
        dialog: false,
        loader: false,
        patientVisit: new Visit(),
        schemes: [],
        mode: null,
        scheme_id: null,
    }),

    watch: {
        visit(val) {
            this.dialog = true;
            this.mode = val.payment_mode;
            this.schemes = val.patient.schemes;
            this.scheme_id = val.scheme_id;
        },

        dialogState() {
            this.dialog = true;
        },
    },

    methods: {
        swapPaymentMode() {
            const data = {
                visit_id: this.visit.id,
                mode: this.mode,
                scheme_id: this.scheme_id,
            };

            this.patientVisit.changeMode(data);

            this.dialog = false;
        },
    },
};
</script>
