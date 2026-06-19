<template>
    <v-dialog v-model="dialog" persistent max-width="60%" >

        <template v-slot:activator="{ on }" v-if="!dialogState">
            <v-btn  v-on="on" small color="primary" dark>
                request sample
            </v-btn>
        </template>

        <v-card>
            <v-card-title class="headline primary">Request sample collection</v-card-title>

            <v-card-text class="py-4">
                <v-container fluid class="mx-4">
                    <v-row >
                        <v-col class="pr-2" cols="12" md="5" >
                            <procedure-search @results="procedureSelected"></procedure-search>
                        </v-col>
                        <v-col class="pr-2" cols="12" md="5" >
                            <v-autocomplete
                                    v-model="sample.sample_type"
                                    :items="sampleTypes.data"
                                    chips
                                    label="Sample type"
                                    item-text="name"
                                    item-value="id"
                            >
                            </v-autocomplete>
                        </v-col>
                        <v-col class="pr-2" cols="12" md="5" >
                            <v-autocomplete
                                    v-model="sample.collection_method"
                                    :items="methods.data"
                                    chips
                                    label="Collection method"
                                    item-text="name"
                                    item-value="id"
                            >
                            </v-autocomplete>
                        </v-col>
                        <v-col class="pr-2" cols="12" md="5" >
                            <v-autocomplete
                                    v-model="sample.request_type"
                                    placeholder="initial or repeat"
                                    hint="i.e. is it the first time or a repeat"
                                    :items="['Initial', 'Repeat']"
                                    label="Sample request type"
                            >
                            </v-autocomplete>
                        </v-col>
                        <v-col class="pr-2" cols="12" md="5" >
                            <v-autocomplete
                                    v-model="sample.tobe_contacted"
                                    :items="[{ text: 'Yes', value: 1}, { text: 'No', value: 0}]"
                                    label="To be contacted"
                                    item-text="text"
                                    item-value="value"
                            >
                            </v-autocomplete>
                        </v-col>
                        <v-col class="pr-4" cols="12" md="5" >
                            <v-text-field v-model="sample.other_details"
                                          label="Other details"></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>

            <v-card-actions>
                <v-btn color="primary darken-1"
                       @click="requestSample(0)">submit</v-btn>
                <v-btn color="success darken-4"
                       @click="requestSample(1)">
                    submit && Collect Sample
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn color="error darken-1" @click="dialog = false">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Sample from '@evaluation/libs/sample_collection/SampleCollection';
import ProcedureSearch from '@evaluation/components/procedures/ProcedureSearch';

export default {
    components: { ProcedureSearch },
    props: [
        'patient', 'dialogState'
    ],

    data: () => ({
        visit_id: null,
        patientInvestigations: [],
        dialog: false,
        sample: new Sample(),
    }),

    watch: {
        investigations(val) {
            this.patientInvestigations = _.filter(val.data, function(investigation) {
                return !investigation.has_sample;
            });
        },

        dialogState (val) {
            if(val) {
                this.dialog = true;
            } else {
                this.dialog = false;
            }
        },

        dialog () {
            if(!this.dialog) {
                this.$emit('closed');
            }
        }
    },

    computed: {
        ...mapGetters({
            investigations: 'getInvestigations',
            sampleTypes: 'getLabTestSampleTypes',
            methods: 'getCollectionMethods',
        }),
    },

    methods: {
        ...mapActions([
            'setInvestigations', 'setLabTestSampleTypes', 'setCollectionMethods',
        ]),

        procedureSelected(procedure) {
            this.sample.procedure = procedure.id;
        },

        async requestSample($collectSample) {
            const response = await this.sample.sampleRequestSample(this.patient);

            if (response) {
                this.dialog = false;

                if($collectSample) {
                    window.open(`/evaluation/requested-samples`, '_self');
                }

                this.$emit('requestSent');
            }
        },
    },

    mounted() {
        this.setLabTestSampleTypes();
        this.setCollectionMethods();
        if (this.visit_id) {
            this.setInvestigations({
                params: {
                    visit_id: this.visit_id,
                    type: 'laboratory',
                    action: 'withoutResults',
                },
            });
        }
        if(this.dialogState) {
            this.dialog = true;
        }
    },
};
</script>
