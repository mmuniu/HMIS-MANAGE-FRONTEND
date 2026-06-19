<template>
    <div>
<!--        <v-row>
            <v-col cols="12">
                <collabmed-date-time-picker dateOnly outline
                                            @input="save"
                                            v-model="next_visit_date"
                                            label="Date of Next Visit">
                </collabmed-date-time-picker>
                <span>{{ next_visit_date }}</span>
            </v-col>
        </v-row>-->

        <v-row>
            <v-col cols="12">
                <h6 class="font-weight-bold">NEXT STEPS</h6>
            </v-col>
        </v-row>

        <v-row v-if="next_steps">
            <v-col cols="12" v-if="next_steps.tca">
                <v-switch  dense
                           v-model="next_steps.tca.value"
                           @change="save()" 
                           label="TCA" style="font-weight: bold;">
                </v-switch>
                <v-row v-if="next_steps.tca.value && configurations">
                    <v-col cols="5">
                        <v-text-field label="Duration"
                                      v-model="next_steps.tca.duration"
                                      @change="save()" 
                        />
                    </v-col>
                    <v-col cols="5">
                        <v-select label="Duration in"
                                  v-model="next_steps.tca.duration_in"
                                  @change="save()"
                                  :items="configurations.age_in"
                                  item-text="item_name"
                                  item-value="item_name"/>
                    </v-col>
                </v-row>
            </v-col>

            <v-col cols="12">
                <v-switch  dense
                           v-model="next_steps.call_for_follow_up"
                           @change="save()"
                           label="Call for follow up" style="font-weight: bold;">
                </v-switch>
            </v-col>

            <v-col cols="12" v-if="next_steps.refer_to_specialist">
                <v-switch  dense
                           v-model="next_steps.refer_to_specialist.value"
                           label="Refer to specialist" style="font-weight: bold;">
                </v-switch>

                <v-row v-if="next_steps.refer_to_specialist.value">
                    <v-col>
                       <v-text-field  v-model="next_steps.refer_to_specialist.specialist"
                                      @change="save()"
                                      label="Specialist"
                                      style="font-weight: bold;"></v-text-field>
                    </v-col>
                </v-row>

            </v-col>

            <v-col cols="12">
                <v-switch  dense
                           v-model="next_steps.get_pre_authorization"
                           @change="save()"
                           label="Get pre-authorization" style="font-weight: bold;">
                </v-switch>
            </v-col>

            <v-col cols="12">
                <v-switch  dense
                           v-model="next_steps.book_for_theatre_la"
                           @change="save()"
                           label="Book for theatre LA" style="font-weight: bold;">
                </v-switch>
            </v-col>

            <v-col cols="12">
                <v-switch  dense
                           v-model="next_steps.book_for_theatre_ga"
                           @change="save()"
                           label="Book for theatre GA" style="font-weight: bold;">
                </v-switch>
            </v-col>

            <v-col cols="12">
                <v-switch  dense
                           v-model="next_steps.call_for_review"
                           @change="save()"
                           label="Call for review" style="font-weight: bold;">
                </v-switch>
            </v-col>

            <v-col cols="12">
                <v-switch  dense
                           v-model="next_steps.refer_for_investigation"
                           @change="save()"
                           label="Refer for investigation" style="font-weight: bold;">
                </v-switch>
            </v-col>
        </v-row>
    </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import DoctorNote from '@evaluation/libs/notes/DoctorNote';
import SettingsOptions from "@settings/libs/SettingsOptions";

export default {
    data: () => ({
        doctorNotes: new DoctorNote(),
        next_visit_date: '',
        options: new SettingsOptions(),
        next_steps: {
            tca: {
                value: false, // Set to false instead of null
                duration: '',
                duration_in: ''
            },
            call_for_follow_up: false,
            refer_to_specialist: {
                value: false,
                specialist: ''

            },
            get_pre_authorization: false,
            book_for_theatre_la: false,
            book_for_theatre_ga: false,
            call_for_review: false,
            refer_for_investigation: false
        }

    }),

    watch: {
        getDoctorsNotes (val) {
            this.next_visit_date = val.next_visit_date ? val.next_visit_date : '';
            if (val.next_steps) {
                this.next_steps = JSON.parse(val.next_steps);
            }
        }
    },

    computed: {
        ...mapGetters([
            'getDoctorsNotes'
        ]),

        configurations() {
            return this.options.configurations;
        },
    },

    methods: {
        ...mapActions([
            'setDoctorsNotes'
        ]),

        save() {
            const data = {
                visit: this.$route.params.visitId,
                next_steps: this.next_steps,
                next_visit_date: this.next_visit_date
            };

            this.doctorNotes.saveRecordFollowUp(data);
        },
        async fetchNextSteps(){
            try {
                const response = await this.doctorNotes.fetchNextSteps(this.$route.params.visitId);
                const data = response;

               
                if (response && response.success && response.next_steps) {
                    this.next_steps = response.next_steps;  // Correct access
                } else {
                }

                } catch (error) {
                    console.error("Error fetching notes:", error);
                }

        },
        fetchNotes() {
            this.setDoctorsNotes({
                params: {
                    visit_id: this.$route.params.visitId,
                },
            });
        }
    },

    mounted() {
        this.fetchNotes();
        this.fetchNextSteps();
        this.options.config([
            'age_in',
        ]);
    }
}
</script>
<style>
.v-input--selection-controls {
    margin-top: 0;
    padding-top: 0;
}
v-switch  {font-weight:bold;}
.v-switch  {font-weight:bold;}
h6 {font-weight:bold;}
/*label {font-weight:bold;}*/
.spans {font-weight:bold;}

</style>
