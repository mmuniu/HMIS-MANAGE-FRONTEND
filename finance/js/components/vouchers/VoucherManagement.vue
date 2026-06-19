<template>
  <v-card flat>
    <v-row>
      <v-col cols="12" md="3" class="px-2">
        <v-autocomplete
          :items="facilities.facilities"
          outline
          v-model="filters.facility_id"
          color="blue-grey lighten-2"
          label="Select Facility"
          item-text="name"
          clearable
          @click:clear="facilityCleared"
          item-value="id"
        ></v-autocomplete>
      </v-col> 
      <v-col cols="12" md="3" class="px-2">
        <collabmed-date-time-picker 
          outline 
          @input="setStartDate"
          :datetime="filters.start_date"
          label="Start date"
        ></collabmed-date-time-picker>
      </v-col>
      <v-col cols="12" md="3" class="px-2">
        <collabmed-date-time-picker 
          outline 
          @input="setEndDate"
          :datetime="filters.end_date" 
          label="End date"
        ></collabmed-date-time-picker>
      </v-col>
      <v-col>
        <v-btn color="primary" @click="init()" class="mx-3">filter</v-btn>
        <v-btn color="success" @click="downloadExcel" class="mx-3">Download Excel</v-btn>
      </v-col>
    </v-row>
    
    <v-card-title>
      <v-btn color="primary" small @click="showAddVoucherModal = true">
        <v-icon left>mdi-plus</v-icon> Add Voucher
      </v-btn>
      <v-btn color="success" small class="ml-2" @click="showDownloadVouchersModal = true">
        <v-icon left>mdi-download</v-icon> Download All Vouchers
      </v-btn>
    </v-card-title>
    
    <v-card-text>
      <collabmed-loading v-if="vouchers === null"></collabmed-loading>
      <v-data-table
        :headers="headers"
        :items="vouchers"
        :loading="loading"
        class="elevation-1"
        item-key="id"
        :items-per-page="10"
      >
        <template v-slot:item.reward="{ item }">
          {{ formatCurrency(item.reward) }}
        </template>
        <template v-slot:item.balance="{ item }">
          {{ formatCurrency(item.balance) }}
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip small>{{ capitalize(item.status) }}</v-chip>
        </template>
        <template v-slot:item.expiry_date="{ item }">
          {{ item.expiry_date ? item.expiry_date : 'N/A' }}
        </template>
        <template v-slot:item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn color="info" small class="ml-1" @click="showVoucherDetails(item)">
            <v-icon left>mdi-eye</v-icon> Show Voucher
          </v-btn>
          <v-btn color="success" small class="ml-1" @click="downloadSingleVoucher(item)">
            <v-icon left>mdi-download</v-icon> Download
          </v-btn>
        </template>
      </v-data-table>
    </v-card-text>

    <!-- Add Voucher Modal -->
    <v-dialog v-model="showAddVoucherModal" max-width="600px">
      <v-card>
        <v-card-title class="bg-info white--text">
          Add Voucher
          <v-spacer></v-spacer>
          <v-btn icon @click="showAddVoucherModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="addVoucherForm" v-model="addVoucherFormValid" lazy-validation>
            <v-select
              v-model="addVoucherForm.number"
              :items="numberOptions"
              label="Number"
              required
              @change="onNumberChange"
            ></v-select>

            <v-text-field
              v-if="addVoucherForm.number === 'one'"
              v-model="addVoucherForm.code"
              label="Voucher Code"
              readonly
              required
            ></v-text-field>

            <v-text-field
              v-if="addVoucherForm.number === 'multiple'"
              v-model="addVoucherForm.amount"
              label="Total Number of Vouchers"
              type="number"
              min="1"
              required
            ></v-text-field>

            <v-text-field
              v-model="addVoucherForm.usage_limit"
              label="Usage Limit"
              type="number"
              min="0"
            ></v-text-field>

            <v-text-field
              v-model="addVoucherForm.reward"
              label="Reward Amount"
              type="number"
              step="0.01"
              required
            ></v-text-field>

            <v-textarea
              v-model="addVoucherForm.description"
              label="Description"
              rows="3"
            ></v-textarea>

            <v-menu
              ref="expiryDateMenu"
              v-model="expiryDateMenu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="addVoucherForm.expiry_date"
                  label="Expiry Date"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker 
                v-model="addVoucherForm.expiry_date" 
                no-title 
                scrollable 
                @input="expiryDateMenu = false"
              ></v-date-picker>
            </v-menu>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showAddVoucherModal = false">Close</v-btn>
          <v-btn color="primary" :disabled="!addVoucherFormValid" @click="submitAddVoucher">Save Voucher</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Holiday Voucher Modal (Fullscreen Landscape) -->
    <v-dialog v-model="showVoucherModal" fullscreen hide-overlay transition="dialog-bottom-transition" v-if="showHolidayVoucher">
      <v-card class="holiday-voucher-modal">
        <!-- Close button at top right -->
        <div class="holiday-modal-header">
          <div class="header-content">
            <h3 class="modal-title">Holiday Voucher - {{ voucher.code }}</h3>
            <v-btn 
              icon 
              large 
              class="close-btn" 
              @click="closeVoucherModal"
              color="grey darken-2"
            >
              <v-icon large>mdi-close</v-icon>
            </v-btn>
          </div>
          <div class="header-actions">
            <v-btn color="primary" @click="downloadCurrentVoucher" class="action-btn">
              <v-icon left>mdi-download</v-icon> Download
            </v-btn>
            <v-btn color="secondary" @click="printCurrentVoucher" class="action-btn ml-2">
              <v-icon left>mdi-printer</v-icon> Print
            </v-btn>
          </div>
        </div>
        
        <v-container fluid class="holiday-voucher-container">
          <div class="voucher-fullscreen-wrapper" ref="holidayVoucherDisplay">
            <XanaVoucher
              :qr-code-path="holidayVoucherQrCode"
              :voucher-code="voucher.code"
              :expiry-date="voucher.expiry_date"
              :amount="parseFloat(voucher.reward)"
              ref="holidayVoucherComponent"
            />
          </div>
        </v-container>
        
        <!-- Close hint at bottom -->
        <div class="close-hint">
          <v-icon small class="mr-1">mdi-arrow-up</v-icon>
          Click the X at the top right to return to voucher list
        </div>
      </v-card>
    </v-dialog>

    <!-- Regular Voucher Modal -->
    <v-dialog v-model="showVoucherModal" max-width="450px" v-else>
      <v-card>
        <v-card-title class="bg-gradient-info white--text">
          Voucher Details
          <v-spacer></v-spacer>
          <v-btn icon @click="closeVoucherModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="text-center" style="min-height: 150px;">
          <div v-if="voucherLoading" class="text-muted">
            <v-progress-circular indeterminate color="primary" size="40"></v-progress-circular>
            <p>Loading voucher details...</p>
          </div>
          
          <div v-else class="voucher-regular-container">
            <div class="voucher-display" ref="voucherDisplay">
              <img src="/xanalogo.png" alt="Xana Life Logo" class="voucher-logo" />
              <h2 class="voucher-title">VOUCHER</h2>
              <div class="voucher-icons">
                <img src="/groceries_view.png" alt="Groceries" />
                <img src="/pharmacy_view.png" alt="Pharmacy" />
                <img src="/bulk_buy_view.png" alt="Bulk Buy" />
                <img src="/wine_shop_view.png" alt="Wine Shop" />
                <img src="/deli_view.png" alt="Deli" />
              </div>
              <div class="voucher-reward">
                <p>
                  Get <strong>Ksh. {{ voucher.reward }}</strong> for every 
                  <strong>Ksh. {{ voucher.usage_limit }}</strong> spent
                </p>
                <h2>Ksh {{ voucher.usage_limit }}</h2>
              </div>
              <div class="qr-code-container">
                <img :src="'https://quickchart.io/qr?text=' + voucher.code + '&size=200'" 
                     ref="qrImage" 
                     class="qr-image" />
              </div>
              <div class="voucher-code">
                Code: {{ voucher.code }}
              </div>
            </div>
            <v-btn color="primary" small @click="downloadCurrentVoucher" class="mt-3">
              <v-icon left>mdi-download</v-icon> Download This Voucher
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Download Vouchers Modal -->
    <v-dialog v-model="showDownloadVouchersModal" max-width="400px">
      <v-card>
        <v-card-title class="bg-info white--text">
          Download Vouchers
          <v-spacer></v-spacer>
          <v-btn icon @click="showDownloadVouchersModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="downloadVouchersForm" v-model="downloadVouchersFormValid" lazy-validation>
            <v-text-field
              v-model="downloadFilters.created_at"
              label="Created At"
              type="date"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDownloadVouchersModal = false">Close</v-btn>
          <v-btn color="success" :disabled="!downloadVouchersFormValid || downloading" @click="downloadAllVouchers">
            <v-progress-circular v-if="downloading" indeterminate size="20" color="white" class="mr-2"></v-progress-circular>
            <v-icon v-else left>mdi-download</v-icon> Download All
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Hidden container for holiday voucher downloads -->
    <div v-if="showHolidayVoucher" class="hidden-voucher-download">
      <XanaVoucher
        ref="holidayVoucherDownload"
        :qr-code-path="holidayVoucherQrCode"
        :voucher-code="downloadVoucher.code"
        :expiry-date="downloadVoucher.expiry_date"
        :amount="parseFloat(downloadVoucher.reward)"
      />
    </div>

    <!-- Hidden container for regular voucher downloads -->
    <div v-else style="position: absolute; left: -9999px; top: -9999px;" class="voucher-display" ref="downloadVoucherDisplay">
      <img src="/xanalogo.png" alt="Xana Life Logo" class="voucher-logo" />
      <h2 class="voucher-title">VOUCHER</h2>
      <div class="voucher-icons">
        <img src="/groceries_view.png" alt="Groceries" />
        <img src="/pharmacy_view.png" alt="Pharmacy" />
        <img src="/bulk_buy_view.png" alt="Bulk Buy" />
        <img src="/wine_shop_view.png" alt="Wine Shop" />
        <img src="/deli_view.png" alt="Deli" />
      </div>
      <div class="voucher-reward">
        <p>
          Get <strong>Ksh. {{ downloadVoucher.reward }}</strong> for every 
          <strong>Ksh. {{ downloadVoucher.usage_limit }}</strong> spent
        </p>
        <h2>Ksh {{ downloadVoucher.usage_limit }}</h2>
      </div>
      <div class="qr-code-container">
        <img ref="downloadQrImage" class="qr-image" />
      </div>
      <div class="voucher-code">
        Code: {{ downloadVoucher.code }}
      </div>
    </div>
  </v-card>
