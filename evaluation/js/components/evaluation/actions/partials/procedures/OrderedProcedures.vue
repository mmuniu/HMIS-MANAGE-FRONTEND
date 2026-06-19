<template>
        <div class="my-4">
            <!-- Stop drug use -->
            <v-dialog
                    v-model="showDialog"
                    width="400"
            >
                <v-card>
                    <v-card-title
                            class="subheading"
                            primary-title
                    >
                        Cancel Investigation
                        <v-spacer></v-spacer>
                        <v-btn text icon small color="red" @click="showDialog = false">
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-card-title>

                    <v-divider class="my-0"></v-divider>

                    <v-card-text>
                        <v-row >
                            <v-col cols="12">
                                <p>Enter reason for cancelling Investigation</p>
                                <v-textarea outline rows="8"
                                            :hint="stop_error"
                                            v-model="procedure.stop_investigation_reason" required></v-textarea>
                            </v-col>
                        </v-row>
                    </v-card-text>

                    <v-divider class="my-0"></v-divider>

                    <v-card-actions>
                        <v-btn
                                color="error"
                                @click="removeOrderedProcedure()"
                                block large class="my-2"
                                :dark="!saveLoader" :loading="saveLoader" :disabled="saveLoader"
                        >
                            Cancel Investigation
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <!-- End of stop drug -->


            <!--<v-card-title class="subheading font-weight-bold">-->
                <!--List of Ordered Procedures-->
            <!--</v-card-title>-->

            <div>
                <collabmed-loading v-if="!getInvestigations.data"></collabmed-loading>
                <div v-else>
                    <v-data-table
                            text
                            :headers="headers"
                            disable-pagination
                            hide-default-footer
                            :items="getInvestigations.data.data"
                    >
                        <template v-slot:item.hash="{ item }" >
                            <v-checkbox
                                    v-model="selectedProcedures"
                                    :value="item"
                                    primary
                                    hide-details
                            ></v-checkbox>
                        </template>
                        <template v-slot:item.procedure_name="{ item }">
                            <span>{{ item.procedure_name }}</span> <br/>
                            <span v-if="item.requires_preauth && item.preauth_status" class="primary--text">{{ item.preauth_status }}</span>
                            <v-chip v-if="item.admission_id" small>inpatient</v-chip>
                        </template>

                        <template v-slot:item.date="{ item }">
                            {{ item.created_at }}
                            <br/>
                            <span class="grey--text text--darken-1" v-if="item.user" v-text="item.user.full_name"></span>
                        </template>

                        <template v-if="domain !== 'treatment'" v-slot:item.has_results="{ item }">
                            <div v-if="!item.cancelled">
                                <v-tooltip bottom v-if="item.has_results">
                                    <template v-slot:activator="{ on }" >
                                      <v-btn text icon v-on="on" @click="viewResults(item)" color="primary" dark>
                                          <v-icon>mail</v-icon>
                                            </v-btn>
                                    </template>
                                    <span>View Results</span>
                                </v-tooltip>

                                <v-tooltip bottom v-else>
                                    <template v-slot:activator="{ on }" >
                                        <v-icon v-on="on" color="red" dark>clear</v-icon>
                                    </template>
                                    <span>Pending</span>
                                </v-tooltip>
                            </div>
                            <div v-else>
                                <v-chip small color="grey">cancelled</v-chip>
                                <br/>
                                <span class="grey--text text--darken-1 caption" v-text="item.cancel_text"></span>
                            </div>
                        </template>

                        <template v-slot:item.action="{ item }">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }" >
                                    <v-btn text small icon v-on="on" color="primary" dark @click="editTestData(item)">
                                        <v-icon small>edit</v-icon>
                                    </v-btn>
                                </template>
                                <span>Edit test data (date)</span>
                            </v-tooltip>

                            <v-btn dark icon color="red" small v-if="deletable(item)" @click="showModal(item.id)">
                                <v-icon small>delete</v-icon>
                            </v-btn>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }" >
                                    <v-btn v-on="on" dark icon color="primary" small @click="printRequestForm(item.id)">
                                        <v-icon small>print</v-icon>
                                    </v-btn>
                                </template>
                                <span>Print request form</span>
                            </v-tooltip>
                        </template>
                        <template v-slot:footer>
                            <v-row>
                                <v-col class="text-center">
                                    <collabmed-paginator :meta="getInvestigations.meta" @change="navigate"></collabmed-paginator>
                                </v-col>
                            </v-row>
                        </template>
                    </v-data-table>


                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }" >
                            <v-btn v-on="on" dark color="primary" small @click="printRequestFormSelected()">
                                Print request form
                            </v-btn>
                        </template>
                        <span>Print request form for selected procedures</span>
                    </v-tooltip>


                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }" >
                            <v-btn v-on="on" dark color="primary" small @click="preAuthPrintout()">
                                Request pre-auth
                            </v-btn>
                        </template>
                        <span>Insurance pre-auth</span>
                    </v-tooltip>
                </div>
            </div>

            <!-- dialogue-->
            <results-modal v-if="dialog" :investigation="withResults" v-on:close="dialog = false"></results-modal>

            <!-- editing dialog -->
            <v-dialog v-model="editInvestigationModal" width="400" v-if="investigationBeingEdited">
                <v-card>
                    <v-card-title class="headline primary" primary-title>
                        <span class="font-weight-bold white--text">
                            {{ investigationBeingEdited.procedure_name | ucwords }}  -
                            <small>{{ investigation.type | ucwords}}</small>
                        </span>

                        <v-btn icon small dark @click.native="editInvestigationModal = false" absolute right>
                            <v-icon small>close</v-icon>
                        </v-btn>
                    </v-card-title>

                    <v-card-text>
                        <v-row>
                            <v-col>
                                <collabmed-date-time-picker outline
                                                            @input="updateDate"
                                                            :datetime="investigationBeingEdited.non_formatted_created_at"
                                                            label="update date">
                                </collabmed-date-time-picker>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-dialog>
        </div>
