<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <div v-else>

        <v-card  class="uni-table filter">
            <v-card-title>
                <v-row  class="pr-3">
                    <v-col cols="12" md="3">
                        <v-btn color="blue" large dark :href="route('evaluation.procedures.create').relative()">
                            Add a price
                        </v-btn>
                    </v-col>

                    <v-col></v-col>

                    <v-col cols="12" md="3">
                        <v-text-field prepend-inner-icon="search"
                                      placeholder="Search for procedure"
                                      v-model="term"
                                      outlined hide-details flat solo>
                        </v-text-field>
                    </v-col>
                </v-row>
            </v-card-title>

            <v-card-text>
                <v-data-table
                        :headers="headers"
                        :items="procedures.data"
                        :loading="loading"
                        class="mb-3"
                        hide-default-footer
                >
                    <template v-slot:item.name="{ item }">
                       <!-- <v-btn icon small color="error"> &lt;!&ndash;v-if="msetting('evaluation.enable_procedures_delete')"&ndash;&gt;
                            <v-icon small color="white" @click="deleteProcedure(item.id)">delete</v-icon>
                        </v-btn>-->
                        <v-tooltip bottom v-if="item.active === 0">
                            <template v-slot:activator="{ on }">
                                <v-btn icon color="success" small dark v-on="on" @click="inactivateProcedure(item)">
                                    <v-icon>done</v-icon>
                                </v-btn>
                            </template>

                            <span>Activate procedure</span>
                        </v-tooltip>
                        <v-tooltip bottom v-else>
                            <template v-slot:activator="{ on }">
                                <v-btn icon color="warning" small dark v-on="on" @click="inactivateProcedure(item)">
                                    <v-icon>close</v-icon>
                                </v-btn>
                            </template>

                            <span>Inactivate procedure</span>
                        </v-tooltip>
                        <a :href="`/evaluation/procedures/${item.id}/edit`" class="grey--text text--darken-2 body-2">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn icon color="blue" small dark v-on="on">
                                        <v-icon>fa-edit</v-icon>
                                    </v-btn>
                                </template>

                                <span>Edit</span>
                            </v-tooltip>

                            {{ item.name }}
                        </a>
                    </template>

                    <template v-slot:item.facility_charges="{ item }">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-chip class="font-weight-bold"
                                        label dark small
                                        color="green"
                                        v-on="on"
                                        width="30"
                                >
                                    {{ item.cash_charge }}
                                </v-chip>
                            </template>

                            <span>Cash Charge</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-chip class="font-weight-bold"
                                        label dark small
                                        color="red"
                                        v-on="on"
                                >
                                    {{ item.insurance_charge }}
                                </v-chip>
                            </template>

                            <span>Insurance Charge</span>
                        </v-tooltip>
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <v-btn color="blue" small dark @click="viewPrices(item)">
                            View All Prices
                        </v-btn>

                        <v-btn color="green" small dark @click="updatePrices(item)">
                            Update Prices
                        </v-btn>

                        <v-btn
                                :href="`/evaluation/setup/procedures/templates/${item.id}`"
                                slot="activator"
                                color="purple"
                                class="white--text"
                                dark small>
                            template
                        </v-btn>
                    </template>
                </v-data-table>

                <v-container>
                    <v-row >
                        <v-col cols="12" class="text-center">
                            <v-pagination
                                    v-model="page"
                                    :length="procedures.meta.last_page"
                                    circle
                                    total-visible="8"
                            ></v-pagination>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </v-card>

        <!-- prices dialog-->
        <procedure-prices-dialog
                v-if="selected"
                :show="dialog"
                :item="selected"
                @close="close"
        ></procedure-prices-dialog>

    <!--    update prices dialog-->
      <!--  <procedure-prices-update-dialog
                v-if="selected"
                :show="dialogUpdate"
                :item="selected"
                :facilities="facilities"
                @close="close"
                @saved="saved()"
        ></procedure-prices-update-dialog>-->

    </div>

</template>

<script>
import _ from 'lodash';
import { mapGetters, mapActions } from 'vuex';
import Procedure from '@evaluation/libs/procedures/Procedure';
import ProcedurePricesDialog from './partials/ProcedurePricesDialog';
import ProcedurePricesUpdateDialog from './partials/ProcedurePricesUpdateDialog';

export default {
    name: 'evaluation-procedures-index',

    props: [
        'facilityId',
    ],

    components: {
        'procedure-prices-dialog': ProcedurePricesDialog,
        // 'procedure-prices-update-dialog': ProcedurePricesUpdateDialog,
    },

    data() {
        return {
            procedureInstance: new Procedure(),
            procedures: null,
            loading: false,
            dialog: false,
            dialogUpdate: false,
            selected: null,
            facilities: null,
            term: '',
            page: 1,
            headers: [
                { text: 'Name', value: 'name' },
                { text: 'Category', value: 'categoryObj.name' },
                { text: 'Code', value: 'code' },
                { text: 'Facility', value: 'facility' },
                { text: 'Facility charges', value: 'facility_charges' },
                { text: 'Actions', value: 'actions' },
            ],
        };
    },

    computed: {
        ...mapGetters([
            'getProcedures', 'getFacilities',
        ]),

        initialised() {
            return this.procedures;
        },
    },

    watch: {
        getProcedures(data) {
            this.procedures = data;
        },

        getFacilities(data) {
            this.facilities = data.facilities;
        },

        page(val) {
            this.setProcedures({
                page: val,
                params: {
                    // facility_id: this.facilityId,
                },
            });
        },

        term(value) {
            if ( value.length > 2) {
                this.search(value);
            }

            if (value.length === 0) {
                this.initialise();
            }
        },
    },

    methods: {
        ...mapActions([
            'setProcedures', 'setFacilities',
        ]),

        initialise() {
            this.setProcedures({
                page: 1,
                params: {
                    // facility_id: this.facilityId,
                },
            });

            !this.facilities ? this.setFacilities() : null;
        },

        async inactivateProcedure(procedure) {
            const response = await this.procedureInstance.inactivateProcedure(procedure);

            if (response) {
                this.initialise();

                flash(response);
            }
        },

        search: _.debounce(function(term) {
            this.loading = true;
            this.setProcedures({
                search: term,
                params: {
                    // facility_id: this.facilityId,
                },
            });
        }, 1000),

        viewPrices(item) {
            this.selected = item;
            this.dialog = true;
        },

        updatePrices(item) {
            window.open(`/evaluation/procedures/${item.id}/update/prices`, '_blank');
        },

        saved() {
            this.close();
            this.initialise();
        },

        deleteProcedure(procedure_id) {
            this.procedureInstance.disableProcedure(procedure_id);
            this.initialise();
        },

        close() {
            this.selected = null;
            this.dialog = false;
            this.dialogUpdate = false;
        },
    },

    mounted() {
        this.initialise();
    },

    created() {
        window.events.$on('STORE_SET_ACTION_LOADING', (val) => {
            this.loading = val;
        });
    },
};
</script>
