<template>
    <collabmed-loading v-if="!patients.data"></collabmed-loading>
    <div v-else>
        <v-row>
            <v-col cols="12" md="6">
                <div>
                    <div class="my-5" style="font-size: 30px; font-weight: bold">{{ patient.full_name }}</div>
                    <div>
                        <v-chip small class="mx-2 red white--text">Outpatient No: {{ patient.number }}</v-chip>
                        <v-chip small class="mx-2 primary" v-if="patient.inpatient_no">Inpatient No: {{ patient.inpatient_no }}</v-chip>
                    </div>
                </div>
                <div class="h6">
                    <div style="display: inline"  class="mr-5"> Age: {{ patient.age_friendly }}</div>
                    <div style="display: inline" class="mr-5"> Sex: {{ patient.sex }}</div>
                    <div style="display: inline" class="mr-5"> DOB: {{ patient.date_of_birth }}</div>
                </div>

                <div class="mt-7" style="width: 100%">
                    <h4>Contact information: </h4>
                    <div class="my-2">Mobile: {{ patient.mobile }}</div>
                    <div class="my-2">Email: {{ patient.email }}</div>
                    <div class="my-2">Id Number: {{ patient.id_no }}</div>
                    <div v-if="patient.home_location" class="my-2">Home: {{ patient.home_location.name }}
                        <a :href="'/reception/show-on-map?lat=' + patient.home_location.lat + '&long=' + patient.home_location.long" target="_blank">
                            <button  class="pa-1 v-btn primary btn-xs btn_assign">
                                <i class="fa fa-map"></i> show on map
                            </button>
                        </a>

                    </div>
                    <div v-if="patient.work_location" class="my-2">Work: {{ patient.work_location.name }}
                        <a :href="'/reception/show-on-map?lat=' + patient.work_location.lat + '&long=' + patient.work_location.long" target="_blank">
                            <button  class="pa-1 v-btn primary btn-xs btn_assign">
                                <i class="fa fa-map"></i> show on map
                            </button>
                        </a>

                    </div>
                </div>

                <div class="mt-7" style="width: 100%" v-if="patient.is_dependant">
                    <h4>Is a dependant to:  </h4>
                    <div class="my-2">
                        <v-btn rounded small outlined
                               v-for="(dependsOn, index) in patient.is_dependant.depends_on"
                               :key="index"
                               class="mx-1"
                               :href="`/reception/patients/${dependsOn.id}/edit`"
                               color="primary">
                            {{ dependsOn.name }}
                        </v-btn>
                    </div>
                </div>
            </v-col>
            <v-col cols="12" md="6">
                <div id="patientIdCard">
                    <reception-patient-identity-card :patient-data="patient"></reception-patient-identity-card>
                </div>

                <v-card-actions>
                    <div>
                        <input type="file" id="file" ref="file" v-on:change="onChangeFileUpload()"/>
                        <v-btn  small color="primary" @click="uploadImage()">upload image</v-btn>
                    </div>
                    <v-spacer/>
                    <div>
                        <v-btn  small color="error" @click="disablePatient" class="mr-2">
                            <v-icon small left>mdi-account-off</v-icon>
                            Disable Patient
                        </v-btn>
                        <v-btn  small color="primary" @click="printPatientCard">print card</v-btn>
                    </div>
                </v-card-actions>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" md="6">
                <div class="mt-7" style="width: 100%">
                    <h4>Next of kin</h4>

                    <v-data-table
                            hide-default-footer
                            :headers="nokheaders"
                            :items="patient.nok"
                            class="elevation-1"
                            :items-per-page="10"
                    >
                        <template v-slot:item.full_name="{ item }">
                            {{ item.first_name + ' ' + item.last_name }}
                        </template>
                    </v-data-table>
                </div>
            </v-col>
            <v-col cols="12" md="6">
                <div class="mt-7" style="width: 100%">
                    <h4>Insurance schemes</h4>

                    <v-data-table
                            hide-default-footer
                            :headers="headers"
                            :items="patient.schemes"
                            :items-per-page="10"
                            class="elevation-1"
                    ></v-data-table>
                </div>
            </v-col>
        </v-row>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import patientObj from '@reception/libs/patients/Patient';

export default {
    data: () => ({
        patient: null,
        patientObj: new patientObj(),
        nokheaders: [
            { text: 'Name', value: 'full_name' },
            { text: 'Mobile', value: 'mobile' },
            { text: 'Relationship', value: 'relationship' },
        ],
        headers: [
            { text: 'Scheme', value: 'scheme_name' },
            { text: 'Policy number', value: 'policy_number' },
            { text: 'Principal', value: 'principal' },
        ],
    }),

    computed: {
        ...mapGetters({
            patients: 'getPatients',
        }),
    },

    watch: {
        patients(val) {
            this.patient = val.data;
        },
    },

    methods: {
        ...mapActions([
            'setPatients',
        ]),

        printPatientCard() {
            window.open(`/reception/patients/card/${this.patient.id}/print-identity-card`, '_blank');
        },

        onChangeFileUpload() {
            this.patientObj.profile.image = this.$refs.file.files[0];
        },

        uploadImage() {
            this.patientObj.uploadImage(this.$route.params.patientId);
        },

        async disablePatient() {
            if (!confirm('Are you sure you want to disable this patient?')) {
                return;
            }

            try {
                const response = await axios.post('/api/reception/patients/disable', {
                    patient_id: this.patient.id,
                });
                
                flash({ message: 'Patient disabled successfully', alert: 'success' });
                
                // Refresh patient data
                this.setPatients({
                    params: {
                        patient_id: this.$route.params.patientId,
                    },
                });
            } catch (error) {
                flash({ 
                    message: 'Failed to disable patient: ' + (error.response?.data?.message || error.message), 
                    alert: 'error' 
                });
            }
        },
    },

    created() {
        this.setPatients({
            params: {
                patient_id: this.$route.params.patientId,
            },
        });
    },
};
</script>
