<template>
    <v-card flat>
        <collabmed-loading v-if="!procedures"></collabmed-loading>

        <v-card-text v-else>
            <v-card-title>
                <v-row  class="pr-3">
                    <v-col cols="12" md="9">
                        <h2 class="body-2 ma-0 pa-0 grey--text">
                            <span class="px-2">Excluding means, that the scheme does not pay for this procedure, unless authorization approved</span> <br/>
                            <span class="px-2">You can also change the price from the default insurance price to pick the scheme pricing</span> <br/>
                            <v-btn small color="primary" @click="uploadExcelDialog = true">Upload excel</v-btn>
                        </h2>
                    </v-col>

                    <v-col></v-col>

                    <v-col cols="12" md="3">
                        <v-text-field prepend-inner-icon="search"
                                      placeholder="Search for procedure"
                                      v-model="term"
                                      outline hide-details flat solo>
                        </v-text-field>
                    </v-col>
                </v-row>
            </v-card-title>

            <v-data-table
                    :headers="headers"
                    :items="procedures.data"
                    :loading="loading"
                    class="mb-3"
                    hide-default-footer
            >
                <template v-slot:item.hash="{ item }">
                    <v-checkbox
                            v-model="item.requires_preauth"
                            @change="requiresPreauth(item)"
                            primary
                            hide-details
                    ></v-checkbox>
                </template>
                <template v-slot:item.default_charges="{ item }" class="py-1">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-chip class="font-weight-bold"
                                    label dark small
                                    color="green"
                                    width="30"
                                    v-on="on"
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
                <template v-slot:item.scheme_price="{ item }">
                    <input type="number" v-model="item.scheme_price" @change="updateExclusionAndPricing(item, 1, null)">
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-tooltip bottom v-if="!item.service_excluded">
                        <template v-slot:activator="{ on }">
                            <v-btn small v-on="on" class="white--text"
                                   color="warning"
                                   @click="updateExclusionAndPricing(item, 0, 1)">
                                Exclude
                            </v-btn>
                        </template>
                        <span>Procedure not covered</span>
                    </v-tooltip>
                    <v-tooltip bottom v-else>
                        <template v-slot:activator="{ on }">
                            <v-btn small v-on="on" class="white--text"
                                   color="primary"
                                   @click="updateExclusionAndPricing(item, 0, 0)">
                                Include
                            </v-btn>
                        </template>
                        <span>Mark procedure as covered</span>
                    </v-tooltip>
                </template>
            </v-data-table>

            <collabmed-paginator v-if="procedures.meta" :meta="procedures.meta" @change="navigate" />

        </v-card-text>

        <v-dialog v-model="uploadExcelDialog" persistent max-width="1100" >
            <v-card>
                <v-card-title class="headline primary">
                    <h4 class="font-weight-bold">Excel upload</h4>
                    <v-btn icon light @click.native="closeDialog()" absolute right>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <upload-excel-exclusions :scheme="insuranceSchemeId" @uploadingExcel="closeDialog"></upload-excel-exclusions>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-card>
</template>
<script>
import Scheme from "@settings/libs/schemes/Scheme";
import { mapGetters, mapActions } from "vuex";
import UploadExcelExclusions from "@settings/components/schemes/partials/UploadExcelForExclusionsAndPricing";

export default {
    props: [
        "schemeData",
        "insuranceSchemeId",
    ],

    components: {
        UploadExcelExclusions,
    },

    data: () => ({
        loading: false,
        term: "",
        page: 1,
        uploadExcelDialog: false,
        params: {
            no_of_pages: 15,
        },
        schemeObj: new Scheme(),
        headers: [
            { text: "Requires pre-auth", value: "hash" },
            { text: "Name", value: "name" },
            { text: "Category", value: "categoryObj.name" },
            { text: "Facility", value: "facility" },
            { text: "Default charges", value: "default_charges" },
            { text: "Scheme price", value: "scheme_price" },
            { text: "Actions", value: "actions" },
        ],
    }),

    computed: {
        ...mapGetters({
            procedures: "getProcedures",
        }),

        scheme() {
            if (this.schemeData) {
                return JSON.parse(this.schemeData);
            } else {
                return {};
            }
        },
    },

    watch: {
        term(value) {
            if ( value.length > 2) {
                this.search(value);
            }

            if (value.length === 0) {
                this.initialise();
            }
        },

        insuranceSchemeId(val) {
            this.params.scheme_id = val;
        },
    },

    methods: {
        ...mapActions([
            "setProcedures",
        ]),

        async requiresPreauth(item) {
            const response = await this.schemeObj.requiresPreauth(this.scheme.id, "procedure", item);

            if(response) {
                this.initialise();
            }
        },

        /*
            * the item,
            * price_update: whether we are just updating the price of the procedure on this scheme or not
            * exclusion_type: is it an exclusion (1) or an inclusion (0)
            * */
        updateExclusionAndPricing(item, price_update, exclusion_type) {
            const data = {
                procedure_id: item.id,
                scheme_id: this.scheme.id,
                price_update: price_update,
                price: item.scheme_price,
                excluded: exclusion_type,
            };

            this.schemeObj.recordExclusionAndPricing(data);

            this.initialise();
        },

        search: _.debounce(function(term) {
            this.loading = true;
            const self = this;
            this.setProcedures({
                search: term,
                page: this.page,
                params: this.params,
            }).then((response) => {
                self.loading = false;
            });
        }, 1000),

        initialise() {
            this.params.scheme_id = this.insuranceSchemeId;

            if (this.params.scheme_id) {
                this.setProcedures({
                    page: this.page,
                    params: this.params,
                });
            }
        },

        navigate(page) {
            this.loading = true;

            const self = this;

            this.page = page;

            this.setProcedures({
                page: page,
                params: this.params,
            }).then((res) => {
                self.loading = false;
            });
        },

        closeDialog() {
            this.uploadExcelDialog = false;
        },
    },

    mounted() {
        this.initialise();
    },
};
</script>
<style scoped>
    input[type=number] {
        width: 100%;
        padding: 12px 20px;
        box-sizing: border-box;
        border: 1px solid #555;
        outline: none;
    }

    input[type=number]:focus {
        background-color: lightblue;
    }
</style>
