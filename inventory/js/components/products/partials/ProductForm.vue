<template>
    <v-row  v-if="initialised">

        <v-col cols="12" sm="6" md="4">
            <div class="mx-3">
                <v-text-field label="Product name" v-model="product.name" :error="errors.has('name')" outline required
                              :hint="errors.get('name')" persistent-hint @keyup="errors.clear('name')">
                </v-text-field>
            </div>
        </v-col>

        <v-col cols="12" sm="6" md="4">
            <div class="mx-3">
                <v-autocomplete label="Choose a category" :items="categories" item-text="name" item-value="id" required
                          v-model="product.category" :error="errors.has('category')" outline
                          :hint="errors.get('category')" persistent-hint @change="errors.clear('category')">
                </v-autocomplete>
            </div>
        </v-col>

        <v-col cols="12" sm="6" md="4">
            <div class="mx-3">
                <v-autocomplete label="Unit of measurement" :items="measurements" item-text="name" item-value="id" required
                                v-model="product.unit" :error="errors.has('unit')" outline
                                :hint="errors.get('unit')" persistent-hint @change="errors.clear('unit')">
                </v-autocomplete>
            </div>
        </v-col>

        <v-col cols="12" sm="6" md="4">
            <div class="mx-3">
                <v-autocomplete label="Tax group" :items="taxes" item-text="name" item-value="id" required
                                v-model="product.tax_category" :error="errors.has('tax_category')" outline
                                :hint="errors.get('tax_category')" persistent-hint @change="errors.clear('tax_category')"
                                multiple chips small-chips deletable-chips>
                </v-autocomplete>
            </div>
        </v-col>

        <v-col cols="12" sm="6" md="4">
            <div class="mx-3">
                <v-autocomplete label="Formulation" :items="formulation" item-text="item_name" item-value="id"  required
                                v-model="product.formulation" :error="errors.has('formulation')" outline
                                :hint="errors.get('formulation')" persistent-hint @change="errors.clear('formulation')">
                </v-autocomplete>
            </div>
        </v-col>

        <v-col cols="12" sm="6" md="4">
            <div class="mx-3">
                <v-autocomplete label="Label type" :items="labels" item-text="item_name" item-value="id" required
                                v-model="product.label_type" :error="errors.has('label_type')" outline
                                :hint="errors.get('label_type')" persistent-hint @change="errors.clear('label_type')">
                </v-autocomplete>
            </div>
        </v-col>

        <v-col cols="12" sm="6" md="4">
            <div class="mx-3">
                <v-textarea label="Product description" v-model="product.description" :error="errors.has('description')" outline required
                              :hint="errors.get('description')" persistent-hint @keyup="errors.clear('description')">
                </v-textarea>
            </div>
        </v-col>

        <v-col cols="12" sm="6" md="4">
            <div class="mx-3">
                <v-text-field label="Product code" v-model="product.code" :error="errors.has('code')" outline required
                              :hint="errors.get('code')" persistent-hint @keyup="errors.clear('code')">
                </v-text-field>
            </div>
        </v-col>

        <!-- @if(msetting(enable_dispensable_amount)) -->
        <!-- {{ msetting(enable_dispensable_amount) }} -->
        <!-- <v-col cols="12" sm="6" md="4" v-if="msetting('inventory.enable_dispensable_amount')"> -->
        <v-col cols="12" sm="6" md="4">
            <div class="mx-3">
                <v-text-field label="Dispensable Amount" v-model="product.dispensable_amount" :error="errors.has('dispensable_amount')" outline required
                              :hint="errors.get('dispensable_amount')" persistent-hint @keyup="errors.clear('dispensable_amount')">
                </v-text-field>
            </div>


            <div class="mx-3"  v-if="msetting('inventory.enable_bar_code_scan')">
                <v-text-field
                    label="Scan Barcode"
                    v-model="barcode"
                    @keyup.enter="handleBarcodeScan"
                    type="text"
                    outlined
                    clearable
                ></v-text-field>
                <div v-if="scannedBarcode" class="mt-2">
                    Scanned Barcode: {{ scannedBarcode }}
                </div>
            </div>
            </v-col>


        <v-col cols="12" sm="6" md="4">
            <div class="mx-3">
                <v-text-field label="Discount price" v-model="product.discount_price" :error="errors.has('discount_price')" outline
                              :hint="errors.get('discount_price')" persistent-hint @keyup="errors.clear('discount_price')">
                </v-text-field>
            </div>
        </v-col>
         <!-- v-if="msetting('inventory.use_online_images')" -->
           <!-- v-else -->

        <v-col cols="12" sm="6" md="4">
            <div class="mx-3">
                <v-text-field

                    label="Product Photo URL"
                    v-model="product.photo_url"
                    :error="errors.has('photo_url')"
                    outline
                    type="url"
                    :hint="errors.get('photo_url')"
                    persistent-hint
                    @keyup="errors.clear('photo_url')">
                </v-text-field>


                <!-- <v-file-input

                    label="Product Photo"
                    v-model="product.photo"
                    :error="errors.has('photo')"
                    outline
                    accept="image/*"
                    :hint="errors.get('photo')"
                    persistent-hint
                    @change="errors.clear('photo')">
                </v-file-input> -->
            </div>
        </v-col>

        <v-col cols="12" sm="6" md="4">
            <div class="mx-3">
                <v-checkbox label="Product is active in inventory" class="at-middle-center" v-model="product.active"></v-checkbox>
            </div>
          <div class="mx-3">
            <v-checkbox label="Product is price inclusive" class="at-middle-center" v-model="product.price_inclusive"></v-checkbox>
          </div>
        </v-col>




 <!-- v-if="msetting('finance.use_dynamics_artemis_in_project')" -->

        <v-col cols="12" offset-md="10" md="2" class="px-3">
              <v-btn class="blue lighten-1 caption" color="blue" large block
                   :loading="pullingItems"
                   @click="pullItemsFromDynamics()">
                Pull all Items from Dynamics
            </v-btn>
            <v-btn v-if="!isProduct" ty pe="submit" class="blue lighten-1 caption" color="blue" large block
                   :dark="!loading" :loading="loading" :disabled="loading"
                   @click="storeProduct()">
                Save product
            </v-btn>

            <v-btn v-else type="submit" class="blue lighten-1 caption" color="blue" large block
                   :dark="!loading" :loading="loading" :disabled="loading"
                   @click="updateProduct()">
                Update product
            </v-btn>
        </v-col>

    </v-row>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Product from "@inventory/libs/products/Product";

