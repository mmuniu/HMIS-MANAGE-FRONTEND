<template>
    <div>
        <v-card flat>
            <v-card-text>
                <v-row>
                    <v-col cols="6">
                        <div class="body-2 ma-0 pa-0 primary--text text--lighten-1">
                            * Admission Process: <br/>
                            <div class="ml-4">
                                <span class="px-2"> Step one: The patient must have tested positive </span> <br/>
                                <span class="px-2"> Step two: Home assessment - (The home has to meet the MOH stipulated  guidelines)</span> <br/>
                                <span class="px-2"> Step three: Approval by a health care worker</span> <br/>
                                <span class="px-2"> Step four: Approval by the director of public health</span> <br/>
                            </div>
                        </div>
                    </v-col>

                    <v-col cols="12" md="6" class="px-4">
                        <patient-search v-if="!this.$route.query.p_id" @patientSelected="patientSelected"></patient-search>

                        <div v-if="patientObj">
                            <span class="px-2">Name: <span class="font-weight-bold">{{ patientObj.full_name }}</span> </span> <br/>
                            <span class="px-2">Age: <span class="font-weight-bold">{{ patientObj.age_friendly }}</span> </span>
                            <span class="px-2">Mobile: <span class="font-weight-bold">{{ patientObj.mobile }}</span> </span> <br/>
                            <span class="px-2">Nationality: <span class="font-weight-bold">{{ patientObj.nationality }}</span> </span>
                            <span class="px-2">County: <span class="font-weight-bold">{{ patientObj.county }}</span> </span>
                            <span class="px-2">Sub county: <span class="font-weight-bold">{{ patientObj.sub_county }}</span> </span>
                        </div>
                    </v-col>
                </v-row>

                <v-divider/>
            </v-card-text>

            <v-expansion-panels flat v-model="panel" multiple>
                <!--assessment-->
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <h4 style="text-decoration: underline">Asssesment</h4>
                        <v-spacer/>
                        <h5 class="text-right">Grand total: {{ selfQuarantine.assessment.total_score }} <span class="caption"> pts</span></h5>
                    </v-expansion-panel-header>

                    <v-expansion-panel-content>
                        <v-row>
                            <v-col cols="12" md="8">
                                <span class="caption">
                                    This checklist will be used to assess the environmental conditions for home-based isolation
                                    and care of patients with COVID-19. <span>A score of 75 and above qualifies</span>
                                    <br/>
                                    Note: The system will automatically award the marks thereafter
                                </span>
                            </v-col>

                            <!-- infrastructure-->
                            <v-col cols="12"><h5>A. INFRASTRUCTURE</h5></v-col>
                            <v-col cols="12">
                                <v-row>
                                    <v-col cols="12" md="6">
                                        <v-switch label="Functioning telephone/mobile phone (score 3)"
                                                  @change="updateScore('infrastructure')"
                                                  v-model="selfQuarantine.assessment.infrastructure.working_phone.condition">
                                        </v-switch>
                                        <v-switch label="Potable water (score 10)"
                                                  @change="updateScore('infrastructure')"
                                                  v-model="selfQuarantine.assessment.infrastructure.potable_water.condition">
                                        </v-switch>
                                        <v-switch label="Cooking source (and fuel) score(2)"
                                                  @change="updateScore('infrastructure')"
                                                  v-model="selfQuarantine.assessment.infrastructure.cooking_source.condition">
                                        </v-switch>
                                        <v-switch label="Adequate environmental ventilation score(5)"
                                                  @change="updateScore('infrastructure')"
                                                  v-model="selfQuarantine.assessment.infrastructure.ventilated.condition">
                                        </v-switch>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-switch label="Any other means to rapidly communicate with the health system (score 1)"
                                                  @change="updateScore('infrastructure')"
                                                  v-model="selfQuarantine.assessment.infrastructure.other_means_to_rapid_communicate.condition">
                                        </v-switch>
                                        <v-switch label="Sewerage system score(1)"
                                                  @change="updateScore('infrastructure')"
                                                  v-model="selfQuarantine.assessment.infrastructure.sewerage_system.condition">
                                        </v-switch>
                                        <v-switch label="Operable electricity or other source of power score(1)"
                                                  @change="updateScore('infrastructure')"
                                                  v-model="selfQuarantine.assessment.infrastructure.operable_power.condition">
                                        </v-switch>
                                    </v-col>
                                    <v-col cols="12">
                                        <h5 class="font-weight-black">Sub total (A): {{ selfQuarantine.assessment.infrastructure.total_score }}</h5>
                                    </v-col>
                                </v-row>
                            </v-col>

                            <!-- Accessibility-->
                            <v-col cols="12"><h5>B. ACCESSIBILITY / HALLWAYS / STAIRWELLS </h5></v-col>
                            <v-col cols="12">
                                <v-row>
                                    <v-col cols="12" md="6">
                                        <v-switch label="Are there adequate locks on all outside and inside doors (score 1)"
                                                  @change="updateScore('accessibility')"
                                                  v-model="selfQuarantine.assessment.accessibility.adequate_locks.condition">
                                        </v-switch>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-switch label="Are windows and screens easy to open and close (score 5)"
                                                  @change="updateScore('accessibility')"
                                                  v-model="selfQuarantine.assessment.accessibility.easy_to_open_accesses.condition">
                                        </v-switch>
                                    </v-col>
                                </v-row>

                                <v-col cols="12">
                                    <h5 class="font-weight-black">Sub total (B): {{ selfQuarantine.assessment.accessibility.total_score }}</h5>
                                </v-col>
                            </v-col>

                            <!-- Accommodation-->
                            <v-col cols="12"><h5>C. ACCOMMODATION </h5></v-col>
                            <v-col cols="12">
                                <v-row>
                                    <v-col cols="12" md="6">
                                        <v-switch label="Separate well ventilated room or bedroom for the patient (score 30)"
                                                  @change="updateScore('accommodation')"
                                                  v-model="selfQuarantine.assessment.accommodation.separate_room.condition">
                                        </v-switch>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-switch label="Accessible bathroom for the patient (score 10)"
                                                  @change="updateScore('accommodation')"
                                                  v-model="selfQuarantine.assessment.accommodation.accessible_bathroom.condition">
                                        </v-switch>
                                    </v-col>

                                    <v-col cols="12">
                                        <h5 class="font-weight-black">Sub total (C): {{ selfQuarantine.assessment.accommodation.total_score }}</h5>
                                    </v-col>
                                </v-row>
                            </v-col>

                            <!-- Accommodation-->
                            <v-col cols="12"><h5>D. RESOURCES </h5></v-col>
                            <v-col cols="12">
                                <v-row>
                                    <v-col cols="12" md="6">
                                        <v-switch label="Is food available or arrangements in place to ensure that food is available? (score 5)"
                                                  @change="updateScore('resources')"
                                                  v-model="selfQuarantine.assessment.resources.is_food_available.condition">
                                        </v-switch>
                                        <v-switch label="Are surgical masks available (patient)? (score 3)"
                                                  @change="updateScore('resources')"
                                                  v-model="selfQuarantine.assessment.resources.surgical_masks_available.condition">
                                        </v-switch>
                                        <v-switch label="Are gloves available for care givers (score 2)"
                                                  @change="updateScore('resources')"
                                                  v-model="selfQuarantine.assessment.resources.gloves_for_care_givers.condition">
                                        </v-switch>
                                        <v-switch label="Are household cleaning and disinfection products available? (score 3)"
                                                  @change="updateScore('resources')"
                                                  v-model="selfQuarantine.assessment.resources.disinfectants_available.condition">
                                        </v-switch>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-switch label="Are necessary medications available or arrangements in place for safe delivery (if any?) (score 5)"
                                                  @change="updateScore('resources')"
                                                  v-model="selfQuarantine.assessment.resources.medications_available.condition">
                                        </v-switch>
                                        <v-switch label="Are face masks available (care providers, household contacts)? (score 2)"
                                                  @change="updateScore('resources')"
                                                  v-model="selfQuarantine.assessment.resources.face_masks_contacts.condition">
                                        </v-switch>
                                        <v-switch label="Are Hand-hygiene supplies available? (Running water, soap, alcohol-based hand rub) (score 3)"
                                                  @change="updateScore('resources')"
                                                  v-model="selfQuarantine.assessment.resources.hand_hygiene_available.condition">
                                        </v-switch>
                                    </v-col>

                                    <v-col cols="12">
                                        <h5 class="font-weight-black">Sub total (D): {{ selfQuarantine.assessment.resources.total_score }}</h5>
                                    </v-col>
                                </v-row>
                            </v-col>

                            <!-- Accommodation-->
                            <v-col cols="12"><h5>E. PRIMARY CARE AND SUPPORT </h5></v-col>
                            <v-col cols="12">
                                <v-row>
                                    <v-col cols="12" md="6">
                                        <v-switch label="Is there a designated person to provide care and support ? (score 5)"
                                                  @change="updateScore('primary_care')"
                                                  v-model="selfQuarantine.assessment.primary_care.designated_care_giver.condition">
                                        </v-switch>
                                        <v-switch label="Is there access to medical advice and care ? (score 3)"
                                                  @change="updateScore('primary_care')"
                                                  v-model="selfQuarantine.assessment.primary_care.access_to_medical_advice.condition">
                                        </v-switch>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-switch label="Are there any at-risk people at home? (e.g.
                            children < 2 years of age, elderly > 65 years of age, immunocompromised people (score -10)"
                                                  @change="updateScore('primary_care')"
                                                  v-model="selfQuarantine.assessment.primary_care.any_other_persons_at_risk.condition">
                                        </v-switch>
                                    </v-col>

                                    <v-col cols="12">
                                        <h5 class="font-weight-black">Sub total (E): {{ selfQuarantine.assessment.primary_care.total_score }}</h5>
                                    </v-col>
                                </v-row>
                            </v-col>

                            <!-- Accommodation-->
                            <v-col cols="12"><h5>Other criteria to observe</h5></v-col>
                            <v-col cols="12">
                                <v-row>
                                    <v-col cols="12" md="6">
                                        <v-switch label="Laboratory confirmed COVID-19"
                                                 @change="selfQuarantine.save(selfQuarantine.assessment.lab_confirmations, 'lab_confirmations')"
                                                  v-model="selfQuarantine.assessment.lab_confirmations.is_positive">
                                        </v-switch>
                                        <v-switch label="Absence of co-morbidities"
                                                  @change="selfQuarantine.save(selfQuarantine.assessment.lab_confirmations, 'lab_confirmations')"
                                                  v-model="selfQuarantine.assessment.lab_confirmations.absence_comorbidities">
                                        </v-switch>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-switch label="Asymptomatic patients or patients with mild symptoms of COVID-19"
                                                  @change="selfQuarantine.save(selfQuarantine.assessment.lab_confirmations, 'lab_confirmations')"
                                                  v-model="selfQuarantine.assessment.lab_confirmations.asymptomative">
                                        </v-switch>
                                        <v-switch label="Access to a suitable space for home-based-care"
                                                  @change="selfQuarantine.save(selfQuarantine.assessment.lab_confirmations, 'lab_confirmations')"
                                                  v-model="selfQuarantine.assessment.lab_confirmations.acsess_to_suitable_hbc_home">
                                        </v-switch>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <h4>Grand total: {{ selfQuarantine.assessment.total_score }} <span class="caption"> pts</span></h4>
                            </v-col>
                        </v-row>

                        <v-divider/>
                    </v-expansion-panel-content>
                </v-expansion-panel>

                <v-expansion-panel>
                    <v-expansion-panel-header><h4 style="text-decoration: underline">Admission details</h4> </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-row>
                            <v-col cols="12" md="6" class="px-4">
                                <collabmed-date-time-picker
                                        @change="autoSaveData()"
                                        v-model="selfQuarantine.starting_on"
                                        dateOnly outline
                                        label="Starting on"></collabmed-date-time-picker>
                                <br/>
                                <span v-if="$route.query.inst_id">{{ selfQuarantine.starting_on }}</span>
                            </v-col>

                            <v-col cols="12" md="6" class="px-4">
                                <v-text-field label="No of days"
                                              @change="autoSaveData()"
                                              v-model="selfQuarantine.days"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="6" class="px-4">
                                <system-google-places @change="autoSaveData()" label="Place" v-model="selfQuarantine.place"></system-google-places>
                                <br/>
                                <span v-if="$route.query.inst_id && selfQuarantine.place">{{ selfQuarantine.place.name }}</span>
                            </v-col>

                            <v-col cols="12" md="6" class="px-4">
                                <v-textarea label="Any other details"
                                            @change="autoSaveData()"
                                            placeholder="Any other info about the patient you see isn't captured or need to be noted"
                                            v-model="selfQuarantine.other_details">
                                </v-textarea>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12">
                                <v-btn small color="primary" @click="autoSaveData()">save</v-btn>
                            </v-col>
                        </v-row>
                    </v-expansion-panel-content>
                </v-expansion-panel>


                <v-expansion-panel>
                    <v-expansion-panel-header><h4 style="text-decoration: underline">Approvals</h4> </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-row>
                            <v-col cols="12" md="6" class="px-4" style="border-right 1px solid grey">

                                <h6 class="pr-10">Approve as a healthcare worker</h6>

                                <v-textarea label="comments"
                                            v-model="selfQuarantine.as_health_worker.coments"></v-textarea>


                                <div v-if="!selfQuarantine.as_health_worker.approve_msg || $route.query.editing">
                                    <v-btn small color="primary" @click="approvalStateUpdate(1, 'as_health_worker')">Approve</v-btn>
                                    <v-btn small color="error" @click="approvalStateUpdate(0, 'as_health_worker')">reject</v-btn>
                                </div>
                                <div v-if="selfQuarantine.as_health_worker.approve_msg" class="mt-2">
                                   <v-chip
                                           label
                                           outlined
                                           class="purple black--text">
                                       {{ selfQuarantine.as_health_worker.approve_msg }}
                                   </v-chip>
                                </div>
                            </v-col>

                            <v-col cols="12" md="6"  class="px-4">

                                <h6 class="pr-10">AApprove as the directory of public health</h6>

                                <v-textarea label="comments"
                                            v-model="selfQuarantine.as_public_health_dir.coments">

                                </v-textarea>

                                <div v-if="!selfQuarantine.as_public_health_dir.approve_msg || $route.query.editing">
                                    <v-btn small color="primary" @click="approvalStateUpdate(1, 'as_public_health_dir')">Approve</v-btn>
                                    <v-btn small color="error" @click="approvalStateUpdate(0, 'as_public_health_dir')">reject</v-btn>
                                </div>
                                <div v-if="selfQuarantine.as_public_health_dir.approve_msg" class="mt-2">
                                   <v-chip outlined
                                           label
                                            class="purple black--text">
                                       {{ selfQuarantine.as_public_health_dir.approve_msg }}
                                   </v-chip>
                                </div>
                            </v-col>
                        </v-row>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-card>
    </div>
