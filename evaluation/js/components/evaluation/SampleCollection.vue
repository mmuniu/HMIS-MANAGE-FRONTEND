v<template>
    <div>
        <v-card flat v-if="visit_id">
            <v-container fluid class="mx-4">
                <v-row >
                    <v-col class="pr-2" cols="12" md="5">
                        <v-autocomplete
                                v-model="sample.investigations"
                                :items="patientInvestigations"
                                chips
                                label="Select Investigations"
                                item-text="procedure_name"
                                item-value="id"
                                multiple
                        >
                            <template v-slot:selection="data">
                                <v-chip
                                        :selected="data.selected"
                                        close
                                        class="chip--select-multi"
                                        @input="remove(data.item)"
                                >
                                    {{ data.item.procedure_name }}
                                </v-chip>
                            </template>
                        </v-autocomplete>
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
                    <v-col class="pr-4" cols="12" md="5" >
                        <v-text-field v-model="sample.other_details"
                                      label="Other details"></v-text-field>
                    </v-col>
                </v-row>
                <v-row >
                    <v-col class="pr-4" md="4" >
                        <v-btn small color="primary" @click="saveSample()">Save</v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>

        <br/>

        <v-card flat v-if="samples" class="mt-3 pb-2">

            <v-card-title v-if="covidSetupEnabled">
                <v-spacer/>
                <v-row>
                    <v-col md="2" class="mx-3">
                        <v-select
                                :items="['Positive', 'Negative']"
                                class="mr-5"
                                v-model="params.result"
                                solo flat outlined
                                clearable
                                @click:clear="clearFilters()"
                                hide-details
                        ></v-select>
                    </v-col>
                    <v-col md="2" class="mx-3">
                        <patient-search @patientSelected="patientSelected($event)"></patient-search>
                    </v-col>
                    <v-col md="2" class="mx-3">
                        <collabmed-date-time-picker outline @input="setStartDate" :datetime="params.start_date" label="Start date"></collabmed-date-time-picker>
                    </v-col>

                    <v-col md="2" class="mx-3">
                        <collabmed-date-time-picker outline @input="setEndDate" :datetime="params.end_date" label="End date" ></collabmed-date-time-picker>
                    </v-col>

                    <v-col md="2" class="mx-3">
                        <v-btn color="primary" class="px-2" @click="filterData()">filter</v-btn>
                        <download-to-excel :filters="params" :url="url" :filename="filename"></download-to-excel>
                    </v-col>
                </v-row>
            </v-card-title>

            <div class="flex">
                <v-icon small color="error" class="px-4">close</v-icon>  <span style="font-size: 13px">Results pending</span>
                <v-icon small color="success" class="px-4">check</v-icon> <span style="font-size: 13px">Has results</span>
            </div>

            <collabmed-loading v-if="!samples.data || loading"></collabmed-loading>

            <v-data-table
                    :headers="headers"
                    :items="samples.data"
                    item-key="id"
                    v-else
                    hide-default-footer
            >
                <template v-slot:item.id="{ item }">
                    <v-chip small color="primary"  class="white--text">{{ item.id }}</v-chip>
                </template>

                <template v-slot:item.procedures="{ item }">
                    <v-chip small v-for="(procedure, index) in item.procedures" :key="procedure + index">
                        {{ procedure.name }}
                        <v-icon small v-if="!procedure.has_results" color="error" class="px-4">close</v-icon>
                        <v-icon small v-else color="success" class="px-4">check</v-icon>
                    </v-chip>
                </template>

                <template v-slot:item.result="{ item }">
                    <div v-if="item.result">
                        <span v-if="item.result == 'Positive'" class="red px-3 py-1 white--text">{{ item.result }}</span>
                        <span v-if="item.result == 'Negative'" class="success px-3 py-1 white--text">{{ item.result }}</span>
                    </div>
                    <span v-else class="error--text">Pending</span>
                </template>

                <template v-slot:item.actions="{ item }">
                   <!-- <v-btn small class="green" icon @click="openSampleAddDialog(item)">
                        <v-icon small class="white&#45;&#45;text">add</v-icon>
                    </v-btn>-->

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }" >
                            <v-btn v-on="on" dark icon color="primary" small @click="printBarcode(item)">
                                <v-icon small>print</v-icon>
                            </v-btn>
                        </template>
                        <span>Print barcode</span>
                    </v-tooltip>
                   <!-- <v-btn small icon @click="trashSample(item.id)">
                        <v-icon small color="error">delete</v-icon>
                    </v-btn>-->

                    <v-menu transition="slide-y-transition" bottom v-if="msetting('core.okay_with_menu_actions') && covidSetupEnabled">
                        <template v-slot:activator="{ on }">
                            <v-btn  small color="primary" dark v-on="on">
                                actions <v-icon small>keyboard_arrow_down</v-icon>
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-item>
                                <contact-tracing v-if="covidSetupEnabled"
                                                 :name="item.patient_name"
                                                 :id="item.patient_id"
                                                 label="Contact tracing"></contact-tracing>
                            </v-list-item>
                            <v-list-item>
                                <v-btn small :disabled="!!item.queued" v-if=covidSetupEnabled"
                                       color="success" @click="queuePatientToLab(item.id, 0, 0)">
                                    {{ item.queued ? 'queued' : 'checkin to lab' }}
                                </v-btn>
                            </v-list-item>
                            <v-list-item  v-if="!item.queued && covidSetupEnabled">
                                <v-btn small :disabled="!!item.queued" color="info" @click="queuePatientToLab(item.id, 0, 1)">
                                    {{ item.queued ? 'queued' : 'Record results' }}
                                </v-btn>
                            </v-list-item>
                        </v-list>
                    </v-menu>

                    <span v-else>
                        <contact-tracing v-if="!item.tracing_initiated && covidSetupEnabled"
                                         :name="item.patient_name"
                                         :id="item.patient_id"
                                         label="Contact tracing">
                        </contact-tracing>

                        <v-btn small v-if="item.tracing_initiated && covidSetupEnabled"
                               @click="updateTrace(item.trace_id)"
                               class="warning white--text lighten-1">
                            Update trace
                        </v-btn>

                         <v-btn small v-if="!item.queued && covidSetupEnabled"
                                color="success"
                                @click="queuePatientToLab(item.id, 0, 0)">
                            {{ item.queued ? 'queued' : 'checkin to lab' }}
                        </v-btn>

                        <v-btn small v-if="!item.queued && covidSetupEnabled"
                               color="info"
                               @click="queuePatientToLab(item.id, 0, 1)">
                            {{ item.queued ? 'queued' : 'Record results' }}
                        </v-btn>
                    </span>

                    <v-menu transition="slide-y-transition" bottom v-if="covidSetupEnabled">
                        <template v-slot:activator="{ on }">
                            <v-btn small v-if="item.result === 'Positive'" class="purple white--text"  dark v-on="on">
                                Admit <v-icon small>keyboard_arrow_down</v-icon>
                            </v-btn>
                        </template>
                        <v-list style="background-color: #202227">
                            <v-list-item>
                                <v-btn small color="primary" @click="admitToHbc(item)">To Home based care</v-btn>
                            </v-list-item>
                            <v-list-item>
                                <v-btn small color="primary">To Facility</v-btn>
                            </v-list-item>
                        </v-list>
                    </v-menu>

                    <v-tooltip bottom v-if="covidSetupEnabled">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn small icon v-if="item.queued" @click="queuePatientToLab(item.id, 1, 0)"  v-on="on">
                                <v-icon small color="error">undo</v-icon>
                            </v-btn>
                        </template>
                        <span>Undo checkin</span>
                    </v-tooltip>
                </template>

                <template v-slot:footer>
                    <v-row :colspan="headers.length" class="px-6 py-3">
                        <v-col cols="2" v-if="visit_id">
                            <v-btn color="primary" @click="managePatient()">Manage Patient</v-btn>
                        </v-col>
                        <v-col cols="10" class="text-center">
                            <collabmed-paginator v-if="samples.meta" :meta="samples.meta" @change="navigate" ></collabmed-paginator>
                        </v-col>
                    </v-row>
                </template>
            </v-data-table>
        </v-card>


        <!-- add to sample dialog-->
        <v-dialog v-model="sample.add_to_sample_dialog" persistent max-width="800" >
            <v-card>
                <v-card-title class="headline primary">
                    <span class="white--text">Add to sample no: <v-chip small color="grey">{{ addingtoSampleNo }}</v-chip></span>
                    <v-btn icon dark @click.native="closeDialog()" absolute right>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <v-autocomplete
                            v-model="added_investigations"
                            :items="investigations.data"
                            chips
                            label="Select Investigations"
                            item-text="procedure_name"
                            item-value="id"
                            multiple
                    >
                        <template v-slot:selection="data">
                            <v-chip
                                    :selected="data.selected"
                                    close
                                    class="chip--select-multi"
                                    @input="remove(data.item)"
                            >
                                {{ data.item.procedure_name }}
                            </v-chip>
                        </template>
                    </v-autocomplete>
                </v-card-text>

                <v-card-actions>
                    <v-btn small color="primary" @click="addToSample()">save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- barcode dialog -->
        <v-dialog v-model="barcodeDialog" width="500">
            <v-card>

                <v-card-text class="text-center">
                    <barcode :value="barcodeData.id" format="code128" v-if="barcodeData" :options="{ lineColor: '#0275d8'}" tag="svg">
                        Unable to load barcode
                    </barcode>

                    <v-btn small color="primary" @click="barcodePrint(barcodeData)">print</v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>

    </div>
