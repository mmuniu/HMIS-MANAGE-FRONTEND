<template>
    <v-row  v-if="initialised">
        <v-col cols="4">
            <v-card>
                <v-card-title class="blue white--text subheading">Request procedure form</v-card-title>

                <v-divider class="ma-0"></v-divider>

                <v-card-text>
                    <v-row >
                        <v-col cols="12">
                            <v-radio-group v-model="type" row>
                                <v-radio v-for="(category, index) in categories" :label="category.name" :value="category" :key="index"></v-radio>
                            </v-radio-group>
                        </v-col>

                        <v-col cols="12">
                            <v-autocomplete clearable hide-details solo flat return-object large prepend-inner-icon="search" single-line placeholder="Search for a procedure"
                                            :items="procedure.search.results" item-text="name"  item-value="id" v-model="cart.item" :disabled="!procedure.type"
                                            :loading="procedure.search.loading" :search-input.sync="procedure.search.term" outline
                            >
                                <template slot="item" slot-scope="{ item }">
                                    <v-list-item-avatar color="cyan" size="42" class="headline font-weight-light white--text">
                                        <span class="subheading">{{ item.name.substring(0, 2) }}</span>
                                    </v-list-item-avatar>
                                    <v-list-item-content>
                                        <v-list-item-title class="caption" v-text="item.name"></v-list-item-title>
                                        <!--<v-list-item-subtitle>{{ item.quantity }} in stock</v-list-item-subtitle>-->
                                    </v-list-item-content>
                                </template>
                            </v-autocomplete>
                        </v-col>
                    </v-row>

                    <v-divider></v-divider>

                    <v-row  v-if="cart.items.length > 0">
                        <v-col cols="12">
                            <v-text-field label="Quantity" v-model="cart.items[0].quantity" outline @keyup="cart.calculateItemTotal()"></v-text-field>
                        </v-col>

                        <v-col cols="12">
                            <v-textarea label="Reason for investigation" v-model="cart.items[0].reasons" rows="7" outline></v-textarea>
                        </v-col>
                    </v-row>

                    <v-row  v-else>
                        <div class="jumbotron text-center">
                            <p class="px-3">Please add an item to the order cart to initialise order process.</p>
                        </div>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-col>

        <v-col cols="8">
            <div class="pl-4">
                <v-data-table
                        flat
                        :headers="headers"
                        :items="cart.items"
                        hide-default-footer
                        class="elevation-1"
                >
                    <template v-slot:item.actions="{ item }">
                        <v-btn flat icon color="pink" @click="cart.removeItem(item.procedure)">
                            <v-icon>delete</v-icon>
                        </v-btn>
                    </template>

                    <template slot="footer">
                        <v-row >
                            <v-col class="pt-3 xs-8">
                                <span class="grey--text text-darken-2 font-weight-bold">Total: {{ this.cart.total }}</span>
                            </v-col>
                            <v-col class="text-right xs-4">
                                <v-btn class="pink" dark @click="checkout()">Request items</v-btn>
                            </v-col>
                        </v-row>
                    </template>
                </v-data-table>
            </div>
        </v-col>

        <v-col cols="12">
            <ordered :domain="domain" ></ordered>
        </v-col>

    </v-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Procedure from '@evaluation/libs/procedures/Procedure';
import ProcedureCart from '@evaluation/libs/procedures/ProcedureCart';
import Visit from '@reception/libs/visits/Visit';
import Ordered from './OrderedProcedures';
import { _ } from 'vue-underscore';

export default {
    props: [
        'items', 'domain',
    ],

    components: {
        Ordered,
    },

    data() {
        return {
            procedure: new Procedure(),
            cart: new ProcedureCart(),
            visitObj: new Visit(),
            categories: [],
            type: null,
            saveLoader: false,
            refreshOrderedList: false,

            headers: [
                { text: 'Procedure name', value: 'name' },
                { text: 'Price', value: 'price' },
                { text: 'Qty', value: 'quantity' },
                { text: 'Reason', value: 'reason' },
                { text: 'Action', value: 'action' },
            ],
        };
    },

    watch: {
        term(value) {
            if (value) {
                if (value.length > 2) {
                    this.procedure.index();
                } else {
                    this.procedure.search.reset();
                }
            }
        },

        type(value) {
            if (value) {
                this.procedure.type = value.id;
                this.procedure.destinations.push(value.name);
            }
        },

        getProcedureCategories({ categories }) {
            _.each(categories, (category) => {
                if (this.items.includes(category.name)) {
                    this.categories.push(category);
                }
            });
        },

        item(value) {
            if (value) {
                this.cart.addItem(value, this.getProcedureType(), this.visit);
                this.procedure.search.results = [];
                this.procedure.search.term = false;
            }
        },

        submitted(value) {
            if (value) {
                this.saveLoader = false;

                this.procedure.form.submitted = false;

                this.type = null;

                this.cart.reset();

                this.resetOrderedProcedures();
            }
        },
    },

    computed: {
        ...mapGetters([
            'getProcedureCategories',
        ]),

        initialised() {
            return this.getProcedureCategories;
        },

        term() {
            return this.procedure.search.term;
        },

        item() {
            return this.cart.item;
        },

        submitted() {
            return this.procedure.form.submitted;
        },

        lastIndex() {
            return this.cart.items.length - 1;
        },

        visit() {
            return this.visitObj.selectedVisit;
        },
    },

    methods: {
        ...mapActions([
            'setProcedureCategories', 'setInvestigations',
        ]),

        resetOrderedProcedures() {
            this.setInvestigations({
                params: {
                    visit_id: this.$route.params.visitId,
                },
            });

            // check for scheme capitation status
            window.events.$emit('check-capitation');
        },

        checkout() {
            if (this.cart.items == 0) {
                flash({
                    alert: 'red',
                    message: 'Sorry! You have not selected any items',
                });

                return;
            }

            if (this.cart.total == 0) {
                flash({
                    alert: 'red',
                    message: 'Sorry! Items you have selected have not been charged',
                });

                return;
            }

            this.saveLoader = true;

            this.procedure.orderProcedures(this.cart, this.$route.params.visitId);

            // alert child
            this.resetOrderedProcedures();
        },

        getProcedureType() {
            const type = this.type.name;

            if (type === 'Doctor') {
                return 'treatment';
            }

            if (type === 'Nursing') {
                return 'nursing';
            }

            if (type === 'Radiology') {
                return 'radiology';
            }

            if (type === 'Ultrasound') {
                return 'ultrasound';
            }

            if (type === 'Lab') {
                return 'laboratory';
            }

            return 'diagnosis';
        },

        makeTotal() {
            this.cart.calculateCartTotal();
        },
    },

    mounted() {
        this.setProcedureCategories();
        this.visitObj.find(this.$route.params.visitId);
    },
};
</script>

<style lang="scss">
    .v-input--selection-controls.v-input .v-label {
        top: 5px;
    }
</style>
