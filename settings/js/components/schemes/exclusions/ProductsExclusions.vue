<template>
    <v-card flat>
        <collabmed-loading v-if="!products"></collabmed-loading>

        <v-card-text v-else>
            <v-card-title>
                <v-row  class="pr-3">
                    <v-col cols="12" md="9">
                        <h2 class="body-2 ma-0 pa-0 grey--text">
                            <span class="px-2">Excluding means, that the scheme does not pay for this product, unless authorization approved</span> <br/>
                            <span class="px-2">You can also change the price from the default insurance price to pick the scheme pricing manually or upload a pre-formatted excel</span> <br/>
                            <v-btn small color="primary" @click="uploadExcelDialog = true">Upload excel</v-btn>
                        </h2>
                    </v-col>

                    <v-col></v-col>

                    <v-col cols="12" md="3">
                        <v-text-field prepend-inner-icon="search"
                                      placeholder="Search product"
                                      v-model="search"
                                      outline hide-details flat solo>
                        </v-text-field>
                    </v-col>
                </v-row>
            </v-card-title>


            <v-data-table
                    :headers="headers" :items="products.data"
                    class="mb-3" flat hide-default-footer
            >
                <template v-slot:item.default_charges="{ item }">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-chip class="font-weight-bold"
                                    label dark small
                                    color="green"
                                    width="30"
                                    v-on="on"
                            >
                                {{ props.item.main_store_cash }}
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
                                {{ props.item.main_store_insurance }}
                            </v-chip>
                        </template>
                        <span>Insurance Charge</span>
                    </v-tooltip>
                </template>
                <template v-slot:item.scheme_price="{ item }">
                    <input type="number" v-model="props.item.scheme_price" @change="updateExclusionAndPricing(props.item, 1, null)">
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-tooltip bottom v-if="!props.item.product_excluded">
                        <template v-slot:activator="{ on }">
                            <v-btn small  v-on="on" class="white--text"
                                   color="warning"
                                   @click="updateExclusionAndPricing(props.item, 0, 1)">
                                Exclude
                            </v-btn>
                        </template>
                        <span>Procedure not covered</span>
                    </v-tooltip>
                    <v-tooltip bottom v-else>
                        <template v-slot:activator="{ on }">
                            <v-btn small  v-on="on" class="white--text"
                                   color="primary"
                                   @click="updateExclusionAndPricing(props.item, 0, 0)">
                                Include
                            </v-btn>
                        </template>
                        <span>Mark procedure as covered</span>
                    </v-tooltip>
                </template>
            </v-data-table>

            <collabmed-paginator v-if="products.meta" :meta="products.meta" @change="navigate" />
        </v-card-text>

        <v-dialog v-model="uploadExcelDialog" persistent max-width="800" >
            <v-card>
                <v-card-title class="headline primary">
                    <h4 class="font-weight-bold">Excel upload</h4>
                    <v-btn icon light @click.native="closeDialog()" absolute right>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <upload-excel-product-exclusion-list :scheme="insuranceSchemeId" @uploadingExcel="closeDialog"></upload-excel-product-exclusion-list>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-card>
</template>
<script>
import Scheme from "@settings/libs/schemes/Scheme";
import { mapGetters, mapActions } from "vuex";
import UploadExcelProductExclusionList from "@settings/components/schemes/partials/UploadExcelProductExclusionList";

export default {
    props: [
        "schemeData",
        "insuranceSchemeId",
    ],

    components: {
        UploadExcelProductExclusionList,
    },

    data: () => ({
        uploadExcelDialog: false,
        search: null,
        schemeObj: new Scheme(),
        page: 1,
        params: {
            scheme_id: this.insuranceSchemeId,
        },
        headers: [
            { text: "Product", value: "name" },
            { text: "Category", value: "category_name" },
            { text: "Facility", value: "facility_name" },
            { text: "Default charges", value: "default_charges" },
            { text: "Scheme price", value: "scheme_price" },
            { text: "Actions", value: "actions" },
        ],
    }),

    methods: {
        ...mapActions([
            "setProducts",
        ]),

        searchProducts: _.debounce(function search(search) {
            this.setProducts({ search, params: {
                scheme_id: this.insuranceSchemeId,
            },
            });
        }, 1500),

        /*
           * the item,
           * price_update: whether we are just updating the price of the procedure on this scheme or not
           * exclusion_type: is it an exclusion (1) or an inclusion (0)
           * */
        updateExclusionAndPricing(item, price_update, exclusion_type) {
            const data = {
                product_id: item.id,
                scheme_id: this.scheme.id,
                price_update: price_update,
                price: item.scheme_price,
                excluded: exclusion_type,
            };

            this.schemeObj.recordExclusionAndPricing(data);

            this.initialise();
        },

        initialise() {
            this.params.scheme_id = this.insuranceSchemeId;

            if (this.params.scheme_id) {
                this.setProducts({
                    page: this.page,
                    params: this.params,
                });
            }
        },

        navigate(page) {
            this.page = page;

            this.setProducts({
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

    watch: {
        search(value) {
            if (!value) {
                this.setProducts({
                    page: 1,
                    params: this.params,
                });
                return;
            }

            if (value && value.length > 0) {
                this.searchProducts(value);
            }
        },
    },

    computed: {
        ...mapGetters({
            products: "getProducts",
        }),

        scheme() {
            if (this.schemeData) {
                return JSON.parse(this.schemeData);
            } else {
                return {};
            }
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