export default {
    name: "product-form",
    props: [
        "isProduct",
    ],

    data() {
        return {
            loading: false,
            pullingItems: false,
            product: new Product(),
            barcode: '',
            scannedBarcode: '',
            // tax_category is now an array coming from pivot
            // keep using the same key to minimize backend changes
            // ProductRepository.fields already defines tax_category: []
        };
    },

    watch: {
        contaminated() {
            this.loading = false;
            this.product.form.submitted = false;
            this.product.form.errorDetected = false;
        },

        submitted() {
            this.loading = false;
            this.product.form.submitted = false;
            this.setProducts({ page: 1 });
        },
    },

    computed: {
        ...mapGetters([
            "getProductCategories", "getProductMeasurements", "getTaxCategories", "getOptions",
        ]),

        categories() {
            return this.getProductCategories.data;
        },

        measurements() {
            return this.getProductMeasurements;
        },

        taxes() {
            return this.getTaxCategories.data;
        },

        formulation() {
            return this.getOptions.formulation;
        },

        labels() {
            return this.getOptions.label_type;
        },

        initialised() {
            return this.categories;
        },

        errors() {
            return this.product.form.errors;
        },

        submitted() {
            return this.product.form.submitted;
        },

        contaminated() {
            return this.product.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            "setProductCategories", "setProductMeasurements", "setTaxCategories", "setOptions", "setProducts",
        ]),


        storeProduct() {
            this.loading = true;
            this.product.bar_code = this.scannedBarcode;
            // tax_category is an array now; nothing to transform
            this.product.save();
        },

        updateProduct() {
            this.loading = true;
            this.product.bar_code = this.scannedBarcode;
            // tax_category is an array now; nothing to transform
            this.product.update();
        },

        handleBarcodeScan() {
            if (this.barcode.trim() === '') {
                return;
            }

            this.scannedBarcode = this.barcode;
            this.product.bar_code = this.scannedBarcode;

            console.log(this.scannedBarcode);

            // Clear the barcode input after scanning
            this.barcode = '';

            // Hide scannedBarcode after 2 seconds
            // setTimeout(() => {
            //     this.scannedBarcode = '';
            // }, 2000);
        },

        pullItemsFromDynamics() {
            this.pullingItems = true;
            this.$http.post('/api/inventory/execute-add-new-items-command')
                .then(response => {
                    this.$toast.success('Items pulled successfully from Dynamics.');
                    // Optionally refresh products list or emit event
                    this.$emit('items-pulled');
                })
                .catch(error => {
                    this.$toast.error('Failed to pull items from Dynamics.');
                    console.error(error);
                })
                .finally(() => {
                    this.pullingItems = false;
                });
        },
    },

    mounted() {
        this.setTaxCategories();
        this.setProductCategories();
        this.setProductMeasurements();
        this.setOptions({
            params: {
                configs: "formulation,label_type",
            },
        });

        if (this.isProduct) {
            this.product.assemble(this.isProduct);
            // Expect backend to provide an array of tax_category IDs if available.
            // If backend sends a single number for backwards compatibility, wrap it into an array
            if (this.product.tax_category && !Array.isArray(this.product.tax_category)) {
                this.product.tax_category = [this.product.tax_category];
            }
        }
    },
};
</script>

<style scoped>

</style>