</template>

<script>
import Procedure from '@evaluation/libs/procedures/Procedure';
import Investigation from '@evaluation/libs/investigations/Investigation';
import ResultsModal from './ResultsModal';
import { mapActions, mapGetters } from 'vuex';

export default {
    components: {
        ResultsModal,
    },

    props: {
        domain: {
            default: 'treatment',
            type: String,
        },
        refreshOrderedList: Boolean,
        visit_identifier: {
            type: String || Number,
        },
    },

    data() {
        return {
            page: 1,

            totalVisible: 4,

            procedure: new Procedure(),

            investigation: new Investigation(),

            withResults: null,

            dialog: false,

            editInvestigationModal: false,

            saveLoader: false,

            showDialog: false,

            stop_error: null,

            investigationId: null,

            investigationBeingEdited: null,

            selectedProcedures: [],

            headers: [
                { text: '#', value: 'hash' },
                { text: 'Procedure name', value: 'procedure_name' },
                { text: 'Type', value: 'type' },
                { text: 'Price', value: 'price' },
                { text: 'Qty', value: 'quantity' },
                { text: 'Amount', value: 'amount' },
                { text: 'Reason', value: 'reasons' },
                { text: 'Date', value: 'date' },
                { text: 'Action', value: 'action' },
            ],

        };
    },

    computed: {
        ...mapGetters([
            'getInvestigations',
        ]),

        submitted() {
            return this.procedure.form.submitted;
        },
    },

    watch: {
        refreshOrderedList(value) {
            value === true ? this.setData() : false;
        },

        submitted(value) {
            if (value) {
                this.formLoader = false;
                this.procedure.form.submitted = false;
                this.investigationId = null;
                this.showDialog = false;
                this.procedure.stop_investigation_reason = null;
                this.saveLoader = false;
                this.setData();
            }
        },

        page() {
            this.setData();
        },
    },

    methods: {
        ...mapActions([
            'setInvestigations',
        ]),

        navigate(page) {
            this.page = page;
        },

        setData() {
            this.setInvestigations({
                params: {
                    page: this.page,
                    visit_id: this.$route.params.visitId ? this.$route.params.visitId : this.visit_identifier,
                    domain: this.domain,
                    paginate_results: true,
                },
            });
        },

        viewResults(investigation) {
            const url = `/evaluation/evaluation/show/${investigation.visit_id}/results`;
            window.open(url, '_blank'); // Opens in a new tab
        },

        /*
            * change specifics of a given procedure/ Investigation
            * */
        editTestData(investigation) {
            this.investigationBeingEdited = investigation;
            this.editInvestigationModal = true;
        },

        async updateDate(updatedDate) {
            const data = {
                adjusted_date: updatedDate,
                date_adjusted_from: this.investigationBeingEdited.non_formatted_created_at,
            };
// console.log(data);
            const response = await this.investigation.updateProcedureInfo(this.investigationBeingEdited.id, data);

            if (response) {
                this.editInvestigationModal = false;
                this.setData();
            }
        },

        deletable(investigation) {
            // cannot be deleted if it has results, or is paid for/invoiced
            return !(investigation.has_results || investigation.paid_for ||
                        investigation.cancelled ||
                    investigation.invoiced !== 0);
        },

        showModal(investigation_id) {
            this.investigationId = investigation_id;
            this.showDialog = true;
        },

        removeOrderedProcedure() {
            if (this.procedure.stop_investigation_reason) {
                this.saveLoader = true;
                this.procedure.destroyOrderedProcedure(this.investigationId);
            } else {
                this.stop_error = 'Reason is required';
            }
        },

        printRequestForm(investigation_id) {
            window.open(`/evaluation/investigations/${investigation_id}/print-request-form`, '_blank');
        },

        printRequestFormSelected() {
            let url = '?procedures=';

            _.each(this.selectedProcedures, function(procedure) {
                url += procedure.id + '-';
            });

            window.open(`/evaluation/investigations/request-form${url}`, '_blank');
        },

        preAuthPrintout() {
            let url = '?pre_auth=true&procedures=';

            _.each(this.selectedProcedures, function(procedure) {
                url += procedure.id + '-';
            });

            window.open(`/evaluation/investigations/request-form${url}`, '_blank');
        },
    },

    mounted() {
        this.setData();

        if (this.domain !== 'treatment') {
            this.headers.splice(7, 0, { text: 'Results', value: 'has_results' });
        }
    },
};
</script>
