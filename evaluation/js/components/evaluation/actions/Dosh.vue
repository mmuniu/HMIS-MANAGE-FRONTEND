<!-- this is some kind of dosh 13 form breakdown -->
<template>
    <collabmed-loading v-if="loading"></collabmed-loading>
    <div v-else>
        <v-card flat>

            <v-card-title>
                <h4 style="text-decoration: underline"
                    class="pt-6 pl-2"> (A): Medical History: </h4>
                <v-spacer/>
                <v-btn small color="primary" @click="printDoshForm()">
                    print dosh 13 form
                </v-btn>
            </v-card-title>

            <v-row class="ml-1">
                <v-col cols="5" class="mx-4">
                    <h4>Has ever suffered from any of the following conditions:</h4>
                    <div>
                        <span v-for="(illness, index) in illnesses" class="ma-4">
                            <span>
                                <input type="checkbox"
                                       :value="illness"
                                       v-model="dosh.suffered_from"
                                       :key="index + 'a'"
                                       @change="saveData('suffered_from')"/>
                                <label> {{ illness }}</label>
                            </span>
                            <br v-if="((index +1) % 3) === 0"/>
                        </span>
                    </div>
                </v-col>

                <v-col cols="5" class="mx-4">
                    <v-textarea label="Additional details of the above"
                                @change="saveData('suffered_info')"
                                v-model="dosh.suffered_info">
                    </v-textarea>
                </v-col>

                <v-col cols="5" class="mx-4">
                    <h4>Has had vaccinations against the following diseases:</h4>
                    <div>
                        <span v-for="(vaccination, index) in vaccinations" class="ma-4">
                            <span>
                                <input type="checkbox"
                                       :value="vaccination"
                                       v-model="dosh.vaccinations_against"
                                       @change="saveData('vaccinations_against')"
                                       :key="index + 'a'"/>
                                <label> {{ vaccination }}</label>
                            </span>
                            <br v-if="((index +1) % 3) === 0"/>
                        </span>
                    </div>
                </v-col>

                <v-col cols="5" class="mx-4">
                    <v-switch label="Has been admitted before"
                              @change="saveData('been_admitted_before')"
                              v-model="dosh.been_admitted_before">
                    </v-switch>
                </v-col>

                <v-col cols="5" class="mx-4" v-if="dosh.been_admitted_before">
                    <v-text-field label="Admission duration"
                                  @change="saveData('admission_duration')"
                                v-model="dosh.admission_duration">
                    </v-text-field>
                </v-col>

                <v-col cols="5" class="mx-4" v-if="dosh.been_admitted_before">
                    <v-text-field label="Reason for admission"
                                  @change="saveData('admission_reason')"
                                  v-model="dosh.admission_reason">
                    </v-text-field>
                </v-col>

                <v-col cols="5" class="mx-4">
                    <v-switch label="Has has had an operation"
                              @change="saveData('been_operated_on')"
                              v-model="dosh.been_operated_on">
                    </v-switch>
                </v-col>

                <v-col cols="5" class="mx-4" v-if="dosh.been_operated_on">
                    <v-text-field label="Please provide the operation details"
                                  @change="saveData('operation_details')"
                                  v-model="dosh.operation_details">
                    </v-text-field>
                </v-col>

                <v-col cols="5" class="mx-4">
                    <v-switch label="Does smoke or take alcohol"
                              @change="saveData('smoker_or_alcoholic')"
                              v-model="dosh.smoker_or_alcoholic">
                    </v-switch>
                </v-col>
            </v-row>

            <v-divider/>


            <v-row>
                <v-col style="border-right: 1px solid #e2e2e2" cols="12" md="4">
                    <h4 style="text-decoration: underline"
                        class="mt-2 pl-2 text-center">(B): Family History: </h4>

                    <v-row class="mx-4"
                           v-for="(member, memberType) in dosh.family_history" :key="memberType + 'b'">
                        <v-col cols="12" class="mx-4">
                            <span>
                                <input type="checkbox"
                                       @change="saveData('family_history')"
                                       v-model="dosh.family_history[memberType].living"/>
                                <label> {{ memberType + ' (is Alive) ' }}</label>
                            </span>
                        </v-col>
                        <v-col cols="12" class="mx-4">
                            <v-text-field v-if="!dosh.family_history[memberType].living"
                                          @change="saveData('family_history')"
                                    :label="'Please indicate the cause of death of the ' + memberType "
                                    v-model="dosh.family_history[memberType].cause_of_death">
                            </v-text-field>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="12" md="8">
                    <h4 style="text-decoration: underline"
                        class="mt-2 pl-2 text-center">(C): Occupational History: </h4>

                    <v-row class="mx-4"
                           @change="saveData($event)"
                           v-for="(occupation, index) in dosh.occupation_history" :key="index + 'c'"
                    >
                        <v-col cols="4">
                            <v-text-field v-model="dosh.occupation_history[index].place_of_work"
                                          @change="saveData('occupation_history')"
                                          label="Place of work"/>
                        </v-col>
                        <v-col cols="3">
                            <v-text-field v-model="dosh.occupation_history[index].job"
                                          @change="saveData('occupation_history')"
                                          label="Job"/>
                        </v-col>
                        <v-col cols="2">
                            <v-text-field v-model="dosh.occupation_history[index].start_year"
                                          @change="saveData('occupation_history')"
                                          label="From year"/>
                        </v-col>
                        <v-col cols="2">
                            <v-text-field v-model="dosh.occupation_history[index].end_year"
                                          @change="saveData('occupation_history')"
                                          label="To year"/>
                        </v-col>

                        <v-col cols="1">
                            <v-btn small icon @click="removeOccupation()">
                                <v-icon color="red">close</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>


                    <v-btn small color="primary" @click="addOccupation()">add occupation</v-btn>

                </v-col>
            </v-row>

            <v-divider/>

            <h4 style="text-decoration: underline"
                class="pt-6 pl-2">Part 2: Medical Examination: </h4>

            <v-row class="ml-1">

               <v-col cols="12">
                   <h5 class="py-3">General: </h5>
               </v-col>

                <v-col class="px-2" md="3" cols="12">
                    <v-text-field label="Appearance"
                                  @change="saveData('appearance')"
                                  v-model="dosh.appearance"/>
                </v-col>

                <v-col class="px-2" md="3" cols="12">
                    <v-text-field label="Hearing"
                                  @change="saveData('hearing')"
                                  v-model="dosh.hearing"/>
                </v-col>

                <v-col class="px-2" md="3" cols="12">
                    <v-text-field label="Intelligence"
                                  @change="saveData('intelligence')"
                                  v-model="dosh.intelligence"/>
                </v-col>

                <v-col class="px-2" md="3" cols="12">
                    <v-text-field label="Visual acuity. RT"
                                  @change="saveData('visual_acuity')"
                                  v-model="dosh.visual_acuity.rt"/>
                </v-col>

                <v-col class="px-2" md="3" cols="12">
                    <v-text-field label="Visual acuity. LT"
                                  @change="saveData('visual_acuity')"
                                  v-model="dosh.visual_acuity.lt"/>
                </v-col>

                <v-col class="px-2" md="3" cols="12">
                    <v-text-field label="Colour visio RT"
                                  @change="saveData('color_visio')"
                                  v-model="dosh.color_visio.rt"/>
                </v-col>

                <v-col class="px-2" md="3" cols="12">
                    <v-text-field label="Colour visio LT"
                                  @change="saveData('color_visio')"
                                  v-model="dosh.color_visio.lt"/>
                </v-col>

                <v-col class="px-2" md="3" cols="12">
                    <v-text-field label="Anaemia"
                                  @change="saveData('aneamia')"
                                  v-model="dosh.aneamia"/>
                </v-col>

                <v-col class="px-2" md="3" cols="12">
                    <v-text-field label="Skin"
                                  @change="saveData('skin')"
                                  v-model="dosh.skin"/>
                </v-col>

                <v-col class="px-2" md="3" cols="12">
                    <v-text-field label="Glands"
                                  @change="saveData('glands')"
                                  v-model="dosh.glands"/>
                </v-col>

                <v-col class="px-2" md="3" cols="12">
                    <v-text-field label="ENT"
                                  @change="saveData('ent')"
                                  v-model="dosh.ent"/>
                </v-col>

                <v-col class="px-2" md="3" cols="12">
                    <v-text-field label="others"
                                  @change="saveData('other_details')"
                                  v-model="dosh.other_details"/>
                </v-col>


               <v-col cols="12">
                   <v-row>
                       <v-col style="border-right: 1px solid #e2e2e2">
                           <!-- cardiovascular -->
                           <v-col cols="12">
                               <h5 class="py-3">Cardiovscular: </h5>
                           </v-col>

                           <v-col class="px-2" md="4" cols="12">
                               <v-text-field label="Pulse"
                                             @change="saveData('cardiovascular')"
                                             v-model="dosh.cardiovascular.pulse"/>
                           </v-col>

                           <v-col class="px-2" md="4" cols="12">
                               <v-text-field label="BP"
                                             @change="saveData('cardiovascular')"
                                             v-model="dosh.cardiovascular.bp"/>
                           </v-col>

                           <v-col class="px-2" md="4" cols="12">
                               <v-text-field label="Other"
                                             @change="saveData('cardiovascular')"
                                             v-model="dosh.cardiovascular.other"/>
                           </v-col>
                       </v-col>

                       <v-col>
                           <!-- respiratory-->
                           <v-col cols="12">
                               <h5 class="py-3">Respiratory: </h5>
                           </v-col>

                           <v-col class="px-2" md="4" cols="12">
                               <v-text-field label="Rate"
                                             @change="saveData('respiratory')"
                                             v-model="dosh.respiratory.rate"/>
                           </v-col>

                           <v-col class="px-2" md="4" cols="12">
                               <v-text-field label="Other"
                                             @change="saveData('respiratory')"
                                             v-model="dosh.respiratory.other"/>
                           </v-col>
                       </v-col>
                   </v-row>
               </v-col>


               <v-col cols="12">
                   <v-row>
                       <v-col>
                           <v-col cols="12">
                               <h5 class="py-3">Abdomen central nervous system: </h5>
                           </v-col>

                           <v-col class="px-2" cols="12">
                               <v-textarea label="Reflexes"
                                           @change="saveData('reflexes')"
                                           v-model="dosh.reflexes"/>
                           </v-col>
                       </v-col>
                       <v-col>
                           <v-col cols="12">
                               <h5 class="py-3">Genito-urinary tract musculo-skeletal </h5>
                           </v-col>

                           <v-col class="px-2" cols="12">
                               <v-textarea label="Genito-urinary tract musculo-skeletal "
                                           @change="saveData('gumts')"
                                           v-model="dosh.gumts"/>
                           </v-col>
                       </v-col>
                   </v-row>
               </v-col>
            </v-row>


            <div>
                <h4 style="text-decoration: underline"
                    class="pt-6 pl-2">Part 3: Investigations: </h4>
                <span class="caption pl-2">(As indicated in the act and any other test you might find fit as from your examinations)</span>
            </div>


            <v-row class="ml-1">
                <v-col cols="12">
                    <v-text-field label="Investigations"
                                  @change="saveData('investigations')"
                                  placeholder="e.g. complete blood count, blood group etc"
                                  v-model="dosh.investigations"
                    ></v-text-field>
                </v-col>


                <v-col cols="12">
                    <h5 class="py-3">Recommendations: </h5>
                </v-col>

                <v-col cols="12">
                    <span>
                        <input type="checkbox"
                               @change="saveData('recommendations')"
                               v-model="dosh.recommendations.fit_for_all"/>
                        <label>Fit for all classes of employment</label>
                    </span>
                </v-col>

                <v-col cols="12">
                    <span>
                        <input type="checkbox"
                               @change="saveData('recommendations')"
                               v-model="dosh.recommendations.fit_but_subject_to.fit"/>
                        <label>Fit but subject to the following conditions:</label>
                    </span>
                </v-col>

                <v-col cols="12" v-if="dosh.recommendations.fit_but_subject_to.fit">
                    <v-text-field label="conditions"
                                  @change="saveData('recommendations')"
                                  v-model="dosh.recommendations.fit_but_subject_to.conditions"/>
                </v-col>

                <v-col cols="12">
                    <span>
                        <input type="checkbox"
                               @change="saveData('recommendations')"
                               v-model="dosh.recommendations.fit_for_specific.fit"/>
                        <label>Fit for specific jobs</label>
                    </span>
                </v-col>

                <v-col cols="12" v-if="dosh.recommendations.fit_for_specific.fit">
                    <v-text-field label="conditions"
                                  @change="saveData('recommendations')"
                                  placholder="Examples of jobs he/she can undertake"
                                  v-model="dosh.recommendations.fit_for_specific.conditions"/>
                </v-col>

                <v-col cols="12">
                    <span>
                        <input type="checkbox"
                               @change="saveData('recommendations')"
                               v-model="dosh.recommendations.unfit"/>
                        <label>Recommended unfit</label>
                    </span>
                </v-col>

            </v-row>
        </v-card>
    </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import Dosh from "@evaluation/libs/dosh/Dosh";