</template>
<script>
import { _ } from 'lodash';
import VueBarcode from 'vue-barcode';
import moment from 'moment';
import { mapGetters, mapActions } from 'vuex';
import Sample from '@evaluation/libs/sample_collection/SampleCollection';
import PatientSearch from '@reception/components/patients/PatientSearch.vue';
import ContactTracing from '@reception/components/contact-tracing/ContactTracing';

export default {
    props: [
        'visit_id', 'patient_id',
    ],

    components: {
        'barcode': VueBarcode,
        PatientSearch,
        ContactTracing,
    },

    data: () => ({
        sample: new Sample(),
        added_investigations: [],
        addingtoSampleNo: null,
        barcodeDialog: false,
        barcodeData: null,
        patientInvestigations: [],
        page: 1,
        loading: false,
        url: '/api/evaluation/samples',
        filename: 'sample collection report',
        params: {
            result: null,
            start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
            end_date: moment(new Date()).endOf('day').format("YYYY-MM-DD HH:MM"),
            type: 'laboratory',
            action: 'withoutResults',
        },
        headers: [
            { text: '#', value: 'id' },
            { text: 'Patient', value: 'patient_name' },
            { text: "Vtm No.", value: "vtm_no" },
            { text: 'sample Type', value: 'sample' },
            { text: 'Procedures', value: 'procedures' },
            // { text: "Method", value: "method" },
            { text: 'Result', value: 'result' },
            { text: 'Date', value: 'date' },
            { text: 'Actions', value: 'actions' },
        ],
    }),

    watch: {
        investigations(val) {
            if(val.data) {
                val.data.forEach((investigation) => {
                    if(!investigation.has_sample) {
                        this.patientInvestigations.push(investigation);
                    }
                })
            }
        },
    },

    computed: {
        ...mapGetters({
            investigations: 'getInvestigations',
            sampleTypes: 'getLabTestSampleTypes',
            samples: 'getSamples',
            methods: 'getCollectionMethods',
        }),

        covidSetupEnabled () {
            return this.msetting('core.enable_covid19_management');
        }
    },

    methods: {
        ...mapActions([
            'setInvestigations', 'setLabTestSampleTypes', 'setSamples',
            'setCollectionMethods',
        ]),

        setStartDate(datetime) {
            this.params.start_date = datetime;
        },

        setEndDate(datetime) {
            this.params.end_date = datetime;
        },

        remove(item) {
            const index = this.sample.investigations.indexOf(item.id);
            if (index >= 0) this.sample.investigations.splice(index, 1);
        },

        printBarcode(item) {
            this.barcodeDialog = true;
            this.barcodeData = item;
        },

        barcodePrint(barcodeData) {
            window.open(`/evaluation/sample-collection/${barcodeData.id}/print-barcode`, '_blank');
        },

        admitToHbc (sample) {
            window.open(`/evaluation/self-quarantine/create?p_id=${sample.patient_id}`, '_self');
        },

        closeDialog() {
            this.sample.add_to_sample_dialog = false;
        },

        openSampleAddDialog(item) {
            this.addingtoSampleNo = item.id;
            this.sample.add_to_sample_dialog = true;
        },

        async saveSample() {
            const response = await this.sample.save();

            if (response) {
                this.initialize();
            }
        },

        async addToSample() {
            if (this.added_investigations.length > 0) {
                const response = await this.sample.addToSample(this.addingtoSampleNo, this.added_investigations);

                if (response) {
                    this.initialize();

                    this.sample.add_to_sample_dialog = false;
                }
            } else {
                flash({
                    message: 'You\'ve not selected any procedure',
                    alert: 'warning',
                });
            }
        },

        async trashSample(sample_id) {
            const response = await this.sample.trashSample(sample_id);

            if (response) {
                this.initialize();
            }
        },

        patientSelected(patient) {
            this.params.patient_id = patient.id;
        },

        filterData() {
            this.page = 1;
            this.initialize();
        },

        navigate(page) {
            this.page = page;

            this.initialize();
        },

        fetchVisitSamples() {
            const parameters = this.params;

            if (!this.params.result) {
                delete parameters['result'];
            }

            this.setSamples({
                page: this.page,
                params: parameters,
            });
        },

        initialize() {
            this.params.visit_id = this.visit_id;
            this.fetchVisitSamples();
            if (this.visit_id) {
                this.setInvestigations({
                    params: {
                        visit_id: this.visit_id,
                        type: 'laboratory',
                        action: 'withoutResults',
                    },
                });
            }
        },

        async queuePatientToLab(sample_id, undo = false, record_results) {
            this.loading = true;

            const response = await this.sample.queuePatientToLab(sample_id, undo, record_results);

            if (response) {
                this.loading = false;

                this.fetchVisitSamples();
            }
        },

        managePatient() {
            window.open(`/evaluation/visit/${this.visit_id}/destination/laboratory/ordered-investigations`, '_self');
        },

        updateTrace (trace_id) {
            if(trace_id) {
                window.open(`/reception/contact-tracing/${trace_id}/manage`, '_self');
            } else {
                flash({
                    message: "unable to locate trace",
                    alert: "error"
                })
            }
        },
    },

    mounted() {
        this.sample.visit_id = this.visit_id;
        this.sample.patient_id = this.patient_id;
        this.setLabTestSampleTypes();
        this.setCollectionMethods();
        this.initialize();
    },
};
</script>
