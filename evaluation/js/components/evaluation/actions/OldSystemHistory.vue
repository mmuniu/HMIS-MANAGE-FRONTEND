<template>
    <div>
        <collabmed-loading v-if="!oldData"></collabmed-loading>

        <div v-else>
            <v-card class="pt-4 pb-3 px-5">
                <v-card-title>
                    <v-spacer></v-spacer>
                    <v-btn small color="primary" @click="printOldSystemHistory()">print history</v-btn>
                </v-card-title>
                <v-row >
                    <v-col md="5">
                        <v-card-title>
                            <span style="font-weight: bold; font-size: 14px">Medications</span>
                        </v-card-title>
                        <v-data-table
                                :headers="medicationHeaders"
                                :items="oldData.medications"
                                hide-default-footer
                                class="elevation-1"
                        >
                        </v-data-table>
                    </v-col>


                    <v-col md="6" offset-md="1">
                        <v-card-title>
                            <span style="font-weight: bold; font-size: 14px">Immunizations</span>
                        </v-card-title>
                        <v-data-table
                                :headers="immunizationHeaders"
                                :items="oldData.immunizations"
                                hide-default-footer
                                class="elevation-1"
                        >
                        </v-data-table>
                    </v-col>
                </v-row>
            </v-card>

            <v-card class="mt-3">
                <v-card-title>
                    <span style="font-weight: bold; font-size: 14px">Treatment</span>
                    <v-spacer></v-spacer>
                    <v-text-field
                            v-model="search"
                            append-icon="search"
                            label="Search"
                            single-line
                            hide-details
                    ></v-text-field>
                </v-card-title>

                <v-data-table
                        :headers="notesHeaders"
                        :items="oldData.notes"
                        :search="search"
                        class="elevation-1"
                >
                </v-data-table>
            </v-card>
        </div>

    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    data: () => ({
        search: '',
        medicationHeaders: [
            { text: 'Medication', value: 'name' },
            { text: 'Dose', value: 'dose' },
            { text: 'Date', value: 'date' },
        ],
        immunizationHeaders: [
            { text: 'Immunization', value: 'name' },
            { text: 'Date given', value: 'date_given' },
            { text: 'Date meant to be given', value: 'date_meant' },
        ],
        notesHeaders: [
            { text: 'Ailment', value: 'ailment' },
            { text: 'Details', value: 'details' },
            { text: 'Complaints', value: 'complaints' },
            { text: 'Age Then', value: 'age_then' },
            { text: 'Date', value: 'date' },
        ],
    }),

    computed: {
        ...mapGetters({
            oldData: 'getOldSysData',
        }),
    },

    methods: {
        ...mapActions([
            'setOldSysData',
        ]),

        initialize() {
            this.setOldSysData({
                params: {
                    visit_id: this.$route.params.visitId,
                },
            });
        },

        printOldSystemHistory () {
            window.open(`/evaluation/print/old-system-history/visit/${this.$route.params.visitId}/history`, '_blank');
        }
    },

    mounted() {
        this.initialize();
    },

};
</script>