</template>

<script>
import html2canvas from 'html2canvas';
import moment from 'moment';
import { mapGetters } from 'vuex';
import XanaVoucher from './XanaVoucher.vue';

export default {
  name: 'VoucherManagement',
  components: {
    XanaVoucher
  },
  data() {
    return {
      vouchers: [],
      filename: 'Voucher Management Report',
      loading: false,
      downloading: false,
      showAddVoucherModal: false,
      showVoucherModal: false,
      showDownloadVouchersModal: false,
      voucherLoading: false,
      voucher: {},
      downloadVoucher: {},
      holidayVoucherQrCode: '',
      
      filters: {
        facility_id: null,
        start_date: null,
        end_date: null,
        page: 1,
      },
      addVoucherForm: {
        number: '',
        code: '',
        amount: null,
        usage_limit: null,
        reward: null,
        description: '',
        expiry_date: null,
      },
      addVoucherFormValid: false,
      downloadFilters: {
        created_at: '',
      },
      downloadVouchersFormValid: false,
      expiryDateMenu: false,
      headers: [
        { text: '#', value: 'index', sortable: false },
        { text: 'Reward', value: 'reward' },
        { text: 'Balance', value: 'balance' },
        { text: 'Description', value: 'description' },
        { text: 'Condition', value: 'condition' },
        { text: 'Usage Limit', value: 'usage_limit' },
        { text: 'Status', value: 'status' },
        { text: 'Expiry Date', value: 'expiry_date' },
        { text: 'Times Used', value: 'times_used' },
        { text: 'Date Created', value: 'created_at' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      numberOptions: [
        { text: '-- Select --', value: '' },
        { text: 'One', value: 'one' },
        { text: 'Multiple', value: 'multiple' },
      ],
    };
  },
  computed: {
    ...mapGetters({
      facilities: "getFacilities",
      users: "getUsers",
    }),
    
    // Check if current date is between Dec 20 and Jan 3
    showHolidayVoucher() {
      const today = new Date();
      const currentYear = today.getFullYear();
      const nextYear = currentYear + 1;
      
      // Create date objects for the holiday period
      const holidayStart = new Date(currentYear, 11, 20); // Dec 20 of current year
      const holidayEnd = new Date(nextYear, 0, 3); // Jan 3 of next year
      
      // If we're in January, adjust the start year
      if (today.getMonth() === 0) { // January
        holidayStart.setFullYear(currentYear - 1);
      }

      console.log('holidays are here with us');
      
      return today >= holidayStart && today <= holidayEnd;
    },
  },
  mounted() {
    this.fetchVouchers();
  },
  methods: {
    fetchVouchers() {
      this.loading = true;
      axios.get('/api/finance/vouchers')
        .then(response => {
          this.vouchers = response.data.vouchers.map((v, index) => ({ ...v, index: index + 1 }));
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    
    setStartDate: function(datetime) {
      this.filters.start_date = datetime;
    },

    setEndDate: function(datetime) {
      this.filters.end_date = datetime;
    },
    
    formatCurrency(value) {
      if (value == null) return '-';
      return Number(value).toFixed(2);
    },
    
    formatDate(date) {
      if (!date) return 'N/A';
      return moment(date).format('Do MMM YYYY, h:mm a');
    },
    
    capitalize(text) {
      if (!text) return '';
      return text.charAt(0).toUpperCase() + text.slice(1);
    },
    
    printUrl(voucherId, paperSize = 'a4') {
      return `/finance/vouchers/print/${voucherId}?paper_size=${paperSize}`;
    },
    
    onNumberChange() {
      if (this.addVoucherForm.number === 'one') {
        this.addVoucherForm.code = this.generateCode();
      } else {
        this.addVoucherForm.code = '';
      }
    },
    
    generateCode() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 7; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },
    
    submitAddVoucher() {
      if (!this.$refs.addVoucherForm.validate()) return;

      const payload = {
        number: this.addVoucherForm.number,
        code: this.addVoucherForm.code,
        amount: this.addVoucherForm.amount,
        usage_limit: this.addVoucherForm.usage_limit,
        reward: this.addVoucherForm.reward,
        description: this.addVoucherForm.description,
        expiry_date: this.addVoucherForm.expiry_date,
      };

      axios.post('/api/finance/vouchers', payload)
        .then(() => {
          this.showAddVoucherModal = false;
          this.fetchVouchers();
          this.resetAddVoucherForm();
        })
        .catch(error => {
          alert('Error creating voucher: ' + (error.response?.data?.message || error.message));
        });
    },
    
    resetAddVoucherForm() {
      this.addVoucherForm = {
        number: '',
        code: '',
        amount: null,
        usage_limit: null,
        reward: null,
        description: '',
        expiry_date: null,
      };
      this.addVoucherFormValid = false;
    },
    
    showVoucherDetails(voucher) {
      this.voucherLoading = true;
      this.showVoucherModal = true;
      this.voucher = { ...voucher };
      
      // Generate QR code URL for holiday voucher
      this.holidayVoucherQrCode = `https://quickchart.io/qr?text=${voucher.code}&size=200`;
      
      this.$nextTick(() => {
        setTimeout(() => {
          if (!this.showHolidayVoucher) {
            this.generateQRCode(this.voucher.code);
          }
          this.voucherLoading = false;
        }, 100);
      });
    },
    
    closeVoucherModal() {
      this.showVoucherModal = false;
      this.voucher = {};
    },
    
    generateQRCode(code = this.voucher.code) {
      const img = this.$refs.qrImage;
      if (!img) return;
      img.src = `https://quickchart.io/qr?text=${code}&size=200`;
    },
    
    downloadCurrentVoucher() {
      if (this.showHolidayVoucher) {
        this.downloadHolidayVoucher();
      } else {
        this.downloadRegularVoucher();
      }
    },
    
    downloadHolidayVoucher() {
      const voucherElement = this.$refs.holidayVoucherDownload?.$el;
      if (!voucherElement) return;
      
      html2canvas(voucherElement, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: null
      }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `Xana_Holiday_Voucher_${this.voucher.code}.png`;
        link.click();
      });
    },
    
    downloadRegularVoucher() {
      const voucherElement = this.$refs.voucherDisplay;
      if (!voucherElement) return;
      
      html2canvas(voucherElement, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: null
      }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `Xana_Voucher_${this.voucher.code}.png`;
        link.click();
      });
    },
    
    printCurrentVoucher() {
      if (this.showHolidayVoucher) {
        // For holiday voucher, use the component's print method
        if (this.$refs.holidayVoucherComponent && this.$refs.holidayVoucherComponent.printVoucher) {
          this.$refs.holidayVoucherComponent.printVoucher();
        } else {
          // Fallback to window print
          window.print();
        }
      } else {
        // For regular voucher
        window.print();
      }
    },
    
    chunkArray(array, size) {
      const chunks = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    },
    
    downloadAllVouchers() {
      if (!this.downloadFilters.created_at) {
        alert('Please select a date.');
        return;
      }
      
      this.downloading = true;
      axios.post('/api/finance/all/vouchers', { created_at: this.downloadFilters.created_at })
        .then(response => {
          const vouchers = response.data.vouchers || [];

          if (vouchers.length === 0) {
            alert('No vouchers found for the given date.');
            this.downloading = false;
            return;
          }
          
          const chunks = this.chunkArray(vouchers, 5);
          let chunkIndex = 0;

          const processChunk = () => {
            if (chunkIndex >= chunks.length) {
              this.downloading = false;
              return;
            }
            
            const chunk = chunks[chunkIndex];
            let processed = 0;
            const total = chunk.length;
            
            chunk.forEach((voucher, index) => {
              this.downloadVoucher = voucher;
              
              this.$nextTick(() => {
                if (this.showHolidayVoucher) {
                  // Generate holiday voucher QR code
                  this.generateHolidayDownloadQRCode(voucher.code);
                } else {
                  // Generate regular voucher QR code
                  this.generateDownloadQRCode(voucher.code);
                }
                
                this.$nextTick(() => {
                  const downloadContainer = this.showHolidayVoucher 
                    ? this.$refs.holidayVoucherDownload?.$el 
                    : this.$refs.downloadVoucherDisplay;
                  
                  if (!downloadContainer) return;
                  
                  html2canvas(downloadContainer, { 
                    scale: 2, 
                    useCORS: true,
                    backgroundColor: null
                  }).then(canvas => {
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL('image/png');
                    link.download = `Voucher_${voucher.code}.png`;
                    link.click();
                    
                    processed++;
                    if (processed === total) {
                      chunkIndex++;
                      processChunk(); // Process next chunk
                    }
                  });
                });
              });
            });
          };
          
          processChunk();
        })
        .catch(() => {
          alert('Error fetching vouchers.');
          this.downloading = false;
        });
    },
    
    generateDownloadQRCode(code = this.downloadVoucher.code) {
      return new Promise((resolve) => {
        const img = this.$refs.downloadQrImage;
        if (!img) {
          resolve();
          return;
        }
        img.onload = () => resolve();
        img.src = `https://quickchart.io/qr?text=${code}&size=200`;
      });
    },
    
    generateHolidayDownloadQRCode(code = this.downloadVoucher.code) {
      // For holiday voucher, we just need to update the QR code in the component
      this.holidayVoucherQrCode = `https://quickchart.io/qr?text=${code}&size=200`;
      return Promise.resolve();
    },
    
    waitForImages(container) {
      return new Promise((resolve) => {
        const images = container.querySelectorAll('img');
        let loadedCount = 0;
        const totalImages = images.length;
        
        if (totalImages === 0) {
          resolve();
          return;
        }
        
        images.forEach(img => {
          if (img.complete) {
            loadedCount++;
            if (loadedCount === totalImages) resolve();
          } else {
            img.onload = () => {
              loadedCount++;
              if (loadedCount === totalImages) resolve();
            };
            img.onerror = () => {
              loadedCount++;
              if (loadedCount === totalImages) resolve();
            };
          }
        });
      });
    },

    url(page = 1) {
      const params = [
        `start_date=${this.filters.start_date}`,
        `end_date=${this.filters.end_date}`,      
        `facility_id=${this.filters.facility_id}`,      
        `page=${page}`
      ].join('&');

      return `/finance/vouchers?${params}`;
    },

    async init() {
      const url = this.url(this.filters.page || 1);
      try {
        const response = await axios.get(url);
        this.vouchers = response.data.vouchers;
      } catch (error) {
        console.error('Error fetching POS sales:', error);
      }
    },

    async downloadExcel() {
      try {
        const response = await axios.post(this.export_url(), this.filters, {
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', this.filename + '.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading Excel:', error);
        alert('Error downloading Excel file.');
      }
    },

    export_url(page = 1) {
      return "/api/finance/download/vouchers";
    },

    facilityCleared() {
      this.filters.facility_id = null;
    },
    
    downloadSingleVoucher(voucher) {
      this.downloadVoucher = { ...voucher };
      
      this.$nextTick(() => {
        if (this.showHolidayVoucher) {
          this.generateHolidayDownloadQRCode(voucher.code).then(() => {
            this.downloadSingleHolidayVoucher();
          });
        } else {
          this.generateDownloadQRCode(voucher.code).then(() => {
            this.downloadSingleRegularVoucher();
          });
        }
      });
    },
    
    downloadSingleHolidayVoucher() {
      const voucherContainer = this.$refs.holidayVoucherDownload?.$el;
      if (!voucherContainer) return;
      
      this.waitForImages(voucherContainer).then(() => {
        html2canvas(voucherContainer, { 
          scale: 2, 
          useCORS: true,
          backgroundColor: null
        }).then(canvas => {
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = `Xana_Holiday_Voucher_${this.downloadVoucher.code}.png`;
          link.click();
        });
      });
    },
    
    downloadSingleRegularVoucher() {
      const voucherContainer = this.$refs.downloadVoucherDisplay;
      if (!voucherContainer) return;
      
      this.waitForImages(voucherContainer).then(() => {
        html2canvas(voucherContainer, { 
          scale: 2, 
          useCORS: true,
          backgroundColor: null
        }).then(canvas => {
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = `Voucher_${this.downloadVoucher.code}.png`;
          link.click();
        });
      });
    },
  },
};
</script>

<style scoped>
.bg-gradient-info {
  background: linear-gradient(90deg, #17a2b8, #138496);
}

/* Holiday Voucher Modal Styling */
.holiday-voucher-modal {
  background-color: #f5f7fa;
  height: 100vh;
  overflow: hidden;
}

/* Custom header with close button */
.holiday-modal-header {
  background-color: white;
  padding: 15px 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  position: relative;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.close-btn {
  background-color: #f8f9fa !important;
  border-radius: 50%;
  width: 50px !important;
  height: 50px !important;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: #e9ecef !important;
  transform: scale(1.1);
}

.close-btn:active {
  transform: scale(0.95);
}

.header-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.action-btn {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

/* Holiday voucher container */
.holiday-voucher-container {
  height: calc(100vh - 170px) !important;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.voucher-fullscreen-wrapper {
  width: 70% !important;
  max-width: 1000px;
  margin: 0 auto;
  transform: scale(1.05);
  transform-origin: center;
  transition: transform 0.3s ease;
}

.voucher-fullscreen-wrapper:hover {
  transform: scale(1.08);
}

/* Close hint */
.close-hint {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.9rem;
  color: #6c757d;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px 20px;
  border-radius: 20px;
  margin: 0 auto;
  width: fit-content;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}

/* Regular Voucher Styling */
.voucher-regular-container {
  padding: 10px;
  border-radius: 8px;
  background: #f5f5f5;
}

.voucher-display {
  font-family: Arial, sans-serif;
  text-align: center;
  padding: 20px;
  background: #ff9800;
  border-radius: 12px;
  max-width: 400px;
  margin: auto;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  color: #333;
}

.voucher-logo {
  max-width: 200px;
  height: auto;
  margin-bottom: 5px;
}

.voucher-title {
  margin: 20px 0;
  font-size: 28px;
  font-weight: bold;
  color: #fff;
}

.voucher-icons {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin: 15px 0;
}

.voucher-icons img {
  width: 60px;
  height: 80px;
  object-fit: cover;
}

.voucher-reward {
  background: #ff9800;
  padding: 15px;
  border-radius: 8px;
  color: white;
  margin: 20px 0;
}

.voucher-reward p {
  margin: 0;
  font-size: 14px;
}

.voucher-reward h2 {
  margin: 10px 0 0;
  font-size: 26px;
}

.qr-code-container {
  margin: 20px auto;
  display: inline-block;
  border: 4px solid #fff;
  padding: 6px;
  border-radius: 10px;
  background: #fff;
}

.qr-image {
  width: 200px;
  height: 200px;
}

.voucher-code {
  margin-top: 10px;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.hidden-voucher-download {
  position: absolute;
  left: -9999px;
  top: -9999px;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .voucher-fullscreen-wrapper {
    width: 80% !important;
    transform: scale(1);
  }
}

@media (max-width: 992px) {
  .voucher-fullscreen-wrapper {
    width: 90% !important;
    transform: scale(0.95);
  }
}

@media (max-width: 768px) {
  .voucher-fullscreen-wrapper {
    width: 95% !important;
    transform: scale(0.9);
  }
  
  .holiday-modal-header {
    padding: 10px 15px;
  }
  
  .modal-title {
    font-size: 1.1rem;
  }
  
  .close-btn {
    width: 40px !important;
    height: 40px !important;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-btn {
    width: 100%;
  }
  
  .close-hint {
    font-size: 0.8rem;
    padding: 8px 15px;
    bottom: 10px;
  }
}

@media (max-width: 480px) {
  .voucher-fullscreen-wrapper {
    transform: scale(0.8);
  }
  
  .holiday-voucher-container {
    height: calc(100vh - 200px) !important;
  }
}
</style>