export default {
    data: () => ({
        loading: false,
        dosh: new Dosh(),
    }),

    computed: {
        ...mapGetters({
            dosh13: 'getDosh13'
        }),

        illnesses () {
            return [
                'Tueberculosis', 'High blood pressure',
                'Epilepsy', 'Heart problems', 'Pneumonia',
                'Diabetes', 'Kidney and bladder disease',
                'Asthma', 'Venereal disease',
                'Backache', 'Other illness'
            ]
        },

        vaccinations () {
            return [
                'Tuberculosis', 'DPT',
                'Cholera', 'Typhoid',
                'Yellow fever'
            ]
        }
    },

    watch: {
        dosh13 (val) {
            this.loading = false;

            this.dosh.assemble(val);
        }
    },


    methods: {
        ...mapActions([
            'setDosh13',
        ]),

        removeOccupation (index) {
            this.dosh.occupation_history.splice(index, 1);

            this.saveData('occupation_history');
        },

        addOccupation () {
            if(this.dosh.occupation_history.length >= 5) {
                flash({
                    message: "You can only add a maximum of five occupations",
                    alert: "error"
                })
            } else {
                this.dosh.occupation_history.push({
                    place_of_work: null,
                    job: null,
                    start_year: null,
                    end_year: null,
                })
            }
        },

        async saveData (type) {
            const response = await this.dosh.saveData(type, this.$route.params.visitId);
        },

        init() {
            this.loading = true;

            this.setDosh13({
                params: {
                    visit_id: this.$route.params.visitId
                }
            })
        },

        printDoshForm () {
            window.open(`/evaluation/dosh13/${this.$route.params.visitId}/print-dosh-13-form`)
        }
    },

    mounted () {
        this.init()
    }
}
</script>
