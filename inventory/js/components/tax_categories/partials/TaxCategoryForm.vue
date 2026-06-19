<template>
    <v-row >
        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-text-field label="Category name" v-model="tax.name" :error="errors.has('name')" outline required
                              :hint="errors.get('name')" persistent-hint @keyup="errors.clear('name')">
                </v-text-field>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-text-field label="Tax rate" v-model="tax.rate" :error="errors.has('rate')" outline required
                              :hint="errors.get('rate')" persistent-hint @keyup="errors.clear('rate')">
                </v-text-field>
            </div>
        </v-col>

        <v-col cols="12" class="text-right mx-2">
            <v-btn v-if="!isTaxCategory" type="submit" class="blue lighten-1" color="blue" large
                   :dark="!loading" :loading="loading" :disabled="loading"
                   @click="storeCategory()">
                Save tax details
            </v-btn>

            <v-btn v-else type="submit" class="blue lighten-1" color="blue" large
                   :dark="!loading" :loading="loading" :disabled="loading"
                   @click="updateCategory()">
                Update tax details
            </v-btn>
        </v-col>
    </v-row>
</template>

<script>
import { mapActions } from "vuex";
import TaxCategory from "@inventory/libs/tax_categories/TaxCategory";

export default {
    name: "tax-category-form",

    props: [
        "isTaxCategory",
    ],

    data() {
        return {
            tax: new TaxCategory(),
            loading: false,
        };
    },

    watch: {
        contaminated() {
            this.loading = false;
            this.tax.form.submitted = false;
            this.tax.form.errorDetected = false;
        },

        submitted() {
            this.loading = false;
            this.tax.form.submitted = false;
            this.setTaxCategories();
        },
    },

    computed: {
        errors() {
            return this.tax.form.errors;
        },

        submitted() {
            return this.tax.form.submitted;
        },

        contaminated() {
            return this.tax.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            "setTaxCategories",
        ]),

        storeCategory() {
            this.loading = true;

            this.tax.save();
        },

        updateCategory() {
            this.loading = true;

            this.tax.update();
        },

        initializePage() {
            const taxCategory = this.isTaxCategory;

            if (taxCategory) {
                this.tax.assemble(taxCategory);
            }
        },
    },

    mounted() {
        this.initializePage();
    },
};
</script>
