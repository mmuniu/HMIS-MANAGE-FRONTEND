<template>
    <div>
        <collabmed-loading v-if="!suppliers"></collabmed-loading>
        <v-card
                v-else
                class="pa-0"
                color="transparent"
                flat
        >
            <v-card-text class="py-0 my-0">
                <v-row  >
                    <v-col cols="12" md="4">
                        <div class="mr-2">
                            <v-select
                                    v-model="filters.supplier_id"
                                    :items="suppliers"
                                    item-text="name"
                                    item-value="id"
                                    label="Select supplier"
                                    persistent-hint
                                    single-line
                                    flat outline solo clearable
                                    @change="filter()"
                            ></v-select>
                        </div>
                    </v-col>

                    <v-col cols="12" md="4">
                        <div class="mx-2">
                            <v-menu
                                    v-model="start"
                                    :close-on-content-click="false"
                                    lazy
                                    transition="scale-transition"
                                    offset-y
                                    full-width
                                    :nudge-left="13"
                                    min-width="290px"
                            >
                                <template v-slot:activator="{ on }">
                                    <v-text-field
                                            v-model="filters.start_date"
                                            label="Start date"
                                            flat outline
                                            readonly
                                            v-on="on"
                                    ></v-text-field>
                                </template>
                                <v-date-picker
                                        no-title
                                        v-model="filters.start_date"
                                        @input="filter()">
                                </v-date-picker>
                            </v-menu>
                        </div>
                    </v-col>

                    <v-col cols="12" md="4">
                        <div class="mx-2">
                            <v-menu
                                    v-model="end"
                                    :close-on-content-click="false"
                                    :nudge-bottom="40"
                                    lazy
                                    transition="scale-transition"
                                    offset-y
                                    full-width
                                    :nudge-left="13"
                                    min-width="290px"
                            >
                                <template v-slot:activator="{ on }">
                                    <v-text-field
                                            v-model="filters.end_date"
                                            label="End date"
                                            flat outline
                                            readonly
                                            v-on="on"
                                    ></v-text-field>
                                </template>
                                <v-date-picker
                                        no-title
                                        v-model="filters.end_date"
                                        @input="filter()">
                                </v-date-picker>
                            </v-menu>
                        </div>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import _ from "lodash";
import { mapActions, mapGetters } from "vuex";

export default {
    name: "invoices-filter",

    data() {
        return {
            suppliers: null,
            start: false,
            end: false,
            filters: {
                supplier_id: null,
                start_date: moment().startOf("month").format("YYYY-MM-DD"),
                end_date: moment().endOf("month").format("YYYY-MM-DD"),
            },
        };
    },

    watch: {
        getSuppliers(suppliers) {
            this.suppliers = suppliers.data;
        },
    },

    computed: {
        ...mapGetters([
            "getSuppliers",
        ]),

        initialised() {
            return this.getSuppliers;
        },
    },

    methods: {
        ...mapActions([
            "setInvoices", "setSuppliers",
        ]),

        filter() {
            this.start = false;
            this.end = false;

            const params = _.omitBy(this.filters, _.isNil);

            this.$emit("filtered", params);

            this.setInvoices({
                page: 1,
                params,
            });
        },
    },

    mounted() {
        this.setSuppliers();
    },
};
</script>
