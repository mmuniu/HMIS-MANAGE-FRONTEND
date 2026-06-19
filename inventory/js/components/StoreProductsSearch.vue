<template>
  <v-autocomplete outline single-line clearable
                  placeholder="Search and select product"
                  :hint="`Enter ${minInput + 1} or more characters`"
                  class="mb-4"
                  :items="filteredProducts" item-text="name"
                  v-model="product"
                  hide-no-data
                  return-object
                  @change="selectItem()"
                  :search-input.sync="term"
                  :loading="loading"
                  :disabled="disabled"
  >
    <template slot="item" slot-scope="{ item }">
      <v-list-item-content>
        <v-list-item-title class="caption">{{ item.text }}   <span v-if="item.lot_no">(Lot no: {{ item.lot_no }})</span></v-list-item-title>
        <v-list-item-title class="caption red--text" v-if="item.subtext">{{ item.subtext }}</v-list-item-title>
      </v-list-item-content>
    </template>
  </v-autocomplete>
</template>

<script>
import _ from 'lodash';
import {mapGetters, mapActions} from 'vuex';

export default {
  name: 'store-products-search',

  props: {
    storeId: {
      default: null,
    },
    isPharmacy: {
      default: false,
    },

    disabled: {
      default: false,
    },

    keepSelected: {
      default: null,
    },

    takingStocks: {
      default: false,
    },

    unDisableOutOfStock: {
      type: Boolean,
      default: false,
    },

    isConsumable: {
      default: null,
    },
  },

  data() {
    return {
      term: '',
      product: null,
      products: [],
      loading: false,
      minInput: 2,
      params: {
        store_id: this.storeId,
        no_pagination: true,
        is_consumable: this.isConsumable,
        is_pharmacy: this.isPharmacy,
      },
    };
  },

  watch: {
    storeId(val) {
      this.params.store_id = val;
    },
    term(value) {
      if (value && value.length > this.minInput && this.product === null) {
        this.search(value);
      }
    },

    getStoreProducts({data}) {
      this.loading = false;
      this.products = data;
      if (this.filteredProducts.length === 1) {
        this.product = this.filteredProducts[0];
        this.selectItem();
      }
    },
  },


  computed: {
    ...mapGetters([
      'getStoreProducts',
    ]),

    filteredProducts() {
      return _.map(this.products, (item) => {
        let disabled = item.disabled;

        if (this.takingStocks || this.unDisableOutOfStock) {
          disabled = false;
        }
        item['disabled'] = disabled;
        item['text'] = `${item.name} (${item.quantity} available)`;
        item['subtext'] = item.stock_take_in_progress && !this.takingStocks ? 'Store undergoing stock take' : null;

        return item;
      });
    },
  },

  methods: {
    ...mapActions([
      'setStoreProducts',
    ]),

    search: _.debounce(function search(search) {
      this.loading = true;
      const params = _.omitBy(this.params, _.isNil);

      this.setStoreProducts({
        search,
        params: params,
      });
    }, 700),

    selectItem() {
      this.$emit('results', this.product);

      if (!this.keepSelected) {
        this.products = [];
        this.product = null;
      }
    },
  },
};
</script>