</template>
<script>
import PatientSearch from '@reception/components/patients/PatientSearch';
import SelfQuarantine from '@evaluation/libs/SelfQuarantine/SelfQuarantine';
import {mapActions, mapGetters} from "vuex";

export default {
    components: {
        PatientSearch
    },
    data: () => ({
        dialog: false,
        panel: [0],
        patientObj: null,
        selfQuarantine: new SelfQuarantine(),
    }),

    computed: {
        ...mapGetters({
            patients: 'getPatients',
            inst: 'getSelfQuarantinePatients',
        }),
    },


    watch: {
        patients(val) {
            if(val.data) {
                this.patientObj = val.data
                this.selfQuarantine.patient_id = val.data.id;
            }
        },

        inst (val) {
           if(val) {
               this.selfQuarantine.assemble(val);
           }
        }
    },

    methods: {
        ...mapActions({
            fetchPatient: 'setPatients',
            setSelfQuarantinePatients: 'setSelfQuarantinePatients',
        }),

        patientSelected(patient) {
            this.selfQuarantine.patient_id = patient.id;
            this.patientObj = patient;
        },

        async saveRecord(type = null, key = null) {
            const response = await this.selfQuarantine.save(type, key);

            if (response) {
                this.dialog = false;
                this.$emit('created');
            }
        },

        async autoSaveData(key_two) {
            let response = await this.selfQuarantine.save(null, null, key_two);

            if(response) {
                return response;
            }
        },

        updateScore(type) {
            let self = this;

            self.selfQuarantine.assessment[type].total_score = 0;

            Object.entries(this.selfQuarantine.assessment[type]).forEach(val => {
                if(val[0] !== 'total_score') {
                    if(self.selfQuarantine.assessment[type][val[0]].condition) {

                        self.selfQuarantine.assessment[type].total_score += parseInt(val[1].score);
                    }
                }
            })

            this.selfQuarantine.updateTotalScore();

            this.saveRecord(self.selfQuarantine.assessment[type], type);
        },

        async approvalStateUpdate (status, approvee) {
            this.selfQuarantine[approvee].status = status;

            let response = await this.autoSaveData(approvee);

            if(response) {
                window.history.back();
            }
        },

        init() {
            if(this.$route.query.p_id) {
                this.fetchPatient({
                    params: {
                        patient_id: this.$route.query.p_id
                    }
                });

                this.setSelfQuarantinePatients({
                    params: {
                        inst_id: this.$route.query.inst_id
                    }
                });
            }

            if(this.$route.query.approving) {
                this.panel = [2]
            }
        }
    },

    mounted() {
        this.init();
        /* remove the error messages sections <not validating here */
        document.querySelectorAll('.v-messages').forEach(e => e.remove());
    }
};
</script>
<style scoped>
    .v-input--selection-controls {
        margin-top: 0;
        padding-top: 0;
    }
</style>
