<template>
    <div>
        <v-row>
            <v-col cols="12">
                <h6 class="font-weight-bold">COUNSELLING / DISCUSSION</h6>
            </v-col>
        </v-row>
        <v-row >
            <v-col cols="12">
                <v-switch dense
                          v-model="counselling.explained_diagnosis"
                          label="Explained Diagnosis"
                          @change="save()">
                </v-switch>
            </v-col>
            <v-col cols="12">
                <v-switch dense
                          v-model="counselling.discussed_natural_history_prognosis"
                          label="Discussed natural history prognosis"
                          @change="save()">
                </v-switch>
            </v-col>
            <v-col cols="12">
                <v-switch dense
                          v-model="counselling.discussed_interaction_of_systemic_health_to_eye_disease"
                          label="Discussed interaction of systemic health to eye disease"
                          @change="save()">
                </v-switch>
            </v-col>
            <v-col cols="12">
                <v-switch dense
                          v-model="counselling.explained_potential_side_effects_complications"
                          label="Explained potential side effects complications"
                          @change="save()">
                </v-switch>
            </v-col>
            <v-col cols="12">
                <v-switch dense
                          v-model="counselling.discussed_visual_needs_in_relation_to_daily_living"
                          label="Discussed visual needs in relation to daily living"
                          @change="save()">
                </v-switch>
            </v-col>
            <v-col cols="12">
                <v-switch dense
                          v-model="counselling.answered_patients_questions_and_concerns"
                          label="Answered patients questions and concerns"
                          @change="save()">
                </v-switch>
            </v-col>
        </v-row>
    </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import DoctorNote from '@evaluation/libs/notes/DoctorNote';

export default {
    data: () => ({
        doctorNote: new DoctorNote(),
        counselling: {
            explained_diagnosis: false,
            discussed_natural_history_prognosis: null,
            discussed_interaction_of_systemic_health_to_eye_disease: false,
            discussed_short_and_long_term_treatment_options: false,
            explained_potential_side_effects_complications: false,
            discussed_visual_needs_in_relation_to_daily_living: false,
            answered_patients_questions_and_concerns: false
        },
    }),

    watch: {
        getDoctorsNotes(val) {
            if (val && val.counsel) {  // Ensure val and val.counsel exist
                try {
                    this.counselling = JSON.parse(val.counsel);
                } catch (error) {
                    console.error("Invalid JSON format in val.counsel:", val.counsel, error);
                    this.counselling = null;  // Handle the error gracefully
                }
            } 
        }
    },

    computed: {
        ...mapGetters([
            'getDoctorsNotes'
        ]),
    },

    methods: {
        ...mapActions([
            'setDoctorsNotes'
        ]),

        save () {

            const data = {
                visit: this.$route.params.visitId,
                counsel: this.counselling,
            };

            this.doctorNote.saveCounsel(data);

        },

     async  fetchCounselling(){



                try {
                     // Wait for the API call to complete
                const params = {
                visit_id: this.$route.params.visitId, // Getting visitId from the route params
                  };
                var response =  await this.doctorNote.fetchCounselling(params);
                
                console.log(response);  // Log the full response for debugging
                
                // Ensure the response contains 'data' before trying to access it
                if (response && response.data) {
                    var data = response.data;

                    // Check if 'counsel' exists in the 'data'
                    if (data) {

                        this.counselling = data
                        // Handle the 'counsel' data here
                    } else {
                        console.log('Counsel not found in data');
                    }
                } else {
                    console.log('Data not found in response');
                }
            } catch (error) {
                console.error('Error fetching counseling data:', error);
            }

                
        },
    },

    mounted() {
        this.fetchCounselling();
    }
}
</script>
<style>
.v-input--selection-controls {
    margin-top: 0;
    padding-top: 0;
}
</style>
