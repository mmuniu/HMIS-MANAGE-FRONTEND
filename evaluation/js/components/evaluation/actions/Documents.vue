<template>
  <collabmed-loading v-if="!initialised"></collabmed-loading>

  <div v-else>
    <!-- patient chits-->
    <v-card flat>

      <v-row class="ma-5">
        <v-col cols="12" md="6" sm="6">
          <v-col cols="12" sm="6">
            <v-select label="Document type" v-model="selectedDocumentType" :items="document_types_array">
            </v-select>
          </v-col>
          <v-col cols="12">
            <input type="file" id="file" ref="file" v-on:change="onChangeFileUpload()"/>
          </v-col>
          <v-col cols="12">
            <v-btn small color="primary" @click.prevent="saveDocument()">save</v-btn>
          </v-col>
        </v-col>
      </v-row>

      <v-card-text>
        <!-- paid sick chit-->
        <v-row>

          <v-col cols="12" md="6" v-if="msetting('evaluation.enable_paid_sick_chit')">
            <v-row>
              <v-col cols="12">
                <p style="text-decoration: underline">PAID SICK CHIT</p>
              </v-col>
              <v-col cols="12" md="8">
                <v-text-field v-model="chits.paid_sick.no_of_days"
                              label="No of days"
                              outlined
                >
                </v-text-field>
              </v-col>

              <v-col cols="12">
                <v-btn small color="primary" rounded @click="printChit('paid_sick')">
                  print paid sick chit
                </v-btn>
              </v-col>
            </v-row>


            <br/><hr/>
          </v-col>

          <v-col cols="12" md="6" v-if="msetting('evaluation.enable_light_duty_chit')">
            <!-- light duty chit-->
            <v-row>
              <v-col cols="12">
                <p style="text-decoration: underline"> LIGHT DUTY CHIT</p>
              </v-col>
              <v-col cols="8">
                <v-text-field v-model="chits.light_duty.no_of_days"
                              label="No of days"
                              outlined
                >
                </v-text-field>
              </v-col>
              <v-col cols="12">
                <v-btn small  color="primary" rounded @click="printChit('light_duty')">
                  print light duty chit
                </v-btn>
              </v-col>
            </v-row>

            <br/> <hr/>
          </v-col>
        </v-row>


        <v-row>
          <v-col cols="12" md="6"  v-if="msetting('evaluation.enable_referral_chit')">
            <!-- referral chit-->
            <v-row>
              <v-col cols="12">
                <p style="text-decoration: underline">REFERRAL CHIT</p>
              </v-col>
              <v-col cols="8">
                <v-select v-model="chits.referral.level_type"
                          label="Level type"
                          :items="['SubCounty hospital', 'County hospital', 'National hospital']"
                          outlined
                >
                </v-select>
                <v-text-field v-model="chits.referral.hospital"
                              label="Name of hospital"
                              outlined
                >
                </v-text-field>
                <v-textarea v-model="chits.referral.reason"
                            label="Reason"
                            outlined
                >
                </v-textarea>
              </v-col>
              <v-col cols="12">
                <v-btn small  color="primary" rounded @click="printChit('referral')">
                  print referral chit
                </v-btn>
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="12" md="6"  v-if="msetting('evaluation.enable_treatment_work_back_chit')">
            <!-- treatment and back to work chit-->
            <v-row>
              <v-col cols="12">
                <p style="text-decoration: underline"> TREATMENT AND BACK TO WORK CHIT</p>
              </v-col>
              <v-col cols="12">
                <v-btn small  color="primary" rounded @click="printChit('treatment_and_back')">
                  print treatment & back to work chit
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <br/>

    <v-card flat>
      <v-card-title>
        <h5 class="grey--text">List of existing patient documents</h5>
      </v-card-title>

      <v-data-table
          :headers="headers"
          :items="documents.data"
          class="mb-2"
          flat
          hide-default-footer
      >
        <template v-slot:item.document="{ item }">
          <a @click="openDocument(item)">
            {{ item.filename }}
          </a>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import axios from 'axios';

export default {

  data: () => ({
    headers: [
      { text: 'Document', value: 'document' },
      { text: 'Type', value: 'document_type' },
      { text: 'Size', value: 'size' },
      { text: 'Uploaded By', value: 'user.full_name' },
      { text: 'Date', value: 'date' },
    ],

    chits: {
      paid_sick: {
        no_of_days: null,
        type: 'Paid sick chit',
      },
      light_duty: {
        no_of_days: null,
        type: 'Light duty chit',
      },
      treatment_and_back: {
        print: true,
        type: 'Treatment and back to work chit',
      },
      referral: {
        level_type: null,
        hospital: null,
        reason: null,
        type: 'Referral chit',
      },
    },
    document_types_array: [],
    selectedDocumentType: null,
    schemeObj: null,
  }),

  props: ['document_types', 'patient_id'],

  computed: {
    ...mapGetters({
      documents: 'getDocuments',
    }),

    initialised() {
      return !!this.documents.data;
    },
  },

  methods: {
    ...mapActions([
      'setDocuments',
    ]),

    onChangeFileUpload() {
      const fileInput = this.$refs.file;
      this.schemeObj = fileInput.files[0];
    },

    saveDocument() {
  const formData = new FormData();
  formData.append('doc', this.schemeObj);
  formData.append('document_type', this.selectedDocumentType);

  const patientId = this.patient_id;
  const upload_url = route('reception.upload_doc', { id: patientId });

  axios.post(upload_url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  })
  .then((response) => {
    console.log('Success:', response.data);
    flash(response.data); 
    window.location.reload()
  })
  .catch((error) => {
    console.error('Upload error:', error);
  });
},

    openDocument(doc) {
      window.open('/reception/patients/view/document/' + doc.id, '_blank');
    },

    printChit(type) {
      const data = JSON.stringify(this.chits[type]);

      window.open(`/reception/visit/${this.$route.params.visitId}/print-chit?data=` + data, '_blank');
    },
    convertDocumentTypesToArray() {
      const documentTypesObject = JSON.parse(this.document_types);
      return Object.entries(documentTypesObject).map(([value, text]) => ({
        value: parseInt(value, 10),
        text,
      }));
    },
  },

  mounted() {
    this.document_types_array = this.convertDocumentTypesToArray();
    this.setDocuments({
      params: {
        visit_id: this.$route.params.visitId,
      },
    });
  },
};
</script>
