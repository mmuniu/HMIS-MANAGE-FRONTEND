<template>
  <v-card v-if="initialised">
    <v-card-title>
      <h2 class="subheading my-0 py-0">Orders made from store</h2>
    </v-card-title>

    <v-divider class="my-0"></v-divider>

    <v-card-text>
      <v-data-table
          :headers="orders.headers" :items="orders.data"
          class="mb-3" flat hide-default-footer
      >
        <template v-slot:item.order_date="{ item }">
          {{ item.created_at }}
        </template>
        <template v-slot:item.status="{ item }">{{ item.received_status ? "Received" : item.status }}</template>
        <template v-slot:item.actions="{ item }">
          <v-btn
              :to="`/inventory/stores/${storeId}/order/${item.id}`"
              class="caption mx-0"
              color="blue"
              small dark
          >
            View
          </v-btn>

          <v-btn
              :to="`/inventory/stores/${storeId}/order/${item.id}/receive`"
              class="caption mx-0"
              :dark="!canReceive(item)"
              color="green"
              :disabled="canReceive(item)"
              small light
          >
            Receive
          </v-btn>


          <v-btn
              @click="printS11(item)"
              class="caption mx-0"
              :dark="!canReceive(item)"
              color="green"
              small dark
              v-if="item.received_status"
          >
            Print S-11 Form
          </v-btn>

          <v-btn
              @click="cancelOrder(item)"
              class="caption mx-0"
              v-if="item.status === 'pending'"
              color="red"
              small dark
          >
            Cancel
          </v-btn>
        </template>

        <template slot="footer" v-if="orders.links">
          <v-row  class="pt-3">
            <v-col cols="4" class="mt-3 ml-3">
              Total records: {{ orders.meta.total }}
            </v-col>

            <v-col cols="8" class="text-right">
              <v-pagination
                  v-model="page"
                  :length="orders.meta.last_page"
                  circle
                  :total-visible="8"
              ></v-pagination>
            </v-col>
          </v-row>
        </template>
      </v-data-table>
    </v-card-text>

  </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import InternalOrder from "@inventory/libs/stores/InternalOrder";

export default {
  name: "InternalOrdersIndex",

  data() {
    return {
      page: 1,
      orders: null,
      order: new InternalOrder(),
    };
  },

  watch: {
    getInternalOrders(orders) {
      this.orders = orders;
    },

    page(value) {
      this.setInternalOrders({
        page: value,
        params: {
          requesting_store: this.storeId,
        },
      });
    },
  },

  computed: {
    ...mapGetters([
      "getInternalOrders",
    ]),

    storeId() {
      return this.$route.params.storeId;
    },

    initialised() {
      return this.orders;
    },
  },

  methods: {
    ...mapActions([
      "setInternalOrders",
    ]),

    canReceive(order) {
      return order.received_status || order.status === "pending" || order.status === "cancelled";
    },

    printS11(item) {
      window.open(`/inventory/purchase/order/s11/details-print/${item.id}`);
    },

    initialise() {
      this.setInternalOrders({
        params: {
          requesting_store: this.storeId,
        },
      });
    },

    async cancelOrder(item) {
      await this.order.cancelInternalOrder(item, this.storeId);
      await this.initialise();
    },
  },

  mounted() {
    this.initialise();
  },
};
</script>
