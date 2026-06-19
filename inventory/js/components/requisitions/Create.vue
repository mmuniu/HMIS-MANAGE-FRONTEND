<template>
    <v-card flat>

        <v-card-title class="pb-0 mb-0" v-if="!external">
            <v-btn @click="$router.go(-1)" color="primary" small>back</v-btn>
            <v-spacer></v-spacer>
            <v-row >
                <v-col md="10">
                    <v-autocomplete hide-details
                                    outline
                                    single-line
                                    clearable
                                    placeholder="Search and select to add a product"
                                    class="mb-4"
                                    required
                                    :items="products"
                                    item-text="name"
                                    v-model="requisition.product"
                                    hide-no-data
                                    return-object
                                    @change="selectItem()"
                                    :search-input.sync="term"
                                    :loading="loading"
                    >
                        <template slot="item" slot-scope="{ item }">
                            <v-list-tile-content>
                                <v-list-tile-title class="caption" v-text="item.name"></v-list-tile-title>
                            </v-list-tile-content>
                        </template>
                    </v-autocomplete>
                </v-col>
            </v-row>
        </v-card-title>

        <v-card-text class="table-form">
            <v-data-table :headers="headers"
                          :items="requisition.composition"
                          no-data-text="No products added yet"
                          hide-default-footer
            >
                <template v-slot:item.size="{ item }">
                    <v-text-field type="number"
                                  v-model="item.size"
                                  solo flat
                                  @keyup="calculateTotal(item)">
                    </v-text-field>
                </template>
                <template v-slot:item.quantity="{ item }">
                    <v-text-field type="number"
                                  v-model="item.quantity_requested"
                                  solo flat
                                  @keyup="calculateTotal(item)">
                    </v-text-field>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-btn icon class="pink--text" text>
                        <v-icon class="pink--text" small
                                @click="deleteItem(item)"
                        >
                            delete
                        </v-icon>
                    </v-btn>
                </template>

                <template slot="footer">
                    <v-row  class="mt-4">
                        <v-col cols="12" offset-md="8" md="4" class="text-right">
                            <v-btn class="blue"
                                   :dark="!formLoader"
                                   :loading="formLoader"
                                   :disabled="formLoader"
                                   @click="saveRequisition()">
                                confirm requisition
                            </v-btn>
                        </v-col>
                    </v-row>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Requisition from '@inventory/libs/requisitions/Requisition';
import _ from 'lodash';

export default {
    props: [
        'requestorId', 'adding', 'selectedProducts', 'external', 'storeId',
    ],

    data() {
        return {
            requisition: new Requisition(),
            mainStores: null,
            term: '',
            products: [],
            loading: false,
            formLoader: false,
            headers: [
                { text: 'Product name', value: 'name', sortable: false },
                { text: 'Package size', value: 'size', sortable: false },
                { text: 'Quantity', value: 'quantity', sortable: false },
                { text: 'Total', value: 'total', sortable: false },
                { text: 'Actions', value: 'actions', sortable: false },
            ],
        };
    },

    watch: {
        term(search) {
            if (search && search.length > 2 && this.requisition.product === null) {
                this.loading = true;
                this.searchProducts(search);
            }
        },

        getStores({ data }) {
            this.mainStores = data.filter((store) => store.can_order_from_suppliers);
        },

        getProducts({ data }) {
            this.loading = false;
            this.products = data;
        },

        contaminated() {
            this.formLoader = false;
        },

        submitted() {
            this.formLoader = false;
        },

        selectedProducts(val) {
            if (val) {
                this.selectSuppliedProducts(val);
            }
        },
    },

    computed: {
        ...mapGetters([
            'getStores', 'getProducts',
        ]),

        errors() {
            return this.requisition.form.errors;
        },

        submitted() {
            return this.requisition.form.submitted;
        },

        contaminated() {
            return this.requisition.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            'setStores', 'setProducts',
        ]),

        searchProducts: _.debounce(function search(search) {
            this.setProducts({ search });
        }, 700),

        selectItem(val = null) {
            const product = val ? val : this.requisition.product;

            if (!this.productExists(val)) {
                const item = {
                    'name': product.name,
                    'product_id': val ? val.product_id : product.id,
                    'quantity_requested': 1,
                    'size': 1,
                    'total': 1,
                };

                this.requisition.composition.unshift(item);

                this.products = [];
                this.requisition.product = null;
            }
        },

        productExists(product) {
            return this.requisition.composition.some(function(el) {
                return el.product_id === product.product_id;
            });
        },

        deleteItem(item) {
            const index = this.requisition.composition.indexOf(item);
            this.requisition.composition.splice(index, 1);
        },

        calculateTotal(item) {
            const index = this.requisition.composition.indexOf(item);

            if (this.requisition.composition[index].size && this.requisition.composition[index].quantity_requested) {
                this.requisition.composition[index].total = parseInt(this.requisition.composition[index].size) * parseInt(this.requisition.composition[index].quantity_requested);
            }
        },

        async saveRequisition() {
            if (this.requisition.composition.length === 0) {
                flash({
                    alert: 'info',
                    message: 'No products have been selected',
                });
                return;
            }

            this.formLoader = true;

            const response = await this.requisition.save();

            if (response) {
                window.open('/inventory/requisitions', '_self');

                this.$emit('orderPlaced');
            }
        },

        selectSuppliedProducts(val) {
            this.requisition.composition = [];

            for (let i = 0; i < val.length; i++) {
                this.selectItem(val[i]);
            }
        },

        initializePage() {
            this.requisition.requestor_id = this.requestorId ? JSON.parse(this.requestorId) : null;

            this.setStores();

            if (this.selectedProducts) {
                this.selectSuppliedProducts(this.selectedProducts);
            }
        },
    },

    created() {
        this.initializePage();
    },
};
</script>
