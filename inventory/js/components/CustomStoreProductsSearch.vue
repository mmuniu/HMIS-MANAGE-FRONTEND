<template>
  <div class="d-flex align-items-center product-search-wrapper">
    <v-menu
        v-model="menu"
        :close-on-content-click="false"
        :nudge-width="200"
        offset-y
        transition="scale-transition"
        max-height="300"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-text-field
            v-model="term"
            v-bind="attrs"
            v-on="on"
            :loading="loading"
            :disabled="disabled"
            clearable
            :label="placeholder"
            class="form-control search-input mr-2"
            @input="handleSearch"
        />
      </template>


      <v-list>
        <v-list-item
            v-for="(item, index) in filteredProducts"
            :key="index"
            @click="selectItem(item)"
            :disabled="item.disabled"
        >
          <v-list-item-content>
            <v-list-item-title class="caption">{{ item.text }}</v-list-item-title>
            <v-list-item-subtitle class="caption red--text" v-if="item.subtext">{{ item.subtext }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="filteredProducts.length === 0">
          <v-list-item-title>No results</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>


<script>
import _ from 'lodash';
import {mapActions, mapGetters} from "vuex";
export default {
  name: 'custom-store-products-search',

  props: {
    storeId: Number,
    disabled: Boolean,
    keepSelected: Boolean,
    takingStocks: Boolean,
    unDisableOutOfStock: Boolean,
    isConsumable: Boolean,
    placeholder: {
      type: String,
      default: '',
    }
  },

  data() {
    return {
      term: '',
      product: null,
      menu: false,
      products: [],
      loading: false,
      minInput: 2,
    };
  },

  computed: {
    filteredProducts() {
      return _.map(this.products, (item) => {
        let disabled = item.disabled;

        if (this.takingStocks || this.unDisableOutOfStock) {
          disabled = false;
        }
        item['name'] = item.name;
        item['disabled'] = disabled;
        item['price'] = item.cash_price;
        item['text'] = `${item.name} (${item.quantity} available)`;
        item['subtext'] = item.stock_take_in_progress && !this.takingStocks ? 'Store undergoing stock take' : null;

        return item;
      });
    },
    ...mapGetters([
      'getStoreProducts',
    ]),
  },
  watch: {

    getStoreProducts({ data }) {
      this.loading = false;
      this.products = data;
    },
  },

  methods: {
    ...mapActions([
      'setStoreProducts',
    ]),
    handleSearch: _.debounce(function (value) {
      if (value.length <= this.minInput) {
        this.products = [];
        this.menu = false;
        return;
      }

      this.loading = true;
      this.menu = true;
      this.search(value);

      const params = {
        store_id: this.storeId,
        no_pagination: true,
        is_consumable: this.isConsumable,
        search: value
      };


    }, 500),

    search: _.debounce(function search(search) {
      this.loading = true;

      const params = _.omitBy(this.params, _.isNil);

      this.setStoreProducts({
        search,
        params: params,
      });
    }, 700),
    async fetchProducts(params) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: [
              { name: 'Paracetamol', quantity: 15, id: 1, disabled: false },
              { name: 'Ibuprofen', quantity: 0, id: 2, disabled: !this.unDisableOutOfStock },
              { name: 'Aspirin', quantity: 5, id: 3, disabled: false }
            ]
          });
        }, 300);
      });
    },

    selectItem(item) {
      this.product = item;
      this.term = item.text;
      this.$emit('results', item);
      if (!this.keepSelected) {
        this.products = [];
        this.menu = false;
        // Clear the search term after emitting the results
        this.term = '';
      }
    }
  }
};
</script>
<style scoped>
.product-search-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Remove Vuetify underline */
.search-input .v-input__control::before,
.search-input .v-input__control::after {
  border-bottom: none !important;
}

/* Make it look like a Bootstrap form-control */
.search-input .v-input__control {
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 0 8px;
  height: 38px;
  background-color: #fff;
}

.search-input {
  margin: 0;
  padding: 0;
  flex: 1;
  min-width: 250px;
}

.search-input .v-input__slot {
  font-size: 14px;
}
</style>
