<template>
    <v-row >
        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-text-field label="Category name" v-model="productCategory.name" :error="errors.has('name')" outline required
                              :hint="errors.get('name')" persistent-hint @keyup="errors.clear('name')">
                </v-text-field>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-text-field label="Cash markup" v-model="productCategory.cash_markup" :error="errors.has('cash_markup')" outline required
                              :hint="errors.get('cash_markup')" persistent-hint @keyup="errors.clear('cash_markup')">
                </v-text-field>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-autocomplete label="Select a parent category" :items="categories" item-text="name" item-value="id"
                          v-model="productCategory.parent_id" :error="errors.has('parent')" outline
                          :hint="errors.get('parent')" persistent-hint @change="errors.clear('parent')"></v-autocomplete>
            </div>
        </v-col>

        <v-col cols="12" md="6">
            <div class="mx-3">
                <v-text-field label="Credit markup" v-model="productCategory.credit_markup" :error="errors.has('credit_markup')" outline required
                              :hint="errors.get('credit_markup')" persistent-hint @keyup="errors.clear('credit_markup')">
                </v-text-field>
            </div>
        </v-col>

        <v-col cols="12" class="text-right mx-2">
            <v-btn v-if="!isProductCategory" type="submit" class="blue lighten-1" color="blue" large
                   :dark="!loading" :loading="loading" :disabled="loading"
                   @click="storeCategory()">
                Save category details
            </v-btn>

            <v-btn v-else type="submit" class="blue lighten-1" color="blue" large
                   :dark="!loading" :loading="loading" :disabled="loading"
                   @click="updateCategory()">
                Update category details
            </v-btn>
        </v-col>
    </v-row>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import ProductCategory from "@inventory/libs/product_categories/ProductCategory";

export default {
    props: [
        "isProductCategory",
    ],

    data() {
        return {
            productCategory: new ProductCategory(),
            loading: false,
        };
    },

    watch: {
        contaminated() {
            this.loading = false;
            this.productCategory.form.submitted = false;
            this.productCategory.form.errorDetected = false;
        },

        submitted() {
            this.loading = false;
            this.productCategory.form.submitted = false;
            this.setProductCategories();
        },
    },

    computed: {
        ...mapGetters([
            "getProductCategories",
        ]),

        categories() {
            return this.getProductCategories.data;
        },

        errors() {
            return this.productCategory.form.errors;
        },

        submitted() {
            return this.productCategory.form.submitted;
        },

        contaminated() {
            return this.productCategory.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            "setProductCategories",
        ]),

        storeCategory() {
            this.loading = true;

            this.productCategory.save();
        },

        updateCategory() {
            this.loading = true;

            this.productCategory.update();
        },

        initializePage() {
            const productCategory = this.isProductCategory;

            if (productCategory) {
                this.productCategory.assemble(productCategory);
            }

            this.setProductCategories();
        },
    },

    mounted() {
        this.initializePage();
    },
};
</script>
