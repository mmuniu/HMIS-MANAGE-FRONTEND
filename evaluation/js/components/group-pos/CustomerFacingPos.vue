<template>
  <div class="customer-facing-pos fullscreen">
    <v-container fluid class="pa-0">
      <!-- Logo Banner Section -->
      <v-row class="ma-0">
        <v-col cols="12" class="pa-0">
          <div class="logo-banner d-flex align-center justify-center py-4">
            <img src="/images/xanalife.jpg" alt="Xanalife Logo" class="xanalife-logo">
          </div>
        </v-col>
      </v-row>

      <v-row class="ma-0">
        <!-- Banner Ads Section -->
        <v-col cols="12" md="6" class="pa-2">
          <div class="banner-section">
            <v-carousel
                cycle
                height="400"
                hide-delimiter-background
                show-arrows-on-hover
                delimiter-icon="mdi-circle"
                :interval="5000"
            >
              <v-carousel-item
                  v-for="(banner, i) in banners"
                  :key="i"
                  :src="banner.image"
              >
                <div class="carousel-text-overlay">
                  <div class="carousel-text">
                    {{ banner.text }}
                  </div>
                </div>
              </v-carousel-item>
            </v-carousel>
          </div>
        </v-col>

        <!-- Selected Items Section -->
        <v-col cols="12" md="6" class="pa-2">
          <div class="items-section">
            <v-card flat class="pa-4">
              <v-card-title class="text-h5 font-weight-bold primary--text">
                Your Order
              </v-card-title>

              <!-- Totals Summary Card -->
              <v-card outlined class="mb-4 totals-card">
                <v-card-text class="pa-0">
                  <!-- Subtotal Row -->
                  <div class="d-flex justify-space-between align-center py-2 px-4 totals-row">
                    <span class="text-subtitle-1">Subtotal:</span>
                    <span class="text-subtitle-1 font-weight-medium">{{ formatCurrency(subtotal) }}</span>
                  </div>

                  <!-- Discount Row (if applicable) -->
                  <div v-if="discount > 0" class="d-flex justify-space-between align-center py-2 px-4 totals-row discount-row">
                    <span class="text-subtitle-1">Discount:</span>
                    <span class="text-subtitle-1 font-weight-medium success--text">-{{ formatCurrency(discount) }}</span>
                  </div>

                  <!-- Tax Row (if applicable) -->
                  <div v-if="tax > 0" class="d-flex justify-space-between align-center py-2 px-4 totals-row">
                    <span class="text-subtitle-1">Tax:</span>
                    <span class="text-subtitle-1 font-weight-medium">{{ formatCurrency(tax) }}</span>
                  </div>

                  <!-- Divider before total -->
                  <v-divider></v-divider>

                  <!-- Total Payable Row -->
                  <div class="d-flex justify-space-between align-center py-3 px-4 total-payable-row">
                    <span class="text-h6 font-weight-bold">Total Payable:</span>
                    <span class="text-h6 font-weight-bold success--text" style="font-size: 2.25rem !important;">{{ formatCurrency(totalPayable) }}</span>
                  </div>
                </v-card-text>
              </v-card>
              <v-data-table
                  :headers="headers"
                  :items="getReversedItems"
                  item-key="id"
                  hide-default-footer
                  disable-pagination
                  class="elevation-0"
                  :items-per-page="-1"
              >
                <template v-slot:item.product="{ item }">
                  <div class="font-weight-medium">{{ item.product }}</div>
                </template>

                <template v-slot:item.quantity="{ item }">
                  <div class="d-flex align-center justify-center">
                    <v-btn icon small color="error" @click="decreaseQuantity(item)" class="mr-1">
                      <v-icon small>mdi-minus</v-icon>
                    </v-btn>
                    <span class="mx-2">{{ item.quantity }}</span>
                    <v-btn icon small color="success" @click="increaseQuantity(item)" class="ml-1">
                      <v-icon small>mdi-plus</v-icon>
                    </v-btn>
                  </div>
                </template>

                <template v-slot:item.price="{ item }">
                  <div class="text-right">{{ formatCurrency(item.price) }}</div>
                </template>

                <template v-slot:item.subtotal="{ item }">
                  <div class="text-right font-weight-bold">{{ formatCurrency(item.quantity * item.price) }}</div>
                </template>
              </v-data-table>

              <!-- Order Summary -->
              <v-divider class="my-4"></v-divider>

            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script>
