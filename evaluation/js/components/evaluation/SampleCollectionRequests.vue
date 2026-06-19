<template>
    <v-card flat>

        <v-card-title>
            <div class="flex">
<!--                <span style="font-size: 13px">Results pending</span>-->
            </div>
            <v-spacer></v-spacer>
            <patient-search @patientSelected="patientSelected($event)"></patient-search>
            <v-btn color="primary" class="px-2" @click="filterData()">search</v-btn>
        </v-card-title>

        <collabmed-loading v-if="!samples.data"></collabmed-loading>

        <v-data-table
                :headers="headers"
                :items="samples.data"
                item-key="id"
                v-else
                hide-default-footer
        >
            <template v-slot:item.status="{ item }">
                <span v-if="item.status == 'Pending'" class="error--text"><v-icon small color="error" class="px-4">close</v-icon> Pending</span>
                <span v-if="item.status == 'Collected'" class="primary--text"> <v-icon small color="success" class="px-4">check</v-icon> Collected</span>
            </template>
            <template v-slot:item.actions="{ item }">
                <v-btn small :disabled="item.status == 'Collected'" color="primary" @click="showDialog(item)">record sample</v-btn>
                <v-btn small :disabled="item.status == 'Collected'" color="error" @click="cancelRequest(item)">cancel</v-btn>
            </template>
            <template v-slot:footer>
                <v-row class="px-6 py-3">
                    <v-col cols="10" class="text-center">
                        <collabmed-paginator v-if="samples.meta" :meta="samples.meta" @change="navigate" ></collabmed-paginator>
                    </v-col>
                </v-row>
            </template>
        </v-data-table>

        <v-dialog v-model="dialog" max-width="40%">
            <v-card flat>
                <v-card-title class="headline white--text primary">Record sample collection</v-card-title>

                <v-card-text>
                    <div class="mt-2">
                        <v-text-field label="Vtm no."
                                    placeholder="The viral transmission medium number"
                                    outlined
                                    v-model="sample.vtm_no">
                        </v-text-field>
                    </div>

                    <div class="mt-2">
                        <v-textarea label="Other details / comments"
                                    placeholder="optional"
                                    outlined
                                    v-model="sample.other_details">
                        </v-textarea>
                    </div>

                    <div class="mt-2">
                        <system-google-places outlined label="Collection point" v-model="sample.collection_point"></system-google-places>
                    </div>
                </v-card-text>

                <v-card-actions>
                    <v-btn color="primary darken-1"
                           @click="recordSample(0)">submit</v-btn>
                    <v-btn color="primary darken-4"
                           @click="recordSample(1)">
                        submit && Collect Sample
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="error darken-1" @click="dialog = false">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import PatientSearch from '@reception/components/patients/PatientSearch.vue';
import Sample from '@evaluation/libs/sample_collection/SampleCollection';

export default {
    data: () => ({
        page: 1,
        dialog: false,
        sample: new Sample(),
        params: {},
        selectedItem: null,
        headers: [
            { text: 'Patient', value: 'patient' },
            { text: 'Sample type', value: 'sample_type' },
            { text: 'Requested by', value: 'requested_by' },
            { text: 'Status', value: 'status' },
            { text: 'Date', value: 'date' },
            { text: 'Actions', value: 'actions' },
        ],
    }),

    components: {
        PatientSearch,
    },

    computed: {
        ...mapGetters({
            samples: 'getSampleCollectionRequests',
        }),
    },

    methods: {
        ...mapActions([
            'setSampleCollectionRequests',
        ]),

        showDialog(item) {
            this.selectedItem = item;
            this.dialog = true;
        },

        patientSelected(patient) {
            this.params.patient_id = patient.id;
        },

        navigate(page) {
            this.page = page;
            this.initialize();
        },

        async recordSample(and_checkin) {
            if (this.selectedItem) {
                const response = await this.sample.takeSample(this.selectedItem.id);

                if (response) {
                    this.dialog = false;

                    if(and_checkin) {
                        window.open(`/evaluation/sample-collection`, '_self')
                    } else {
                        this.initialize();
                    }
                }
            }
        },

        async cancelRequest (sample_request) {
            const response = await this.sample.cancelSampleCollectionRequest(sample_request.id);

            if(response) {
                flash(response);

                this.initialize();
            }
        },

        filterData() {
            this.initialize();
        },

        initialize() {
            this.setSampleCollectionRequests({
                page: this.page,
                params: this.params,
            });
        },
    },

    mounted() {
        this.initialize();
    },
};
</script>
