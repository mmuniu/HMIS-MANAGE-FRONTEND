<template>
  <div>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
      <v-card-title class="subheading grey-text text-darken-2">
        <h2 class="body-2 ma-0 pa-0">List of all products</h2>
      </v-card-title>

      <v-divider class="my-0"></v-divider>

      <v-card-text>
        <v-row>
          <v-col offset-md="8" md="4" cols="12">
            <product-search @results="productSelected"></product-search>
            <!--<v-text-field prepend-inner-icon="search" label="Search product ..." v-model="search"
                          outline single-line hide-details>
            </v-text-field>-->
          </v-col>
        </v-row>

        <v-data-table
            :headers="headers" :items="products.data"
            :items-per-page="perPage"
            hide-default-footer
            show-select
            v-model="selectedProducts"
            class="mb-3" flat
        >
          <template v-slot:item.name="{ item }">
            <span>{{ item.name }}</span>
            <span style="margin-left: 5px; color: grey">#-{{ item.code }}</span>
          </template>
          <template v-slot:item.selling_price="{ item }">
            <input
                style="width: 120px"
                class="form-control"
                type="text"
                v-model="item.selling_price"
            >
          </template>
          <template v-slot:item.discount_price="{ item }">
            <input
                style="width: 120px"
                class="form-control"
                type="text"
                v-model="item.discount_price"
            >
          </template>


          <template v-slot:item.active="{ item }">
            <v-chip
                :color="item.is_active ? 'green' : 'red'"
                small
                label
                dark
            >
              {{ item.is_active ? 'active' : 'deactivated' }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn color="blue" dark small
                   v-if="can('inventory.products.update')"
                   :href="route('inventory.products.edit', item.id)">
              Edit
            </v-btn>
            <v-btn color="indigo" dark small class="ml-1"
                   @click="openLabelPrint(item)">
              Print Label
            </v-btn>
          </template>

          <template slot="footer" v-if="products.links">
            <v-row  class="py-2 pb-2">
              <v-col cols="8" class="mt-3 ml-3">
                Total product count: {{ products.meta.total }}
              </v-col>

              <v-col cols="3" class="text-right">
                <v-btn icon @click="navigate(products.links.prev)">
                  <v-icon>chevron_left</v-icon>
                </v-btn>

                <v-btn icon @click="navigate(products.links.next)">
                  <v-icon>chevron_right</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <v-card flat v-if="selectedProducts">

      <v-btn color="primary" @click="openProductUpdateDialog">Update product prices</v-btn>

      <v-btn color="primary" @click="updateEcommerceProducts">Update e-commerce products</v-btn>

    </v-card>
    <!-- Update Prices Dialog -->
    <v-dialog v-model="productPriceDialog" v-if="productPriceDialog" persistent width="90%">
      <v-card>
        <v-card-title class="headline primary">
          <span class="white--text">Update product prices according to the stores</span>
          <v-spacer></v-spacer>
          <v-btn fab color="transparent" dark small @click="closeUpdatePriceDialog()">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <div class="mx-3">
          <!-- Loading indicator while stores are being fetched -->
          <collabmed-loading v-if="loading"></collabmed-loading>

          <!-- Loop through the stores once they are loaded -->
          <v-row v-else v-for="(store, index) in stores" :key="index">
            <v-col cols="12">
              <v-checkbox
                  v-model="selectedStores"
                  :value="store.id"
                  :label="store.name"
              ></v-checkbox>
            </v-col>
          </v-row>

          <!-- Update Button -->
          <div style="display:flex;align-items:center;justify-content:center">

            <v-btn color="primary" @click="updatePrices()" style="margin-bottom:50px">
              Update Prices
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <product-label-printout :product="selectedProduct || {}" :products="selectedProducts" :show="labelDialog" @update:show="labelDialog = $event" />
  </div>
</template>

<script>
import _ from "lodash";
import { mapGetters, mapActions } from "vuex";
import Product from "@inventory/libs/products/Product";
import ProductSearch from "@inventory/components/ProductsSearch";
import ProductLabelPrintout from "./partials/ProductLabelPrintout.vue";

export default {
  name: "products-index",

  components: {
    ProductSearch,
    ProductLabelPrintout,
  },
  data() {
    return {
      search: null,
      products: null,
      product: new Product(),
      labelDialog: false,
      selectedProduct: null,
      selectedProducts: [],
      stores:[],
      selectedStores:[],
      productPriceDialog:false,
      loading:false,
      headers: [
        { text: "Name", value: "name" },
        { text: "Category", value: "category_name" },
        { text: "Unit", value: "unit_name" },
        {text:"Selling Price", value:"selling_price"},
        {text:"Discount Price", value:"discount_price"},
        { text: "Tax", value: "tax_group_name" },
        { text: "Active", value: "active" },
        { text: "Actions", value: "actions" },
      ],
    };
  },

  watch: {
    getProducts(products) {
      this.products = products;
    },
    search(value) {
      if (!value) {
        this.setProducts({ page: 1 });
        return;
      }

      if (value && value.length > 0) {
        this.searchProducts(value);
      }
    },
    selectedProducts(val) {
      if (!val) {
        this.selectedProducts = [];
      }
    },
  },

  computed: {
    ...mapGetters([
      "getProducts",
    ]),

    perPage() {
      const meta = this.products && this.products.meta;
      const per = meta && (meta.per_page || meta.perPage);
      return per ? Number(per) : 100;
    },

    initialised() {
      return this.products;
    },
  },

  methods: {
    ...mapActions([
      "setProducts",
    ]),
    closeUpdatePriceDialog(){
      this.productPriceDialog = false;
    },

    openProductUpdateDialog(){
      this.productPriceDialog = true;

      this.fetchStores(); // Fetch stores when opening dialog

    },

    openLabelPrint(item) {
      this.selectedProduct = item;
      this.labelDialog = true;
    },

    navigate(url) {
      if (url) {
        const page = url.substring(url.indexOf("page=")).split("page=")[1];
        this.setProducts({ page });
      }
    },

    productSelected(product) {
      this.setProducts({
        params: {
          search: true,
          product_id: product.id,
        },
      });
    },

    async  fetchStores(){
      this.loading = true;
      try {
        this.stores = await this.product.fetchStores();
      } catch (error) {
        console.error("Failed to fetch stores", error);
      } finally {
        this.loading = false;
      }
    },

    updatePrices(){

      // Get the selected products and selected stores
      const selectedProducts = this.selectedProducts; // From the v-data-table
      const selectedStores = this.selectedStores; // From the v-checkbox in the modal

      // Ensure that both products and stores are selected
      if (selectedProducts.length === 0 || selectedStores.length === 0) {
        alert("Please select at least one product and one store.");
        return;
      }

      // Prepare the data to be sent to the saveProductStores function
      const data = {
        products: selectedProducts.map(product => ({
          id: product.id,
          name: product.name,
          selling_price: product.selling_price,
          discount_price: product.discount_price,
        })),
        stores: selectedStores, // Store IDs
      };


      // Call the saveProductStores function and pass the data
      this.product.saveProductStores(data).then(() => {
        // Close the modal on success
        this.closeUpdatePriceDialog();
      }).catch(error => {
        console.error("Failed to update product stores", error);
      });

      this.closeUpdatePriceDialog();
      this.selectedStores =[];

    },

    updateEcommerceProducts(){

      // Get the selected products and selected stores
      const selectedProducts = this.selectedProducts; // From the v-data-table
      const selectedStores = this.selectedStores; // From the v-checkbox in the modal

      // Ensure that both products and stores are selected
      if (selectedProducts.length === 0 || selectedStores.length === 0) {
        alert("Please select at least one product and one store.");
        return;
      }

      // Prepare the data to be sent to the saveProductStores function
      const data = {
        products: selectedProducts.map(product => ({
          id: product.id,
          name: product.name,
          selling_price: product.selling_price,
          discount_price: product.discount_price,
        })),
        stores: selectedStores, // Store IDs
      };


      // Call the saveProductStores function and pass the data
      this.product.updateEcommerceProducts(data).then(() => {
        // Close the modal on success
        this.closeUpdatePriceDialog();
      }).catch(error => {
        console.error("Failed to update e-commerce products", error);
      });

      this.closeUpdatePriceDialog();
      this.selectedStores =[];

    },

    enable(){

      // Get the selected products and selected stores
      const selectedProducts = this.selectedProducts; // From the v-data-table
      const selectedStores = this.selectedStores; // From the v-checkbox in the modal

      // Ensure that both products and stores are selected
      if (selectedProducts.length === 0 || selectedStores.length === 0) {
        alert("Please select at least one product and one store.");
        return;
      }

      // Prepare the data to be sent to the saveProductStores function
      const data = {
        products: selectedProducts.map(product => ({
          id: product.id,
          name: product.name,
          selling_price: product.selling_price,
          discount_price: product.discount_price,
        })),
        stores: selectedStores, // Store IDs
      };


      // Call the saveProductStores function and pass the data
      this.product.saveProductStores(data).then(() => {
        // Close the modal on success
        this.closeUpdatePriceDialog();
      }).catch(error => {
        console.error("Failed to update product stores", error);
      });

      this.closeUpdatePriceDialog();
      this.selectedStores =[];

    },

    async destroyProduct(productId) {
      if (confirm("Permanently destroy this product! This will unlink the product from the stores as well")) {
        const response = await this.product.deleteProduct(productId);

        if (response) {
          this.setProducts({
            page: 1,
          });
        }
      }
    },

    searchProducts: _.debounce(function search(search) {
      this.setProducts({ search });
    }, 1500),
  },

  mounted() {
    this.setProducts({
      page: 1,
    });
  },
};
</script>
