<template>
  <collabmed-loading v-if="!initialised"></collabmed-loading>

  <v-card v-else>
    <v-card-title class="subheading grey-text text-darken-2">
      <h2 class="body-2 ma-0 pa-0">
        {{ screened ? 'List of all screened patients' : 'List of all patients' }}
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

    <v-data-table
        :headers="patients.headers"
        :items="patientsData"
        :loading="loading"
        :item-class="itemRowBackground"
        disable-pagination
        hide-default-footer
        class="mb-3"
    >
      <template v-slot:item.name="{ item }" class="py-3 blue--text text--lighten-2 patient-name">
        <a :href="`/reception/${item.id}/portal/details`">
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

      <template v-slot:item.age="{ item }">
        {{ item.age_friendly }}
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

      <template v-slot:item.patient_actions="{ item }">
        <v-menu transition="slide-y-transition" bottom v-if="msetting('core.okay_with_menu_actions')">
          <template v-slot:activator="{ on }">
            <v-btn  small color="primary" dark v-on="on">
              actions <v-icon small>keyboard_arrow_down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-btn small color="blue" dark :href="`/reception/patients/${item.id}/edit`">
                Edit
              </v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn small color="success" dark :href="`/reception/visits?patient_id=${item.id}`">
                visits
              </v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn small color="pink" dark :href="`/reception/patient/${item.id}/visits/create`" :disabled="item.status === 0">
                Check In
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
            <v-list-item>
              <v-btn  @click="requestSample(item)" small color="primary" dark>
                request sample
              </v-btn>
            </v-list-item>
          </v-list>
        </v-menu>

        <span v-else>
                    <v-btn small color="blue" dark :href="`/reception/patients/${item.id}/edit`">
                        Edit
                    </v-btn>

                    <v-btn small color="success" dark :href="`/reception/visits?patient_id=${item.id}`">
                        visits
                    </v-btn>

                    <v-btn small color="pink" dark
                           v-if="treatable(item)"
                           :href="`/reception/patient/${item.id}/visits/create`"
                           :disabled="item.status === 0">
                        Check In
                    </v-btn>

                    <PatientMetaData :patient="item"></PatientMetaData>

                    <v-btn small color="purple" dark :href="route('reception.barcode.index', item.id)">
                        Barcode
                    </v-btn>

                    <v-btn  @click="requestSample(item)" small color="primary" dark>
                        request sample
                    </v-btn>
                </span>
      </template>

      <template slot="footer" v-if="patients.links">

        <collabmed-paginator v-if="patients.meta"
                             :meta="patients.meta"
                             @change="navigate">
        </collabmed-paginator>

        <!-- <v-row   class="py-2 pb-2">
             <v-col cols="8" class="mt-3 ml-3">
                 Total patient records: {{ patients.meta.total }}
             </v-col>

             <v-col cols="3" class="text-right">
                 <v-btn icon @click="navigate(patients.links.prev)">
                     <v-icon>chevron_left</v-icon>
                 </v-btn>

                 <v-btn icon @click="navigate(patients.links.next)">
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

  </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import _ from 'lodash';
import AddNote from './AddNote';
import PatientMetaData from './PatientMetaData';

export default {
  props: ['screened'],
  components: {
    AddNote, PatientMetaData,
  },

  data() {
    return {
      add_note_dialog: false,
      note_patient_id: null,
      search: '',
      patients: null,
      label: 'Search Patients...',
      loading: true,
      patientsData: null,
      page: 1,
      cancelFetchToken: null,
      requestSampleDialog: false,
      patientData: null,
    };
  },

  watch: {
    getPatients(patients) {
      console.log(patients);

      this.patients = patients;
      this.loading = false;
      this.patientsData = _.sortBy(patients.data, 'full_name'); // patients.data;
    },

    search(term, old) {
      if (term.length > 3) {
        this.performSearch(term);
        this.label = 'Search Patients...';
      } else if (term.length > 0 && term.length <= 3) {
        this.label = 'Enter ' + (4 - term.length) + ' more characters';
      } else {
        this.label = 'Search Patients...';
      }

      if (term.length == 0) {
        this.setPatients({ page: 1 });
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
      'getPatients',
    ]),

    initialised() {
      return this.patients;
    },
  },

  methods: {
    ...mapActions([
      'setPatients',
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
      this.setPatients({
        search: term,
        params: {
          screened: true,
        },
      });
    }, 1000),

    init () {
      if (this.screened) {
        this.setPatients({
          page: this.page,
          params: {
            screened: true,
          },
        });
      } else {
        this.setPatients({
          page: this.page
        });
      }
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
