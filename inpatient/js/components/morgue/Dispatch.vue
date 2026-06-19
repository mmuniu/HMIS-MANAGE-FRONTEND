<template>
    <v-card flat class="p-4">
        <v-row>
            <v-col cols="6">
                <div  class="mx-2">
                    <v-text-field v-model="dispatch.permit_no"
                                  label="Permit no" outlined
                    ></v-text-field>
                </div>
            </v-col>
            <v-col cols="6">
                <div  class="mx-2">
                  <v-autocomplete :items="users"
                  item-text="username" item-value="id" outline
                  v-model="dispatch.dispatched_by"
                  label="Dispatched By(Name of Motician)" outlined
                  persistent-hint                   >
                </v-autocomplete>

                </div>
            </v-col>

        </v-row>

        <v-row>
            <v-col cols="6">
                <div  class="mx-2">
                    <v-text-field v-model="dispatch.dispatched_to"
                                  label="Dispatched to First Name" outlined
                    ></v-text-field>
                </div>
            </v-col>
            <v-col cols="6">
                <div  class="mx-2">
                    <v-text-field v-model="dispatch.collector_middle_name"
                                  label="Dispatched to Middle Name" outlined
                    ></v-text-field>
                </div>
            </v-col>

        </v-row>
        <v-row>
            <v-col cols="6">
                <div  class="mx-2">
                    <v-text-field v-model="dispatch.collector_last_name"
                                  label="Dispatched to Last Name" outlined
                    ></v-text-field>
                </div>
            </v-col>
            <v-col cols="6">
                <div  class="mx-2">
                    <v-text-field v-model="dispatch.collector_passport_or_ID_Number"
                                  label="Dispatched to Passport or ID Number" outlined
                    ></v-text-field>
                </div>
            </v-col>

        </v-row>
        <v-row>
            <v-col cols="6">
                <div  class="mx-2">
                    <v-text-field v-model="dispatch.collector_telephone_number"
                                  label="Dispatched to Telephone Number" outlined
                    ></v-text-field>
                </div>
            </v-col>
            <v-col cols="6">
                <div  class="mx-2">
                    <v-text-field v-model="dispatch.dispatch_for_transfer"
                                  label="Dispatched For Transfer" outlined
                    ></v-text-field>
                </div>
            </v-col>

        </v-row>
        <v-row>
            <v-col cols="6">
                <div  class="mx-2">
                    <v-text-field v-model="dispatch.dispatch_for_disposal"
                                  label="Dispatched For Disposal" outlined
                    ></v-text-field>
                </div>
            </v-col>


        </v-row>

        <v-row>
            <v-col cols="6">
                <div  class="mx-2">
                    <v-text-field v-model="dispatch.next_of_kin_first_name"
                                  label="Next of Kin First Name" outlined
                    ></v-text-field>
                </div>
            </v-col>
            <v-col cols="6">
                <div  class="mx-2">
                    <v-text-field v-model="dispatch.next_of_kin_middle_name"
                                  label="Next of Kin Middle Name" outlined
                    ></v-text-field>
                </div>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <div  class="mx-2">
                    <v-text-field v-model="dispatch.next_of_kin_last_name"
                                  label="Next of Kin Last Name" outlined
                    ></v-text-field>
                </div>
            </v-col>
            <v-col cols="6">
                <div  class="mx-2">
                  <v-autocomplete :items="relationshipTypes"
                  item-text="name" item-value="value" outline
                  v-model="dispatch.next_of_kin_relationship"
                  label="Next of Kin Relationship" outlined
                  persistent-hint                   >
                </v-autocomplete>

                </div>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <div  class="mx-2">
                    <v-text-field v-model="dispatch.next_of_kin_mobile"
                                  label="Next of Kin Mobile Number" outlined
                    ></v-text-field>
                </div>
            </v-col>
            <v-col cols="6">
                <div  class="mx-2">
                    <v-text-field v-model="dispatch.next_of_kin_passport_id_number"
                                  label="Next of Kin Passport or ID Number" outlined
                    ></v-text-field>
                </div>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <div  class="mx-2">
                    <v-text-field v-model="dispatch.where_to"
                                  label="Where To" outlined
                    ></v-text-field>
                </div>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <div  class="mx-2">
                    <collabmed-date-time-picker
                        label="Collection date"
                        outline
                        @input="setCollectionDate"
                    ></collabmed-date-time-picker>
                </div>
            </v-col>
        </v-row>

        <v-row>
          <v-btn small color="primary" @click="dispatch.save()">Dispatch</v-btn>
        </v-row>
        <!-- <v-row v-if="admission">
            <v-col cols="6">
                <v-col cols="12" md="12">
                    <v-btn block
                           :color=" admission.dispatch_date ? 'gray' : 'primary'"
                           :disabled="admission.dispatch_date ? true : false"
                           class="mt-4" @click.once="admissionObj.dispatch()">
                        {{ admission.dispatch_date ? 'Dispatch requested' : 'Dispatch' }}
                        <v-icon class="pl-2">arrow_right_alt</v-icon>
                    </v-btn>
                </v-col>
            </v-col>
        </v-row> -->
    </v-card>
</template>
<script>
// import Admission from "@morgue/libs/admissions/Admissions";
import Dispatch from "@inpatient/libs/morgue/Dispatch";

export default {
    props: [
        'admissionInst', 'PatientName'
    ],

    data () {
        return {
            dispatch: null,
            dispatch: new Dispatch(),
            users: [],
            relationshipTypes: [
                { name: 'Parent', value: 'parent' },
                { name: 'Sibling', value: 'sibling' },
                { name: 'Spouse', value: 'spouse' },
                { name: 'Child', value: 'child' },
                { name: 'Relative', value: 'relative' },
                { name: 'Friend', value: 'friend' },
                { name: 'Guardian', value: 'guardian' },
                { name: 'Partner', value: 'partner' },
                { name: 'Other', value: 'other' }
      ],
        }
    },

    methods: {
        setCollectionDate(datetime) {
              console.log(datetime);
            this.dispatch.collection_date = datetime;

        },
    },

    watch: {
        admission () {
            this.admissionObj.admission_data.visit_id = this.admission.visit_id;
            this.admissionObj.admission_data.permit_no = this.admission.permit_no;
        }
    },

  async mounted () {
        // console.log(this.PatientName)
        this.admission = JSON.parse(this.admissionInst);
        // console.log(this.admission);
        this.dispatch.patient_name = this.PatientName;
        this.dispatch.admission_id = this.admission.id;
          // Make the POST request with the selected item IDs in the body
          const response = await fetch('/api/users/all/users', {
              method: 'GET', // Specify the request method
              headers: {
                'Content-Type': 'application/json', // Specify the content type if necessary
                // Add other headers if needed (e.g., Authorization)
              },
            });

                // Check if the response is successful
                if (!response.ok) {
              console.log(`HTTP error! status: ${response.status}`);
            }

                // Parse the response JSON data
                const data = await response.json();
                this.users = data.map(user => ({
                  id: user.id,
                  username: user.username
                }));
            console.log('Fetched users:', this.users);

    }
}
</script>
