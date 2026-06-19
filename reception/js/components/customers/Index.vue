<template>
  <collabmed-loading v-if="!initialised"></collabmed-loading>

  <v-card v-else :key="'customers-index'">
    <v-card-title class="subheading grey-text text-darken-2">
      <h2 class="body-2 ma-0 pa-0">
        List of all customers
      </h2>
    </v-card-title>

    <v-divider class="my-0"></v-divider>

    <v-row>
      <v-col offset-md="8" md="4" cols="12">
        <v-text-field prepend-inner-icon="search"
                      :label="label"
                      v-model="search"
                      hide-details
        >
        </v-text-field>
      </v-col>
    </v-row>

    <!-- Bulk actions toolbar -->
    <v-row class="mb-2">
      <v-col cols="12" class="d-flex align-center">
        <v-spacer></v-spacer>
        <v-btn small color="teal" dark :disabled="selected.length === 0" @click="qrDialog = true">
          Generate QR
          <v-icon right small>qr_code_2</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-data-table
        :headers="customers.headers"
        :items="customersData"
        :loading="loading"
        :item-class="itemRowBackground"
        item-key="id"
        show-select
        v-model="selected"
        disable-pagination
        hide-default-footer
        class="mb-3"
    >
      <template v-slot:item.name="{ item }" class="py-3 blue--text text--lighten-2 patient-name">
        <a :href="`/reception/${item.id}/portal/customer-details`">
          {{ item.full_name }}
        </a>

        <v-icon small color="pink" @click="addNote(item.id)" outline>note_add</v-icon>

        <br/>

        <span class="ml-5 grey--text font-italic">
                    mobile id: {{ item.id }}
                </span>

        <br/>

        <span class="ml-5 grey--text font-italic" v-if="item.schemes && item.schemes.length > 0">
                    Has {{ item.schemes.length }} {{ 'insurance' | pluralize(item.schemes.length) }}
                </span>
      </template>

      <template v-slot:item.patient_number="{ item }">
        <span>{{ item.number }}</span><br/>
        <span class="grey--text">Id No: {{ item.id_no }}</span><br/>
        <span v-if="item.pending_invoice_balance > 0"
              style="font-weight: bolder; font-size: 11px; font-style: italic; color: red">
                    Balance:  {{ item.pending_invoice_balance }}
                </span>
      </template>


      <template v-slot:item.mobile="{ item }">
        <span>Primary: {{ item.mobile }}</span><br/>
        <span class="grey--text">Secondary: {{ item.alt_number }}</span>
      </template>

      <template v-slot:item.tsc_number="{ item }">
        {{ item.tsc_number }}
      </template>

      <template v-slot:item.file_number="{ item }">
        {{ item.tsc_number }}
      </template>

      <template v-slot:item.customer_actions="{ item }">
        <v-menu transition="slide-y-transition" bottom v-if="msetting('core.okay_with_menu_actions')">
          <template v-slot:activator="{ on }">
            <v-btn  small color="primary" dark v-on="on">
              actions <v-icon small>keyboard_arrow_down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-btn small color="blue" dark :href="`/reception/customers/${item.id}/edit`">
                Edit
              </v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn small color="success" dark :href="`/reception/visits?patient_id=${item.id}`">
                visits
              </v-btn>
            </v-list-item>

            <v-list-item>
              <PatientMetaData :patient="item"></PatientMetaData>
            </v-list-item>
            <v-list-item>
              <v-btn small color="purple" dark :href="route('reception.barcode.index', item.id)">
                Barcode
              </v-btn>
            </v-list-item>

          </v-list>
        </v-menu>

        <span v-else>
                    <v-btn small color="blue" dark :href="`/reception/customers/${item.id}/edit`">
                        Edit
                    </v-btn>




                    <PatientMetaData :patient="item"></PatientMetaData>

                    <v-btn small color="purple" dark :href="route('reception.barcode.index', item.id)">
                        Barcode
                    </v-btn>

                </span>
      </template>

      <template slot="footer" v-if="customers.links">

        <collabmed-paginator v-if="customers.meta"
                             :meta="customers.meta"
                             @change="navigate">
        </collabmed-paginator>

        <!-- <v-row   class="py-2 pb-2">
             <v-col cols="8" class="mt-3 ml-3">
                 Total patient records: {{ customers.meta.total }}
             </v-col>

             <v-col cols="3" class="text-right">
                 <v-btn icon @click="navigate(customers.links.prev)">
                     <v-icon>chevron_left</v-icon>
                 </v-btn>

                 <v-btn icon @click="navigate(customers.links.next)">
                     <v-icon>chevron_right</v-icon>
                 </v-btn>
             </v-col>
         </v-row>-->
      </template>
    </v-data-table>


    <!-- add note -->
    <v-dialog v-model="add_note_dialog" persistent max-width="800">
      <add-note :patientId="note_patient_id" @closed="add_note_dialog = false"></add-note>
    </v-dialog>

    <!-- request sample dialog -->
    <evaluation-sample-collection-request-dialog
        v-if="patientData && screened"
        :dialog-state="requestSampleDialog"
        @closed="requestSample"
        :patient="patientData"></evaluation-sample-collection-request-dialog>

    <!-- QR Codes dialog -->
    <v-dialog v-model="qrDialog" max-width="900">
      <v-card>
        <v-card-title class="headline">
          Customer Portal QR Codes
          <v-spacer></v-spacer>
          <v-btn icon @click="qrDialog = false"><v-icon>close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-row>
            <v-col v-for="item in selected" :key="'qr-'+item.id" cols="12" sm="6" md="4" class="text-center">
              <div class="subtitle-2 mb-2">{{ item.full_name }}   </div>
              <div class="subtitle-2 mb-2">{{ item.customer_no }}   </div>

              <vue-qrcode :ref="'qr-' + item.id" :value="portalUrl(item)" :options="{ width: 180, margin: 2 }"></vue-qrcode>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="clearSelection">Clear Selection</v-btn>
          <v-btn color="purple" dark :disabled="selected.length === 0" @click="exportQrPdf">Export to PDF</v-btn>
          <v-btn color="primary" dark @click="qrDialog = false">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import _ from 'lodash';
