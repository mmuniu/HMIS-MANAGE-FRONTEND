<template>
  <collabmed-loading v-if="!initialised"></collabmed-loading>

  <div  v-else>
    <v-card >

      <v-card-title>
        <v-row  class="mx-3">
          <v-col md="3">
            <v-select
                :items="filterItems"
                class="mr-2"
                v-model="reorderLevel"
                solo flat outlined
                clearable
                @click:clear="clearFilters()"
                hide-details
            ></v-select>
          </v-col>
          <v-col md="4">
            <v-btn color="success" @click="filter()">filter</v-btn>
            <v-btn color="primary" @click="downloadExcel()">Download excel</v-btn>
          </v-col>
          <v-col md="5">
            <v-text-field
                label="Search for a product"
                prepend-inner-icon="search"
                class="mr-2"
                outlined
                v-model="term"
                solo flat outline
                hide-details
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text>
        <v-data-table
            :headers="products.headers"
            :items="products.data"
            :loading="loading"
            class="mb-3"
            disable-pagination
            show-select
            v-model="selectedProducts"
            hide-default-footer
            flat
        >
          <v-progress-linear slot="progress" color="blue" height="2" indeterminate></v-progress-linear>
          <template v-slot:item.name="{ item }"
                    class="py-3"
          >
                        <span :class="item.re_order_level == 0 ? 'orange--text font-weight-black' :
                            item.quantity <  item.re_order_level ? 'red--text font-weight-black' : null">
                            {{ item.name }}
                        </span>
            <span class="grey--text ml-2">#{{ item.id }}</span>
          </template>
          <template v-slot:item.quantity="{ item }" class="text-right">
            {{ item.quantity | numberFormatInt }}
          </template>
          <template v-slot:item.unit_cost="{ item }" class="text-right">

            {{ item.unit_cost | numberFormat }}
          </template>
          <template v-slot:item.cash_price="{ item }">
            <input
                style="width: 120px"
                class="form-control"
                type="text"
                v-model="item.selling_price"
                @keyup="handleSellingPriceChange(item)"
            >
          </template>
          <template v-slot:item.discount_price="{ item }">
            <input
                style="width: 120px"
                class="form-control"
                type="text"
                v-model="item.discount_price"
                @keyup="adjustProductPrices(item)"
            >
          </template>
          <template v-if="msetting('inventory.enable_lower_limit')" v-slot:item.lower_limit_price="{ item }">
            <input
                style="width: 120px"
                class="form-control"
                type="text"
                v-model="item.lower_limit_price"
                @keyup="handleLowerLimitPriceChange(item)"
            >
          </template>
          <template v-if="msetting('inventory.enable_lower_limit')" v-slot:item.lower_limit_percentage="{ item }">
            <input
                style="width: 120px"
                class="form-control"
                type="text"
                v-model="item.lower_limit_percentage"
                @keyup="handleLowerLimitPercentageChange(item)"
            >
          </template>
          <template v-slot:item.re_order_level="{ item }">
            <input
                style="width: 120px"
                class="form-control"
                type="text"
                v-model="item.re_order_level"
                @change="updateReOrderLevel(item)"
            >
          </template>
          <template v-slot:item.reorder_indicator="{ item }">
            <v-chip
              :color="getReorderIndicatorColor(getReorderFilter(item))"
              small
              dark
            >
              {{ getReorderIndicatorText(getReorderFilter(item)) }}
            </v-chip>
          </template>
          <template v-slot:item.expiry_date="{ item }">
                    <input
                style="width: 120px"
                class="form-control"
                type="text"
                v-model="item.expiry_date"
              readonly
            >
          </template>
          <template v-slot:item.lot_no="{ item }">
            <input
                style="width: 120px"
                class="form-control"
                type="text"
                v-model="item.lot_no"
              readonly
            >
          </template>
          <template v-slot:item.actions="{ item }">

            <v-btn
                @click="adjustStockQuantity(item)"
                class="caption"
                color="blue"
                small dark>
              Adjust Stock
            </v-btn>
          </template>
        </v-data-table>

        <v-container v-if="products.meta">
          <v-row >
            <v-col cols="12" class="text-center">
              <v-pagination
                  v-model="page"
                  :length="products.meta.last_page"
                  circle
                  total-visible="8"
              ></v-pagination>
            </v-col>
          </v-row>
        </v-container>

      </v-card-text>
    </v-card>

    <adjust-stock
        :modal="modal"
        :userId="userId"
        :product="product"
        @close="close()"
    />

    <v-card flat v-if="selectedProducts">
      <v-container fluid v-if="selectedProducts.length > 0">
        <v-row >
          <v-col>
            <v-chip v-for="(product, index) in selectedProducts" :key="product.id" close @click:close="removeItem(index)">
              {{ product.name }}
            </v-chip>
          </v-col>
        </v-row>
      </v-container>
      <v-btn color="primary" @click="purchaseOrderDialog = true">Make purchase order</v-btn>
      <v-btn color="primary" @click="requisitionDialog = true">Make requisition</v-btn>
    </v-card>

    <!-- purchase order dialog-->
    <v-dialog v-model="purchaseOrderDialog" persistent width="90%">
      <v-card>
        <v-card-title class="headline primary">

          <span class="white--text">Selected Items</span>
          <v-spacer></v-spacer>

          <v-btn fab color="transparent" dark small @click="closeDialog()">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <div class="mx-3">

          <!-- purchase order -->
          <create-purchase-order :selected-products="selectedProducts"
                                 @orderPlaced="orderPlaced"
                                 :store-id="storeId"
                                 :external="true">
          </create-purchase-order>
        </div>
      </v-card>
    </v-dialog>

    <!-- requisition dialog -->
    <v-dialog v-model="requisitionDialog" persistent width="80%">
      <v-card>
        <v-card-title class="headline primary">

          <span class="white--text">Selected Items</span>
          <v-spacer></v-spacer>

          <v-btn fab color="transparent" dark small @click="closeDialog()">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <div class="mx-3">
          <!-- requisition -->
          <create-requisition :external="true"
                              :selectedProducts="selectedProducts"
                              :store-id="storeId"
                              :requestor-id="userId"
                              @orderPlaced="orderPlaced"
          ></create-requisition>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import AdjustStock from '@inventory/components/stores/management/partials/AdjustStock';
