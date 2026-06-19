<template>
  <div>
    <collabmed-loading v-if="!meta"></collabmed-loading>

    <v-card class="pb-1" flat v-else>

      <v-dialog v-model="historyNoteDialog" width="70%" persistent>
        <v-card>
          <v-card-title class="text-h5 white--text teal" primary-title>
            History Notes view logs
            <v-spacer></v-spacer>
            <v-btn icon dark @click.prevent="historyNoteDialog = false" absolute right>
              <v-icon>close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text class="px-5" style="margin-top:30px">
            <v-row>
              <v-col cols="12">
                <v-simple-table>
                  <thead>
                  <tr>
                    <th>Doctor Name</th>
                    <th>IP Address</th>
                    <th>Viewed At</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="note in outpatientNotesLogs" :key="note.id">
                    <td>{{ note.doctorName }}</td>
                    <td>{{ note.ip_address }}</td>
                    <td>{{ note.created_at }}</td>
                  </tr>
                  </tbody>
                </v-simple-table>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn color="primary" @click.prevent="historyNoteDialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>


      <v-row class="row-fluid" v-if="allVisits.length > 0">
        <v-col cols="12">
          <v-expansion-panels
              v-model="activePanels"
              multiple
          >
            <v-expansion-panel
                v-for="(item, index) in allVisits"
                :key="item.visit.id"
                :value="item.visit.id"
                @click="handlePanelStateChange(item.visit.id)">
              <v-expansion-panel-header>
                <div style="font-weight: bolder; font-size: 18px">
                  <input
                      type="checkbox"
                      v-model="selectedVisits"
                      aria-label="selected-visit"
                      :value="item.visit"
                  >
                  {{ item.visit.created_at_friendly }}

                  <button
                      :key="item.visit"
                      :title="item.visit.created_at_friendly"
                      class="history-note-button btn btn-success"
                      @click.prevent="renderHistoryNotes(item.visit.id)"
                  >
                    View  logs
                  </button>
                </div>
                <v-spacer></v-spacer>
                <div class="text-right">
                  <v-chip small color="blue">Outpatient</v-chip>
                  <v-chip
                      small
                      color="purple"
                      v-if="item.visit.admission_request_id"
                  >
                    Inpatient
                  </v-chip>
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-card flat>
                  <list :history="item"></list>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>

      <v-row v-if="selectedVisits.length > 0">
        <v-col cols="12" class="px-3">
          <div>
            <v-chip small color="default"
                    v-for="(visit, index) in selectedVisits"
                    :key="visit.id"
                    @input="removeInvoiceFromSelection(index)"
                    close
                    class="mx-1">
              <strong>{{ visit.created_at_friendly }}</strong>&nbsp;
            </v-chip>
          </div>
        </v-col>
        <v-col>
          <v-btn small color="primary" @click="printSelected">Print Selected</v-btn>
        </v-col>
      </v-row>

      <v-row class="pt-3" v-if="meta">
        <v-col cols="12">
          <v-card-actions>
            <h5 class="grey--text pl-4">Total records: {{ meta.total }}</h5>
            <v-spacer></v-spacer>
            <v-pagination
                v-model="page"
                :length="meta.last_page"
                circle
                :total-visible="6"
            ></v-pagination>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-col>
      </v-row>

      <v-alert v-else :value="true" type="info">
        There are no previous visits by the patient
      </v-alert>
    </v-card>
  </div>
</template>

<script>
import History from '@evaluation/libs/history/History';
import List from './partials/history/OccularList';

export default {
  components: {
    List,
  },

  props: {
    visitId: {
      default: null,
    },
  },

  data() {
    return {
      page: 1,
      panelStates: {}, // Object to track the state of each panel
      selectedVisits: [],
      history: new History(),
      activePanels: [], // Tracks the currently open panels
      historyNoteDialog:false,
      outpatientNotesLogs:[],
    };
  },

  watch: {
    page(page) {
      this.history.fetch(this.getVisitId, page);
    },
  },

  computed: {
    loading() {
      return this.history.loading;
    },

    allVisits() {
      return this.history.visits;
    },

    meta() {
      return this.history.meta;
    },

    getVisitId() {
      return this.visitId || this.$route.params.visitId;
    },
  },

  methods: {

    handlePanelStateChange(visitId) {
      // Check if the panel has already triggered an API call
      if (!this.panelStates[visitId]) {
        // Mark the panel as processed
        this.$set(this.panelStates, visitId, true);

        // Trigger the API call
        this.history.updateOutpatientHistoryViewCount(visitId);
      }
    },

    async renderHistoryNotes(visit_id){

      const viewLogs = await this.history.fetchOutPatientNotesVisit(visit_id);

      const notes = viewLogs?.notes || []; // Access notes data array
      // Map through notes and enrich with logs
      this.outpatientNotesLogs = notes.map(note => {
        return {
          user_id:note.user_id,
          id: note.id,
          doctorName: note.doctor || '',
          ip_address:note.ip_address||'',
          created_at:note.created_at||''
        };
      });

      // Open the modal
      this.historyNoteDialog = true;

    },

    removeInvoiceFromSelection(index) {
      this.selectedVisits.splice(index, 1);
    },

    printSelected() {
      const url = this.selectedVisits
          .map((visit) => visit.id)
          .join('-');

      if (this.selectedVisits.length) {
        const patientId = this.selectedVisits[0].patient_id;
        window.open(
            `/evaluation/print/patient/${patientId}/ocular-history/print/?visits=${url}`,
            '_blank'
        );
      }
    },
  },

  mounted() {
    this.history.ocular_fetch(this.getVisitId, this.page);
  },
};
</script>