import AddNote from './AddNote';
import PatientMetaData from './PatientMetaData';
import VueQrcode from '@chenfengyuan/vue-qrcode';
import jsPDF from 'jspdf';

export default {
  name: 'CustomersIndex',
  props: ['screened'],
  components: {
    AddNote, PatientMetaData, VueQrcode,
  },

  data() {
    return {
      add_note_dialog: false,
      note_patient_id: null,
      search: '',
      patients: null,
      customers:null,
      label: 'Search Customers...',
      loading: true,
      patientsData: null,
      customersData:null,
      page: 1,
      cancelFetchToken: null,
      requestSampleDialog: false,
      patientData: null,
      // selection & qr
      selected: [],
      qrDialog: false,
    };
  },

  watch: {
    getCustomers(customers) {

      this.customers = customers;
      this.loading = false;
      this.customersData = _.sortBy(customers.data, 'full_name'); // customers.data;
    },

    search(term, old) {
      if (term.length > 3) {
        this.performSearch(term);
        this.label = 'Search Customers...';
      } else if (term.length > 0 && term.length <= 3) {
        this.label = 'Enter ' + (4 - term.length) + ' more characters';
      } else {
        this.label = 'Search customers...';
      }

      if (term.length == 0) {
        this.setCustomers({ page: 1 });
      }
    },

    initialised(value) {
      if (value) {
        this.loading = false;
      }
    },
  },

  computed: {
    ...mapGetters([
      'getCustomers',
    ]),


    initialised() {
      return this.customers;
    },
  },

  methods: {
    ...mapActions([
      'setCustomers',
    ]),

    requestSample(patient = null) {
      if(this.requestSampleDialog) {
        this.requestSampleDialog = false;
        this.patientData = null;
      } else {
        this.requestSampleDialog = true;
        this.patientData = patient;
      }
    },

    itemRowBackground: function (item) {
      return item.is_dependant ? 'is-dependant' : '';
    },

    treatable(item) {
      if(!item.is_dependant) {
        return true;
      } else {
        if(item.is_dependant.eligible) {
          return true;
        }
      }
      return false;
    },

    addNote(patient_id) {
      this.note_patient_id = patient_id;
      this.add_note_dialog = true;
    },

    navigate(page) {
      this.page = page;

      this.init();
    },

    performSearch: _.debounce(function(term) {
      this.loading = true;
      this.setCustomers({
        search: term,
        params: {
          screened: true,
        },
      });
    }, 1000),

    init () {
      if (this.screened) {
        this.setCustomers({
          page: this.page,
          params: {
            screened: true,
          },
        });
      } else {
        this.setCustomers({
          page: this.page
        });
      }
    },

    portalUrl(item) {
      if (!item || !item.id) return '';
      return `https://xanalife.afyanalytics.ai/reception/${item.id}/portal/customer-details`;
    },

    clearSelection() {
      this.selected = [];
    },

    exportQrPdf() {
      if (!this.selected || this.selected.length === 0) return;

      // Ensure QR dialog is open so canvases are rendered
      if (!this.qrDialog) {
        this.qrDialog = true;
      }

      this.$nextTick(() => {
        // Give vue-qrcode a short time to finish drawing the canvases
        setTimeout(() => {
          try {
            const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 12; // mm
            const qrSize = 50; // mm
            const labelHeight = 8; // mm
            const cellWidth = (pageWidth - margin * 2) / 2; // 2 columns
            const cellHeight = qrSize + labelHeight + 8; // include spacing

            let col = 0;
            let row = 0;

            const addNewPageIfNeeded = () => {
              const neededHeight = margin + (row + 1) * cellHeight;
              if (neededHeight > pageHeight) {
                doc.addPage();
                row = 0;
                col = 0;
              }
            };

            const centerText = (text, centerX, y, fontSize = 11) => {
              doc.setFontSize(fontSize);
              const textWidth = doc.getTextWidth(text);
              const x = centerX - textWidth / 2;
              doc.text(text, x, y);
            };

            this.selected.forEach((item) => {
              const refName = 'qr-' + item.id;
              let refVal = this.$refs[refName];
              if (Array.isArray(refVal)) refVal = refVal[0];

              // Resolve to a DOM element (canvas/img/container)
              let el = null;
              if (refVal) {
                el = refVal.$el ? refVal.$el : refVal; // component instance or raw element
              }

              let dataUrl = null;
              if (el) {
                // Case 1: root itself is canvas or img
                if (el.tagName === 'CANVAS' && typeof el.toDataURL === 'function') {
                  dataUrl = el.toDataURL('image/png');
                } else if (el.tagName === 'IMG' && el.src) {
                  dataUrl = el.src;
                } else {
                  // Case 2: look for children
                  const canvas = el.querySelector && el.querySelector('canvas');
                  const img = el.querySelector && el.querySelector('img');
                  if (canvas && typeof canvas.toDataURL === 'function') {
                    dataUrl = canvas.toDataURL('image/png');
                  } else if (img && img.src) {
                    dataUrl = img.src;
                  }
                }
              }

              // If dataUrl is still null, skip this item
              if (!dataUrl) return;

              addNewPageIfNeeded();

              const cellX = margin + col * cellWidth;
              const cellY = margin + row * cellHeight;

              // Center QR within cell
              const qrX = cellX + (cellWidth - qrSize) / 2;
              const qrY = cellY + 4; // small top padding

              // Add name label centered
              doc.setTextColor(0, 0, 0);
           const name = `${item.full_name} (Customer #${item.customer_no})`;



              const centerX = cellX + cellWidth / 2;
              centerText(name, centerX, cellY + 3, 11);

              // Add QR image
              doc.addImage(dataUrl, 'PNG', qrX, qrY, qrSize, qrSize, undefined, 'FAST');

              // Optionally, add small url under QR
              const url = this.portalUrl(item);
              centerText(url, centerX, qrY + qrSize + 3, 8);

              // Advance col/row
              col += 1;
              if (col >= 2) {
                col = 0;
                row += 1;
              }
            });

            const filename = `customer-qr-codes-${new Date().toISOString().slice(0,10)}.pdf`;
            doc.save(filename);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Failed to export QR PDF', e);
          }
        }, 250);
      });
    }
  },

  mounted() {
    this.init();
  },

  created() {
    window.events.$on('STORE_SET_ACTION_LOADING', (val) => {
      this.loading = val;
    });
  },
};
</script>

<style type="text/css">
.qr-code-icon {
  padding-top: 0.6em;
}
.patient-name a:hover {
  text-decoration: underline;
  color: black;
}

.is-dependant {
  background-color: #c5ccda;
}
</style>
