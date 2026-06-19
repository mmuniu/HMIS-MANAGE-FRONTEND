<template>
  <div>
      <v-card>
          <v-card-title height="23">
              <h4>Invoice Summary</h4>
          </v-card-title>
          <invoice-report-filter :obj="obj" @filter="performFilter()"></invoice-report-filter>
          
          <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
          
          <template>
              <v-data-table
                  :headers="list.headers"
                  :items="list.data"
                  class="elevation-1"
                  hide-default-footer
                  :items-per-page="-1"
              >
                  <!-- Custom slot for Sent to Dynamics column -->
                  <template v-slot:item.sent_to_dynamics="{ item }">
                      <v-chip
                          :color="getDynamicsStatusColor(item.sent_to_dynamics)"
                          small
                          outlined
                      >
                          {{ item.sent_to_dynamics }}
                      </v-chip>
                  </template>

                  <!-- Custom slot for Response from Dynamics column -->
                  <template v-slot:item.dynamics_response="{ item }">
                      {{ item.dynamics_response }}
                  </template>

                  <!-- Custom slot for items_sent_count column -->
                  <template v-slot:item.items_sent_count="{ item }">
                                
                      <span class="clickable-count" style="color: #1976d2; cursor: pointer; text-decoration: underline;" @click="view(item)">
                      <!-- <span class="clickable-count" style="color: #1976d2; cursor: pointer; text-decoration: underline;" @click="openSalesLineModal(item)"> -->
                          {{ item.items_sent_count }}
                      </span>
                  </template>
        <!-- v-model="salesLineModal" -->

              <v-dialog v-model="salesLineModal" max-width="800px" persistent>
                  <v-card>
                      <v-card-title>
                          Sales Line Items
                          <v-spacer></v-spacer>
                          <v-btn icon @click="closeSalesLineModal">
                              <v-icon>mdi-close</v-icon>
                          </v-btn>
                      </v-card-title>
                      <v-card-text>
                          <v-progress-linear v-if="salesLineLoading" indeterminate color="primary"></v-progress-linear>
                          <v-simple-table v-else>
                              <thead>
                                  <tr>
                                      <th>Item Name</th>
                                      <th>Status</th>
                                      <th>BC Response</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr v-for="line in salesLineItems" :key="line.id || line.line_id">
                                      <td>{{ line.item_name || line.name }}</td>
                                      <td>
                                          <v-chip :color="line.sent_to_bc ? 'success' : 'grey'" small outlined>
                                              {{ line.sent_to_bc ? 'Sent' : 'Not Sent' }}
                                          </v-chip>
                                      </td>
                                      <td>{{ line.bc_response || '-' }}</td>
                                  </tr>
                                  <tr v-if="!salesLineItems.length">
                                      <td colspan="3" class="text-center">No sales line items found.</td>
                                  </tr>
                              </tbody>
                          </v-simple-table>
                      </v-card-text>
                  </v-card>
              </v-dialog>

                  <!-- Custom slot for Response from Dynamics column -->
                  <!-- <template v-slot:item.dynamics_response="{ item }">
                      <v-chip
                          :color="getDynamicsStatusColor(item.sent_to_dynamics)"
                          small
                          outlined
                      >
                          {{ item.sent_to_dynamics }}
                      </v-chip>
                  </template> -->

                  <!-- Custom slot for Actions column -->
                  <template v-slot:item.actions="{ item }">
                      <v-btn
                          v-if="item.actions && item.actions.can_post"
                          color="primary"
                          small
                          :loading="postingInvoice === item.actions.invoice_id"
                          @click="postToDynamics(item)"
                      >
                          <v-icon left small>mdi-send</v-icon>
                          Post
                      </v-btn>
                      <v-tooltip v-else-if="item.actions" bottom>
                          <template v-slot:activator="{ on }">
                              <v-chip small color="success" outlined v-on="on">
                                  <v-icon left small>mdi-check</v-icon>
                                  Posted
                              </v-chip>
                          </template>
                          <span>Already posted to Dynamics</span>
                      </v-tooltip>
                  </template>
              </v-data-table>
              
              <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
          </template>
      </v-card>
      <!-- <v-card>
        <v-card-title>
          <h4>Invoice Analytics Graph</h4>
        </v-card-title>
        <invoice-analytics-graph :obj="obj" @filter="performFilter()"></invoice-analytics-graph>
      </v-card> -->
    <!-- Welcome Modal -->
    <v-dialog v-model="welcomeModal" :style="'width:66vw'">
      <v-card>
          <v-card-title>
                Dynamics Sales Line Items
              <v-spacer></v-spacer>
              <v-btn icon @click="closeWelcomeModal">
                  <v-icon>mdi-close</v-icon>
              </v-btn>
          </v-card-title>
            <v-card-text>
                <v-data-table
                    :headers="[
                        { text: '#', value: 'col1' },
                        { text: 'Item Name', value: 'col2' },
                        { text: 'Amount', value: 'col3' },
                        { text: 'Status', value: 'col4' },
                        { text: 'Dynamics Response', value: 'col5' }
                    ]"
                    :items="[
                                                ...salesLineItems.map((item, idx) => ({
                                                    col1: idx + 1,
                                                    col2: item.description || item.name || '-',
                                                    col3: item.amount_incl_vat || '-',
                                                    col4: item.status == 'success' ? 'Sent' : 'Not Sent',
                                                    col5: item.response || '-'
                                                }))
                    ]"
                    class="elevation-1"
                    hide-default-footer
                >
                </v-data-table>
            </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filter from "./Filters";
