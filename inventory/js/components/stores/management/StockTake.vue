
<template>
  <v-card>
    <v-card-title>
      <v-dialog v-model="dialog" persistent max-width="40%">
        <template v-slot:activator="{ on }">
          <v-btn small color="primary" v-on="on">Schedule stock take</v-btn>
        </template>
        <v-card>
          <v-card-title class="headline primary">Initiate stock take</v-card-title>
          <v-card-text>
            The stock take will be initiated only at the set time.
            <br/>
            <collabmed-date-time-picker outline
                                        @input="setScheduledAt"
                                        hide-details
                                        :datetime="scheduled_at" label="Scheduled at">
            </collabmed-date-time-picker>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error darken-1" @click="dialog = false">Cancel</v-btn>
            <v-btn color="primary darken-1" @click="scheduleStockTake()">Okay</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-title>

    <v-divider class="my-0"></v-divider>

    <v-card-text>
      <v-data-table
          :headers="headers"
          :items="getStockTake.data"
          class="mb-3"
          hide-default-footer
          :options.sync="options"
          :footer-props="{
            'items-per-page-options': [10, 25, 50, 100],
          }"
          flat
      >
        <template v-slot:item.status="{ item }">
          <span v-if="item.status === 'scheduled'" class="warning--text">{{ item.status }}</span>
          <span v-if="item.status === 'active'" class="purple--text">{{ item.status }}</span>
          <span v-if="item.status === 'cancelled'" class="red--text">{{ item.status }}</span>
          <span v-if="item.status === 'closing'" class="success--text">{{ item.status }}</span>
          <span v-if="item.status === 'closed'" class="primary--text">{{ item.status }}</span>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn small color="primary" :disabled="item.status === 'closed' || item.status === 'closing'"
                 v-if="item.can_take_stocks"  @click="takeStocks(item)">manage</v-btn>
          <v-btn small color="success" @click="viewStockTake(item)">view</v-btn>
        </template>
      </v-data-table>


    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import StockTake from "@inventory/libs/stores/StockTake";

export default {
  name: "StockTake",

  data() {
    return {
      page: 1,
      dialog: false,
      scheduled_at: "",
      stockTake: new StockTake(),
      headers: [
        { text: "store", value: "store.name" },
        { text: "Scheduled at", value: "scheduled_at" },
        { text: "Scheduled By", value: "user.full_name" },
        { text: "Status", value: "status" },
        { text: "Actions", value: "actions" },
      ],
      // Table options for pagination
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['created_at'],
        sortDesc: [true],
      },
    };
  },

  computed: {
    ...mapGetters([
      "getStockTake",
    ]),
  },

  methods: {
    ...mapActions([
      "setStockTake",
    ]),

    setScheduledAt(datetime) {
      this.stockTake.scheduled_at = datetime;
    },

    async scheduleStockTake() {
      const response = await this.stockTake.scheduleStockTake(this.$route.params.storeId);

      if (response) {
        this.dialog = false;
        this.initialise();
      }
    },

    takeStocks(item) {
      window.location = `/inventory/stores/${this.$route.params.storeId}/take-stocks/${item.id}`;
    },

    viewStockTake(item) {
      window.location = `/inventory/stores/${this.$route.params.storeId}/view-stock-take/${item.id}`;
    },

    updateData(page) {
      this.updateStocks(page);
    },

    updateStocks(page = null) {
      this.page = page;
      this.setStockTake({
        page: this.page,
        params: {
          store_id: this.$route.params.storeId,
        },
      });
    },

    initialise() {
      this.page = 1;
      this.setStockTake({
        params: {
          store_id: this.$route.params.storeId
        }
      });
    },
  },

  mounted() {
    this.initialise();
  },
};
</script>
