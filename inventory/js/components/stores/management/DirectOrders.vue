<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title class="subheading grey-text text-darken-2">
            <h2 class="body-2 ma-0 pa-0">Receive from suppliers</h2>
        </v-card-title>

        <v-divider class="mt-0"></v-divider>

        <v-card-text>
            <form @submit.prevent="save()">
                <v-row  >
                    <v-col cols="12" md="4">
                        <div class="mx-3">
                            <suppliers-search @results="setSupplier"></suppliers-search>
                        </div>
                    </v-col>

                    <v-col cols="12" md="4">
                        <div class="mx-3">
                            <v-autocomplete label="Select a payment mode" :items="getPaymentModes" item-text="name" item-value="id" required
                                            v-model="order.payment_mode_id" outline>
                            </v-autocomplete>
                        </div>
                    </v-col>

                    <v-col cols="12" md="4">
                        <div class="mx-3">
                            <v-autocomplete label="Select a payment term" :items="getPaymentTerms" item-text="terms" item-value="id" required
                                            v-model="order.payment_term_id" outline>
                            </v-autocomplete>
                        </div>
                    </v-col>

                    <v-col cols="12">
                        <div class="mx-3">
                            <v-divider class="mt-0"></v-divider>
                        </div>
                    </v-col>

                    <v-col cols="12" md="4">
                        <div class="mx-3">
                            <products-search @results="addItemToCart"></products-search>
                        </div>
                    </v-col>

                    <v-col cols="12" md="4" v-if="enablePrescriptionsSending">
                        <div class="mx-3">
                            <patient-search @patient-selected="patientSelected"></patient-search>
                        </div>
                    </v-col>

                    <v-col cols="12" md="4" v-if="enablePrescriptionsSending && selectedPatient">
                        <div class="mx-3">
                            <v-autocomplete
                                label="Select Prescription"
                                :items="prescriptions"
                                item-text="drug_name"
                                item-value="id"
                                v-model="selectedPrescription"
                                @change="prescriptionSelected"
                                outline
                            ></v-autocomplete>
                        </div>
                    </v-col>

                    <v-col cols="12" class="table-form small">
                        <v-data-table :headers="headers" :items="order.products"
                                      no-data-text="No products added yet"
                        >
                            <template v-slot:item.size="{ item }">
                                <v-text-field
                                        type="number"
                                        v-model="item.package_size"
                                        :min="1"
                                        solo flat
                                        @input="order.calculateTotal(item)"
                                ></v-text-field>
                            </template>
                            <template v-slot:item.quantity="{ item }">
                                <v-text-field
                                        type="number"
                                        v-model="item.quantity"
                                        :min="1"
                                        solo flat
                                        @input="order.calculateTotal(item)"
                                ></v-text-field>
                            </template>
                            <template v-slot:item.bonus="{ item }">
                                <v-text-field
                                        type="number"
                                        :min="0"
                                        v-model="item.bonus"
                                        @input="order.calculateTotal(item)"
                                        solo flat>
                                </v-text-field>
                            </template>
                            <template v-slot:item.expiry_date="{ item }" class="date">
                                <v-text-field v-model="item.expiry_date"
                                              mask="####-##-##"
                                              label="Expiry date"
                                              return-masked-value
                                              placeholder="YYYY-MM-DD"
                                              solo flat>
                                </v-text-field>
                            </template>
                            <template v-slot:item.unit_cost="{ item }">
                                <v-text-field type="number" disabled v-model="item.unit_cost" solo flat></v-text-field>
                            </template>
                            <template v-slot:item.cost="{ item }">
                                <v-text-field type="number" v-model="item.cost" solo flat
                                              @input="order.calculateTotal(item)"></v-text-field>
                            </template>

                            <template v-slot:item.discount="{ item }">
                                <v-text-field type="number"
                                              v-model="item.discount"
                                              solo
                                              flat
                                              @input="order.calculateTotal(item)">
                                </v-text-field>
                            </template>

                            <template v-slot:item.tax="{ item }">
                                <v-text-field type="number" v-model="item.tax" solo flat
                                              @input="order.calculateTotal(item)"></v-text-field>
                            </template>
                            <template v-slot:item.actions="{ item }">
                                <v-btn icon class="pink--text" flat>
                                    <v-icon class="pink--text" small
                                            @click="order.removeFromCart(item)"
                                    >
                                        delete
                                    </v-icon>
                                </v-btn>
                            </template>

                            <template slot="footer">
                                <v-row  class="mt-4">
                                    <v-col cols="8">
                                        <h2 class="body-2 subheading grey-text text-darken-2 pl-3 ma-0">
                                            GRAND TOTAL: {{ order.amount }}
                                        </h2>
                                    </v-col>
                                    <v-col cols="4" class="text-right">
                                        <v-btn
                                                class="blue caption"
                                                @click="save()"
                                                large
                                        >
                                            Receive goods
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </template>
                        </v-data-table>
                    </v-col>
                </v-row>
            </form>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import DirectOrder from "@inventory/libs/stores/DirectOrder";