export default {
  name: 'CustomerFacingPos',
  props: {
    selectedItems: {
      type: Array,
      default: () => []
    },
    totals: {
      type: Object,
      default: () => ({
        subtotal: 0,
        discount: 0,
        tax: 0,
        totalPayable: 0
      })
    },
    displayId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      socket: null,
      localItems: [],
      localTotals: { subtotal: 0, discount: 0, tax: 0, totalPayable: 0 },
      headers: [
        { text: 'Product', value: 'product', sortable: false },
        { text: 'Qty', value: 'quantity', align: 'center', sortable: false, width: '120px' },
        { text: 'Price', value: 'price', align: 'right', sortable: false },
      ],
      banners: [
        { image: '/images/banner1.jpg', text: '' },
        { image: '/images/banner2.jpg', text: '' },
        { image: '/images/banner3.jpg', text: '' },
      ],
      instanceId: null,
      isConnected: false,
      updateCheckInterval: null,
    };
  },
  computed: {
    getReversedItems() {
      return [...this.localItems].reverse();
    },
    discount() {
      return this.localTotals.discount || 0;
    },
    tax() {
      return this.localTotals.tax || 0;
    },
    subtotal() {
      return this.localTotals.subtotal || 0;
    },
    totalPayable() {
      return this.localTotals.totalPayable || 0;
    }
  },
  methods: {
    formatCurrency(value) {
      const num = parseFloat(value) || 0;
      return `KSH ${num.toFixed(2)}`;
    },
    increaseQuantity(item) {
      this.$emit('update-quantity', { item, quantity: item.quantity + 1 });
    },
    decreaseQuantity(item) {
      if (item.quantity > 1) {
        this.$emit('update-quantity', { item, quantity: item.quantity - 1 });
      }
    },

    /** Initialize socket.io safely */
    initializeSocket() {
      if (typeof window.io === 'undefined') {
        const script = document.createElement('script');
        script.src = '/js/socket.io.min.js';
        script.async = true;
        script.onload = () => this.connectSocket();
        document.head.appendChild(script);
      } else {
        this.connectSocket();
      }
    },
    getDeviceId() {
      let id = localStorage.getItem("pos_device_id");
      if (!id) {
        id = "pos-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
        localStorage.setItem("pos_device_id", id);
      }
      return id;
    },
    /** Connect to socket server */
    connectSocket() {
      const url = 'https://xanalife.afyanalytics.ai';
      this.instanceId =
          this.displayId && this.displayId.length > 0
              ? this.displayId
              : this.getDeviceId();

      this.socket = window.io(url, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
      });

      this.setupSocketListeners();
    },

    /** Setup listeners */
    setupSocketListeners() {
      if (!this.socket) return;

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.socket.emit('join-display', { displayId: this.instanceId });
        this.requestPosData();
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
      });

      this.socket.on(`pos-data-update-${this.instanceId}`, (data) => {
        this.handlePosDataUpdate(data);
      });

      this.socket.on('pos-data-update', (data) => {
        if (!data.displayId || data.displayId === this.instanceId) {
          this.handlePosDataUpdate(data);
        }
      });

      this.socket.on(`pos-clear-cart-${this.instanceId}`, () => {
        this.localItems = [];
        this.localTotals = { subtotal: 0, discount: 0, tax: 0, totalPayable: 0 };
      });

    },

    /** Handle updates from server */
    handlePosDataUpdate(data) {
      if (data?.selectedItems) {
        this.localItems = [...data.selectedItems];
      }
      if (data?.totals) {
        this.localTotals = { ...data.totals };
      }
    },

    /** Request latest data on connect */
    requestPosData() {
      if (this.socket && this.isConnected) {
        this.socket.emit('request-pos-data', { displayId: this.instanceId });
      }
    },

    /** Cleanup */
    cleanup() {
      if (this.socket) {
        this.socket.emit('leave-display', { displayId: this.instanceId });
        this.socket.disconnect();
        this.socket = null;
      }
      if (this.updateCheckInterval) {
        clearInterval(this.updateCheckInterval);
        this.updateCheckInterval = null;
      }
    }
  },
  mounted() {
    this.localItems = [...this.selectedItems];
    this.localTotals = { ...this.totals };
    // ✅ Grab displayId from query string
    const urlParams = new URLSearchParams(window.location.search);
    this.displayId = urlParams.get('displayId');

    console.log("Customer Display ID:", this.displayId);
    this.initializeSocket();

  },
  beforeDestroy() {
    this.cleanup();
  },
  watch: {
    selectedItems: {
      handler(newVal) {
        this.localItems = [...newVal];
      },
      deep: true
    },
    totals: {
      handler(newVal) {
        this.localTotals = { ...newVal };
      },
      deep: true
    },
    displayId(newVal) {
      if (newVal && this.socket) {
        this.socket.emit('leave-display', { displayId: this.instanceId });
        this.initializeSocket();
      }
    }
  }
};
</script>

<style scoped>
.customer-facing-pos {
  background-color: #f5f5f5;
}

.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  overflow-y: auto;
}

.logo-banner {
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

.xanalife-logo {
  height: 80px;
  max-width: 200px;
  object-fit: contain;
}

.banner-section {
  height: 100%;
}

.items-section {
  height: 100%;
  overflow-y: auto;
}

.v-data-table >>> th {
  font-size: 1.1rem !important;
}

.v-data-table >>> td {
  font-size: 1.1rem !important;
  height: 48px !important;
}
</style>
