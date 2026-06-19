<template>
    <v-dialog v-model="dialog" style="width: 100%; height: 100vh; position: fixed; top: 0; left: 0; z-index: 1000; overflow-y: auto;">
            <v-card v-if="!pdfReadStatus">
              <!-- width="70%"  -->
                <v-card-title class="headline primary" primary-title>
                    <span class="font-weight-bold white--text">{{ investigation.procedure_name | ucwords }} Results - <small>{{ investigation.type | ucwords}}</small></span>

                    <v-btn icon dark @click.native="dialog = false" absolute right>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <v-row>
                        <v-col cols="4">
                            <p v-if="investigation.user.full_name"><strong>Requested By:</strong> {{ investigation.user.full_name }}</p>

                            <p><strong>Instructions:</strong> Not provided</p>

                            <p><strong>Charges:</strong> Kshs. {{ investigation.amount | numberFormat }}</p>

                            <p><strong>Date:</strong> {{ investigation.created_at }}</p>

                            <p><strong>Reasons:</strong> {{ investigation.reasons ? investigation.reasons : 'None provided' }}</p>

                            <v-divider></v-divider>

<!--                            <p v-if="investigation.results.user.full_name"><strong>Result By:</strong> {{ investigation.results.user.full_name }}</p>-->

                            <p><strong>Result Date:</strong> {{ investigation.results.created_at }}</p>

                            <v-divider></v-divider>

                            <v-btn color="primary" dark :href="investigation.results.links.view_result_link" target="_blank">
                                View All Results
                            </v-btn>
                        <v-btn color="primary" dark @click="viewPDF">
                            View PDF
                        </v-btn>
                        </v-col>

                        <v-col cols="8">
                            <h5 class="headline">Test Results</h5>
                            <!-- :action="action"  -->
                            <done-investigations :action="action" :visitid="visit_id"></done-investigations>
                            <!-- <done-investigations :visitid="investigation.visit_id" :type="type"></done-investigations> -->
                        </v-col>




                      <!-- <pdf-reader v-if="pdfReadStatus" v-on:close="pdfReadStatus = false"></pdf-reader> -->
                    </v-row>
                </v-card-text>
            </v-card>

           <v-card v-if="pdfReadStatus">
              <v-card-title class="headline primary" primary-title>
                <span class="font-weight-bold white--text">PDF Viewer</span>
                <v-btn icon dark @click.native="pdfReadStatus = false" absolute right>
                  <v-icon>close</v-icon>
                </v-btn>
              </v-card-title>

        <v-card-text style="overflow-y: auto;">
          <v-btn color="primary" dark :href="pdfUrl"  style="width: 100%; margin: 0 auto;">
              Open Full File
          </v-btn>
        <pdf :src="pdfUrl"  :rotate="0" @error="error" @num-pages="pageCount=$event" @page-loaded="currentPage=$event" @link-clicked="page=$event" @progress="progress=$event" :key="pdfUrl"></pdf>
         <!-- page="1" -->

        </v-card-text>
            </v-card>
        </v-dialog>




</template>

<script>
import DoneInvestigations from '@evaluation/components/evaluation/actions/partials/DoneInvestigations';
import pdf from "vue-pdf";
import InvestigationResults from '@evaluation/libs/investigation_results/InvestigationResults.js';

export default {

    props: [
        'investigation',
    ],

    components: {
        DoneInvestigations,
        pdf
        // PdfReader
    },

    data() {
        return {
            dialog: true,
            action: 'published',
            pdfReadStatus: false,
            visit_id :  this.$route.params.visitId,
            investigationResult: new InvestigationResults(),
            // pdfUrl: process.env.MIX_APP_URL + "/Deck.pdf",
            pdfUrl: "/Deck.pdf",
        };
    },

    watch: {
        dialog(val) {
            !val && this.$emit('close');
        },
    },

    methods: {
      viewPDF() {
        this.pdfReadStatus = true

        },

        error(err) {
      console.log(err);
    }
    },

};
</script>

<style scoped>

</style>
