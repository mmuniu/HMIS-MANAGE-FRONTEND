<template>
  <collabmed-loading v-if="!customers.data"></collabmed-loading>
  <div v-else>
    <v-row>
      <v-col cols="12" md="6">
        <div>
          <div class="my-5" style="font-size: 30px; font-weight: bold">{{ customer.full_name }}</div>

          <!-- Customer Points Display -->
          <v-card
            class="mx-auto v-card v-sheet theme--light elevation-2 rounded-0 points-card"
            color="primary"
            style="background-color: rgb(25, 118, 210) !important;color:white !important"
            dark
            elevation="3"
          >
            <v-card-text class="text-center">
              <div v-if="loading.points">
                <v-progress-circular indeterminate color="white"></v-progress-circular>
                <div class="mt-2">Loading points...</div>
              </div>
              <div v-else>
                <div style="font-size: 24px; font-weight: bold">
                  <v-icon large>mdi-star-circle</v-icon>
                  {{ customerPoints.total }} Points
                </div>
                <div class="mt-1">Customer Loyalty Points</div>
                                <div class="mt-4" v-if="customer && customerPoints">
                                  <v-text-field
                                    v-model.number="redeem.points"
                                    label="Points to Redeem"
                                    type="number"
                                    min="1"
                                    :max="customerPoints.total"
                                    dense
                                    outlined
                                    color="white"
                                    hide-details
                                    style="max-width: 220px; margin: 0 auto;disabled"
                                  />

                                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
        <div class="h6">
        </div>

        <div class="mt-7" style="width: 100%">
          <h4>Contact information: </h4>
          <div class="my-2">Mobile: {{ customer.mobile }}</div>
          <div class="my-2">Email: {{ customer.email }}</div>
          <div class="my-2">Id Number: {{ customer.id_no }}</div>
          <div v-if="customer.home_location" class="my-2">Home: {{ customer.home_location.name }}
            <a :href="'/reception/show-on-map?lat=' + customer.home_location.lat + '&long=' + customer.home_location.long" target="_blank">
              <button  class="pa-1 v-btn primary btn-xs btn_assign">
                <i class="fa fa-map"></i> show on map
              </button>
            </a>

          </div>
          <div v-if="customer.work_location" class="my-2">Work: {{ customer.work_location.name }}
            <a :href="'/reception/show-on-map?lat=' + customer.work_location.lat + '&long=' + customer.work_location.long" target="_blank">
              <button  class="pa-1 v-btn primary btn-xs btn_assign">
                <i class="fa fa-map"></i> show on map
              </button>
            </a>
          </div>
        </div>

        <div class="mt-7" style="width: 100%" v-if="customer.is_dependant">
          <h4>Is a dependant to:  </h4>
          <div class="my-2">
            <v-btn rounded small outlined
                   v-for="(dependsOn, index) in customer.is_dependant.depends_on"
                   :key="index"
                   class="mx-1"
                   :href="`/reception/customers/${dependsOn.id}/edit`"
                   color="primary">
              {{ dependsOn.name }}
            </v-btn>
          </div>
        </div>
      </v-col>
      <v-col cols="12" md="6">
        <div id="customerIdCard">
          <reception-customer-identity-card :customer-data="customer"></reception-customer-identity-card>
        </div>

        <v-card-actions>
          <div>
            <input type="file" id="file" ref="file" v-on:change="onChangeFileUpload()"/>
            <v-btn  small color="primary" @click="uploadImage()">upload image</v-btn>
          </div>
          <v-spacer/>
          <div>
            <v-btn  small color="primary" @click="printCustomersCard">print card</v-btn>
          </div>
        </v-card-actions>
      </v-col>
    </v-row>

  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import customerObj from '@reception/libs/patients/Patient';

export default {
  data: () => ({
    customer: null,
    redeem: { points: 0, loading: false },
    customerObj: new customerObj(),
    customerPoints: {
      total: 0,
      history: []
    },
    loading: {
      points: false
    },
    nokheaders: [
      { text: 'Name', value: 'full_name' },
      { text: 'Mobile', value: 'mobile' },
      { text: 'Relationship', value: 'relationship' },
    ],
    headers: [
      { text: 'Scheme', value: 'scheme_name' },
      { text: 'Policy number', value: 'policy_number' },
      { text: 'Principal', value: 'principal' },
    ],
  }),

  computed: {
    ...mapGetters({
      customers: 'getCustomers',
    }),
  },

  watch: {
    customers(val) {
      this.customer = val.data;
    },
  },

  methods: {
    ...mapActions([
      'setCustomers',
    ]),

    printCustomersCard() {
      window.open(`/reception/customers/card/${this.customer.id}/print-identity-card`, '_blank');
    },

    onChangeFileUpload() {
      this.customerObj.profile.image = this.$refs.file.files[0];
    },

    uploadImage() {
      this.customerObj.uploadImage(this.$route.params.patientId);
    },

    fetchCustomerPoints() {
      this.loading.points = true;
      axios.post('/api/finance/customer/points', {
        params: {
          customer_id: this.$route.params.patientId,
        }
      })
      .then(response => {
        if (response.data.success) {
          this.customerPoints.total = response.data.data.total_points;
          this.customerPoints.history = response.data.data.points;
        }
      })
      .catch(error => {
        console.error('Error fetching customer points:', error);
      })
      .finally(() => {
        this.loading.points = false;
      });
    },
    async redeemPoints() {
      if (!this.customer || this.redeem.points <= 0) return;
      this.redeem.loading = true;
      try {
        const { data } = await axios.post('/api/finance/customer/points/redeem', {
          customer_id: this.customer.id,
          points: this.redeem.points,
        });
        if (data.success) {
          this.$emit('points-redeemed', { points: this.redeem.points });
          this.redeem.points = 0;
          await this.fetchCustomerPoints();
          this.$toast && this.$toast.success('Points redeemed successfully');
        } else {
          this.$toast && this.$toast.error(data.message || 'Failed to redeem points');
        }
      } catch (e) {
        console.error(e);
        const msg = e?.response?.data?.message || 'Failed to redeem points';
        this.$toast && this.$toast.error(msg);
      } finally {
        this.redeem.loading = false;
      }
    }
  },

  created() {
    this.setCustomers({
      params: {
        customer_id: this.$route.params.patientId,
      },
    });

    this.fetchCustomerPoints();
  },
};
</script>

<style scoped>
.points-card {
  transition: all 0.3s ease;
}

.points-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
</style>
