<template>
    <v-card>

        <collabmed-loading v-if="! initialised">Loading Patient Info...</collabmed-loading>

        <v-img v-else :src="getPatientImage(profile)" height="300px">
            <v-row class="fill-height">
                <v-col cols="12">
                    <v-card-title>
                        <v-dialog v-model="dialog" max-width="80%">
                            <template v-slot:activator="{ on }">
                                <v-btn rounded class="white--text purple darken-1" v-on="on">Portal</v-btn>
                            </template>

                            <reception-patients-portal :patient-id="profile.id"
                                                       v-if="dialog"
                                                       is-dialog
                                                       @close="dialog = false">
                            </reception-patients-portal>
                        </v-dialog>

                        <v-spacer></v-spacer>

                        <v-btn dark icon class="mr-3" :href="`/reception/patients/${profile.id}/edit`" :disabled="isPatientDisabled">
                            <v-icon color="primary">edit</v-icon>
                        </v-btn>

                        <v-btn dark icon :disabled="isPatientDisabled">
                            <v-icon>camera_alt</v-icon>
                        </v-btn>
                    </v-card-title>

                    <v-spacer></v-spacer>

                    <v-card-title class="white--text mt-12 pl-5 pt-12 patient-names blue">
                        <div class="text-h4">{{ profile.full_name }}</div>
                    </v-card-title>

                    <v-card-actions style="margin: 0;" class="white--text pl-5 pb-12 patient-names blue">
                        <p>( {{ profile.number }} )</p>
                        <v-spacer></v-spacer>
                    </v-card-actions>
                </v-col>
            </v-row>
        </v-img>

        <!-- Disabled banner -->
        <v-alert
            v-if="isPatientDisabled"
            type="error"
            outlined
            class="mb-4"
        >
            This patient file is <strong>DISABLED</strong>. Editing, check-ins, and updates are not allowed.
        </v-alert>

        <v-list two-line v-if="initialised">
            <v-list-item>
                <v-list-item-action>
                    <v-icon color="indigo">person</v-icon>
                </v-list-item-action>

                <v-list-item-content>
                    <v-list-item-title>{{ profile.number }}</v-list-item-title>
                    <v-list-item-subtitle>Patient Number</v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                    <v-chip label small text-color="white" color="red">{{ profile.sex }}</v-chip>
                </v-list-item-action>
            </v-list-item>

            <v-list-item>
                <v-list-item-action>
                    <v-icon color="indigo">date_range</v-icon>
                </v-list-item-action>

                <v-list-item-content>
                    <v-list-item-title>{{ profile.date_of_birth }}</v-list-item-title>
                    <v-list-item-subtitle>{{ profile.age_friendly }}</v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>

            <v-divider inset></v-divider>

            <v-list-item>
                <v-list-item-action>
                    <v-icon color="indigo">phone</v-icon>
                </v-list-item-action>

                <v-list-item-content>
                    <v-list-item-title>{{ profile.mobile }}</v-list-item-title>
                    <v-list-item-subtitle>Mobile</v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                    <v-icon>chat</v-icon>
                </v-list-item-action>
            </v-list-item>

            <v-divider inset></v-divider>

            <v-list-item>
                <v-list-item-action>
                    <v-icon color="indigo">mail</v-icon>
                </v-list-item-action>

                <v-list-item-content>
                    <v-list-item-title>{{ profile.email }}</v-list-item-title>
                    <v-list-item-subtitle>Email address</v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>

            <v-list-item v-if="profile.tsc_number">
                <v-list-item-action>
                    <v-icon color="indigo">accessibility_new</v-icon>
                </v-list-item-action>

                <v-list-item-content>
                    <v-list-item-title>TSC Number</v-list-item-title>
                    <v-list-item-subtitle>{{ profile.tsc_number }}</v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>

            <v-list-item>
                <v-list-item-action>
                    <v-icon color="indigo">stars</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>Joined on</v-list-item-title>
                    <v-list-item-subtitle>{{ profile.joined_on }}</v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>

            <v-list-item v-if="msetting('finance.wallet_integrated')">
                <v-list-item-action>
                    <v-icon color="indigo">account_balance_wallet</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>Wallet Number</v-list-item-title>
                    <v-list-item-subtitle>{{ wallet_number }}</v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>

            <v-list-item v-if="msetting('finance.wallet_integrated')">
                <v-list-item-action>
                    <v-icon color="indigo">account_balance</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>Wallet Balance</v-list-item-title>
                    <v-list-item-subtitle>{{ wallet_balance }} KSH</v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
        </v-list>

        <!-- Actions -->
        <v-card-actions class="justify-end" v-if="initialised">
            <v-btn
                color="primary"
                large
                :disabled="isPatientDisabled || formLoader"
                @click="updatePatient"
            >
                Update Patient
            </v-btn>

            <v-btn
                color="success"
                large
                :disabled="isPatientDisabled"
                @click="checkinPatient"
            >
                Check-in Patient
            </v-btn>
        </v-card-actions>

    </v-card>
</template>

<script>
import Patient from '@reception/libs/patients/Patient';

export default {
    name: 'reception-patient-info',

    props: {
        patientId: {
            default: null,
            type: [Number, String],
        },
        patient: {
            default: null,
        },
    },

    data() {
        return {
            dialog: false,
            patientObj: new Patient,
            wallet_number: null,
            wallet_balance: null,
         
        };
    },

    computed: {
        profile() {
            return this.patientObj.patient;
        },
        initialised() {
            return this.profile;
        },
        isPatientDisabled() {
            return this.profile && Number(this.patient.status) === 0;
        },
    },

    methods: {
        setup() {
            return this.patientObj.find(this.patientId);
        },

        getPatientImage(patient) {
            return patient && patient.image ? patient.image : '/img/placeholder.png';
        },

        async updatePatient() {
            if (this.isPatientDisabled) return;
            this.formLoader = true;
            try {
                await this.patientObj.update();
                flash({ message: 'Patient updated successfully', alert: 'success' });
            } finally {
                this.formLoader = false;
            }
        },

        checkinPatient() {
            if (this.isPatientDisabled) return;
            this.$emit('checkin', this.profile.id);
        },
    },

    async mounted() {
        if (!this.patient && !this.patientId) throw new Error('Please provide either the patientId or the Patient Record');
        if (this.patient) this.patientObj.patient = this.patient;
        else this.setup();

        if (this.msetting('finance.wallet_integrated')) {
            this.wallet_number = await this.patientObj.fetchPatientWalletAccount(this.patientId);
            this.wallet_balance = await this.patientObj.fetchPatientWalletBalance(this.patientId);
        }
    },
};
</script>

<style scoped>
.patient-names { opacity: .8; }
</style>