import CreatePurchaseOrder from '@inventory/components/purchase_orders/Create';
import CreateRequisition from '@inventory/components/requisitions/Create';
import StoreProduct from '@inventory/libs/products/StoreProduct';

export default {
  name: 'store-products',

  props: [
    'userId',
  ],

  components: {
    AdjustStock,
    'create-purchase-order': CreatePurchaseOrder,
    'create-requisition': CreateRequisition,
  },

  data() {
    return {
      page: 1,
      modal: false,
      purchaseOrderDialog: false,
      requisitionDialog: false,
      product: null,
      products: null,
      term: '',
      selectedProducts: [],
      loading: false,
      storeProduct: new StoreProduct(this.storeId),
      reorderLevel: null,
      filterItems: [
        { text: 'Below re-order level', value: 'below_reorder' },
        { text: 'Quantity is zero', value: 'quantity_zero' },
        { text: 'Below re-order level & greater than 1', value: 'below_greater_one' },
      ],
      params: {
        'store_id': this.$route.params.storeId,
      },
    };
  },

  watch: {
    getStoreProducts(products) {
      this.loading = false;
      this.products = products;
      if (this.products.headers) {
        // Add re-order indicator header after re_order_level
        const reorderIndex = this.products.headers.findIndex(h => h.value === 're_order_level');
        if (reorderIndex !== -1) {
          this.products.headers.splice(reorderIndex + 1, 0, {text: 'Re-order Indicator', value: 'reorder_indicator'});
        }
        if (this.msetting('inventory.enable_lower_limit')) {
          this.products.headers.splice(-1, 0, {text: 'Lower Limit Percentage', value: 'lower_limit_percentage'});
          this.products.headers.splice(-1, 0, {text: 'Lower Limit Price', value: 'lower_limit_price'});
        }
      }
      // Set default percentage to 0 if not set
      if (this.products.data) {
        this.products.data.forEach(item => {
          if (item.lower_limit_percentage === null || item.lower_limit_percentage === undefined) {
            item.lower_limit_percentage = 0;
          }
        });
      }

    },

    page(value) {
      this.setStoreProducts({
        page: value,
        params: this.params,
      });
    },

    selectedProducts(val) {
      if (!val) {
        this.selectedProducts = [];
      }
    },

    term(query) {
      if (query.length > 2) {
        this.search(query);
      }
    },
  },

  computed: {
    ...mapGetters([
      'getStoreProducts',
    ]),

    initialised() {
      return this.products;
    },

    storeId() {
      return this.$route.params.storeId;
    },
  },

  methods: {
    ...mapActions([
      'setStoreProducts',
    ]),

    closeDialog() {
      this.purchaseOrderDialog = false;
      this.requisitionDialog = false;
    },

    orderPlaced() {
      this.closeDialog();
      this.selectedProducts = [];
    },

    removeItem(productIndex) {
      this.selectedProducts.splice(productIndex, 1);
    },

    filter() {
      this.params.reorderLevel = this.reorderLevel;
      this.params.no_pagination = 0;
      this.initialisePage();
    },

    clearFilters() {
      this.initialisePage();
    },

    downloadExcel() {
      return window.location = '/inventory/stores/' + this.$route.params.storeId + '/products/download';
    },

    close() {
      this.modal = false;
      this.setStoreProducts({
        params: {
          'store_id': this.$route.params.storeId,
        },
        page: 1,
        search: this.term,
      });
    },

    updateReOrderLevel(product) {
      this.storeProduct.updateReOrderLevel(product);
    },

    adjustStockQuantity(product) {
      this.product = product;
      this.modal = true;
    },

    search: _.debounce(function(search) {
      this.loading = true;
      this.params.no_pagination = true;

      const action = {
        params: this.params,
        search,
      };

      this.setStoreProducts(action);
    }, 1000),

    initialisePage() {
      const params = this.params;


      this.setStoreProducts({
        params,
        page: 1,
      });



    },

    handleSellingPriceChange(item) {
      // When selling price changes, update lower limit price if percentage is set
      if (item.lower_limit_percentage && parseFloat(item.lower_limit_percentage) > 0) {
        const perc = parseFloat(item.lower_limit_percentage);
        const selling = parseFloat(item.selling_price) || 0;
        if (selling > 0) {
          item.lower_limit_price = (selling * (1 - perc / 100)).toFixed(2);
        }
      }
      this.adjustProductPrices(item);
    },

    handleLowerLimitPriceChange(item) {
      const selling = parseFloat(item.selling_price) || 0;
      const price = parseFloat(item.lower_limit_price) || 0;
      if (selling > 0 && price <= selling) {
        const percentage = ((selling - price) / selling) * 100;
        item.lower_limit_percentage = Math.min(100, percentage).toFixed(2);
      }
      this.adjustProductPrices(item);
    },

    handleLowerLimitPercentageChange(item) {
      let perc = parseFloat(item.lower_limit_percentage) || 0;
      perc = Math.min(100, perc);
      item.lower_limit_percentage = perc.toFixed(2);
      const selling = parseFloat(item.selling_price) || 0;
      if (selling > 0) {
        item.lower_limit_price = (selling * (1 - perc / 100)).toFixed(2);
      }
      this.adjustProductPrices(item);
    },

    adjustProductPrices: _.debounce( function(item, type) {
      this.storeProduct.update(item);
    }, 2000),

    navigate(url) {
      if (url) {
        const page = url.substring(url.indexOf('page=')).split('page=')[1];

        this.setStoreProducts({
          page,
          params: this.params,
        });
      }
    },

    getReorderFilter(item) {
      if (item.quantity === 0) {
        return 'quantity_zero';
      }
      if (item.quantity < item.re_order_level) {
        if (item.quantity > 1) {
          return 'below_greater_one';
        }
        return 'below_reorder';
      }
      return null;
    },

    getReorderIndicatorColor(filter) {
      switch (filter) {
        case 'quantity_zero':
          return 'red';
        case 'below_reorder':
          return 'orange';
        case 'below_greater_one':
          return 'yellow';
        default:
          return 'green';
      }
    },

    getReorderIndicatorText(filter) {
      switch (filter) {
        case 'quantity_zero':
          return 'Out of Stock';
        case 'below_reorder':
          return 'Low Stock';
        case 'below_greater_one':
          return 'Reorder Soon';
        default:
          return 'In Stock';
      }
    },
  },

  mounted() {
    this.initialisePage();
  },
};
</script>
<style scoped>
.adjust-stock-disabled{
  background-color: #36454F ;
  color: white;
  pointer-events: none ;
  cursor: not-allowed ;
  opacity: 0.8 ;
}

.adjust-stock-disabled:hover {
  cursor: not-allowed;
}
</style>
