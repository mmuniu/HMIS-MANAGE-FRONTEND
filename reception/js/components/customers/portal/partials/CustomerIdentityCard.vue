<template>
  <v-card elevation="2" class="mx-auto"
          max-width="500"
          v-if="customer"
          max-height="500"
          tile>
    <v-card-title class="white--text" style="background-color: #1976d2 !important">
      Customer Identity Card
      <v-spacer/>
      <span style="font-size: 12px">ID: {{ customer.id_no }}</span>
    </v-card-title>
    <v-row class="px-5 pb-3">
      <v-col class="pa-0" cols="12" md="4">
        <v-avatar
            class="profile mt-2"
            color="grey"
            size="164"
            tile
        >
          <v-img :src="customer.image ? customer.image : '/img/placeholder.png'"></v-img>
        </v-avatar>
      </v-col>
      <v-col class="py-0" md="8" cols="12">
        <div class="subtitle-2 pt-1">Name: <span style="font-weight: bold">{{ customer.full_name }}</span></div>
        <div class="subtitle-2 pt-1">Gender: <span style="font-weight: bold">{{ customer.sex }}</span></div>
        <div class="subtitle-2 pt-1">Locale:
          <span>{{ customer.home_location ? customer.home_location.name : customer.town }}</span>
        </div>
        <div>
          <qrcode :value="customer.system_id" format="code128" v-if="customer.system_id" :options="{ width: 120 }">
            Unable to load QR Code
          </qrcode>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>
<script>
import VueQrcode from '@chenfengyuan/vue-qrcode';
export default {
  props: [
    'customerData', 'customerJson',
  ],

  components: {
    'qrcode': VueQrcode,
  },

  data: () => ({
    customer: null,
  }),

  created() {
    this.customer = this.customerData ? this.customerData : JSON.parse(this.customerJson);
  },
}
</script>
