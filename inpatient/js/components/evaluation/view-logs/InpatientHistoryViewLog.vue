<template>
    <div>
      <!-- button to activate the function to open the dialog -->
  
      <v-btn @click="renderInpatientHistoryLogs(visitId)" color="primary" dark>
          View  Logs
      </v-btn>
      <v-dialog v-model="inpatientHistoryDialog" width="70%" persistent>
          <v-card>
            <v-card-title class="text-h5 white--text teal" primary-title>
              Inpatient History view logs
              <v-spacer></v-spacer>
              <v-btn icon dark @click.prevent="inpatientHistoryDialog = false" absolute right>
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
                      <tr v-for="note in inpatientHistoryLogs" :key="note.id">
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
              <v-btn color="primary" @click.prevent="inpatientHistoryDialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
  </template>
  <script>
  import History from '@evaluation/libs/history/History';
  
  export default {
  
      props: {
          visitId: {
              default: null,
          },
      },
      data() {
          return {
              
              inpatientHistoryDialog:false,
              inpatientHistoryLogs:[],
              history: new History(),
  
          };
      },
  
      watch: {
          page(page) {
              this.history.fetch(this.getVisitId, page);
          },
      },
      computed:{
  
      },
      methods:{
        
          async renderInpatientHistoryLogs(visit_id){
  
  
      const viewLogs = await this.history.fetchInpatientHistoryViewLogs(visit_id);
  
  const notes = viewLogs?.notes || []; // Access notes data array
    // Map through notes and enrich with logs
    this.inpatientHistoryLogs = notes.map(note => {
        return {
          user_id:note.user_id,
          id: note.id,
          doctorName: note.doctor || '',
         ip_address:note.ip_address||'',
         created_at:note.created_at||''
        };
      });
  
    // Open the modal
    this.inpatientHistoryDialog = true;
  },
      }
  }
  
  </script>