import InvoiceAnalyticGraph from "./InvoiceAnalyticGraph.vue";

export default {

  mixins: [
      reportsMixin,
  ],

    data: () => ({
        module: "finance",
        decoratorKey: "invoice-report",
        postingInvoice: null, // Track which invoice is being posted
        salesLineModal: false,
        salesLineLoading: false,
        salesLineItems: [],
        salesLineInvoiceId: null,
        welcomeModal: false, // Control the welcome modal visibility
    }),

  components: {
      "invoice-report-filter": Filter,
      "invoice-analytics-graph": InvoiceAnalyticGraph
  },
    mounted() {
        // 
    },
    methods: {
      navigate(page) {
          this.get(page, this.obj.filters);
      },


       async view(item) {
           this.welcomeModal = true;

           this.salesLineItems = [];
            this.salesLineInvoiceId = item.invoice_id;


            try {               
                
            const response = await this.$http.post('/api/finance/dynamic-item-sent/by-invoice', {
                invoice_id: this.salesLineInvoiceId
            });
            this.salesLineItems = response.data.data || [];

            console.log(this.salesLineItems)

            this.salesLineModal = true;
         
            } catch (e) {
                this.$toast.error('Failed to fetch sales line items');
            } finally {
                this.salesLineLoading = false;
            }

            // const filters = this.obj.filters;

            // console.log(this.list);

            // filters.type = department.type;

            // let request_data = "?child=true&";

            // _.map(filters, (item, key) => {
            //     request_data = request_data + key + "=" + item + "&";
            // });

            // request_data = request_data + "total_filter_amount=" + department.amount;

            // window.open(`invoice-report${request_data}`, "_blank");
        },

      /**
       * Get badge color based on dynamics status
       */
      getDynamicsStatusColor(status) {
        
          const statusColors = {
              'sent': 'success',
              'Not sent': 'grey',
              'pending': 'warning',
              'failed': 'error'
          };
          return statusColors[status] || 'info';
      },

      /**
       * Post invoice to Microsoft Dynamics
       */
      async postToDynamics(item) {
          if (!item.actions || !item.actions.can_post) {
              this.$toast.warning('Invoice already posted to Dynamics');
              return;
          }

          // Confirmation dialog
          if (!confirm('Are you sure you want to post this invoice to Microsoft Dynamics?')) {
              return;
          }

          try {
              this.postingInvoice = item.actions.invoice_id;

              const response = await this.$http.post(
                  `/api/finance/invoices/${item.actions.invoice_id}/post-to-dynamics`
              );
              
              if (response.data.success) {
                  this.$toast.success('Invoice posted to Dynamics successfully');
                  // Update the item locally
                  item.sent_to_dynamics = true;
                  item.dynamics_response = response.data.data?.dynamics_response || 'sent';
                  item.actions.can_post = false;

                  // Optional: Refresh the entire list
                  // this.get(this.meta?.current_page || 1, this.obj.filters);
              } else {
                  this.$toast.error(response.data.message || 'Failed to post invoice');
              }
          } catch (error) {
              console.error('Error posting to Dynamics:', error);
              this.$toast.error(
                  error.response?.data?.message || 
                  'An error occurred while posting to Dynamics'
              );
          } finally {
              this.postingInvoice = null;
          }
      },
       async openSalesLineModal(item) {
            
            this.salesLineLoading = true;
            this.salesLineItems = [];
            this.salesLineInvoiceId = item.invoice_id;
            try {               
                
                const response = await this.$http.post('/api/finance/dynamic-item-sent/by-invoice', {
                    invoice_id: this.salesLineInvoiceId
                });
                this.salesLineItems = response.data.data || [];

                this.salesLineModal = true;
            ;
            } catch (e) {
                this.$toast.error('Failed to fetch sales line items');
            } finally {
                this.salesLineLoading = false;
            }
        },
        closeSalesLineModal() {
            this.salesLineModal = false;
            this.salesLineItems = [];
            this.salesLineInvoiceId = null;
    },
    closeWelcomeModal() {
      this.welcomeModal = false;
    },
  },
};
</script>