import ProductsSearch from "@inventory/components/ProductsSearch";
import SupplierSearch from "@inventory/components/searches/Suppliers";
import PatientSearch from "@reception/components/patients/PatientSearch.vue";
import Prescription from "@evaluation/libs/notes/Prescription";

export default {
    name: "direct-orders",

    props: [
        "userId",
    ],

    components: {
        "products-search": ProductsSearch,
        "suppliers-search": SupplierSearch,
        "patient-search": PatientSearch,
    },

    data() {
        return {
            order: new DirectOrder(),
            loading: false,
            datetime: "",
            date: "",
            selectedPatient: null,
            prescriptions: [],
            selectedPrescription: null,
            headers: [
                { text: "Product name", value: "name", sortable: false, description: "Store product name" },
                { text: "Packaging", value: "size", sortable: false, description: "number in each" },
                { text: "Quantity", value: "quantity", sortable: false, description: "number of packages" },
                { text: "Bonus", value: "bonus", sortable: false, description: "quantity bonus given" },
                { text: "Expiry Date", value: "expiry_date", sortable: false, description: "Expiry date indicated" },
                { text: "Unit Cost", value: "unit_cost", sortable: false, description: "cost of a single item in package" },
                { text: "Cost", value: "cost", sortable: false, description: "Cost of each package" },
                { text: "Discount", value: "discount", sortable: false, description: "% discount given" },
                { text: "Tax %", value: "tax", sortable: false, description: "% tax rate applied" },
                { text: "Total", value: "total", sortable: false, description: "quantity by cost" },
                { text: "", value: "actions", sortable: false, description: "" },
            ],
        };
    },

    watch: {
        contaminated() {
            this.loading = false;
            this.order.form.submitted = false;
            this.order.form.errorDetected = false;
        },

        submitted() {
            this.loading = false;
            this.order.form.submitted = false;
        },
    },

    computed: {
        ...mapGetters([
            "getPaymentModes", "getPaymentTerms",
        ]),

        errors() {
            return this.order.form.errors;
        },

        submitted() {
            return this.order.form.submitted;
        },

        saved() {
            return this.order.saved;
        },

        batch() {
            return this.order.batch;
        },

        contaminated() {
            return this.order.form.errorDetected;
        },

        initialised() {
            return this.getPaymentModes && this.getPaymentTerms;
        },

        enablePrescriptionsSending() {
            return this.msetting('inventory.enable_prescriptions_sending_to_suppliers');
        },
    },

    watch: {
        saved(val) {
            if (val) {
                this.order.saved = false;
                // console.log('batch', this.batch)
                // window.location = route('inventory.grn.show', this.batch.id).relative();
            }
        },
    },

    methods: {
        ...mapActions([
            "setPaymentModes", "setPaymentTerms",
        ]),

        setExpiryDate: function(item, $event) {
            const index = this.order.products.indexOf(item);

            this.order.products[index].expiry_date = $event;
        },

        initialisePage() {
            this.order.store_id = this.$route.params.storeId;
            this.setPaymentModes();
            this.setPaymentTerms();
            this.order.user_id = this.userId;
        },

        addItemToCart(product) {
            this.order.addToCart(product);
            this.order.calculateTotal(this.order.products[0]);
        },

        setSupplier(supplier) {
            this.order.supplier_id = supplier.id;
        },

        save() {
            if (!this.loading) {
                this.loading = true;
                this.order.save();
            }
        },

        patientSelected(patient) {
            this.selectedPatient = patient;
            this.prescriptions = [];
            this.selectedPrescription = null;
            this.fetchPrescriptions();
        },

        async fetchPrescriptions() {
            if (this.selectedPatient) {
                try {
                    const prescriptionLib = new Prescription();
                    const response = await prescriptionLib.form.submit("post", "/api/evaluation/prescriptions/search", {
                        patient_id: this.selectedPatient.id
                    });
                    if (response && response.data) {
                        this.prescriptions = response.data;
                    }
                } catch (error) {
                    console.error("Error fetching prescriptions:", error);
                }
            }
        },

        prescriptionSelected(prescriptionId) {
            // Handle prescription selection, e.g., add to order or perform action
            console.log("Selected prescription:", prescriptionId);
        },
    },

    mounted() {
        this.initialisePage();
    },
};
</script>
