<template>
    <transition name="slide">
        <v-card>
            <v-card-text>
                <collabmed-loading v-if="! initialised"></collabmed-loading>

                <div v-else>
                    <v-toolbar flat height="100" color="white">
                        <v-avatar size="60px">
                            <img v-if="displayImage" :src="displayImage" alt="Avatar">
                            <img v-else src="/img/placeholder.png" alt="Avatar">
                        </v-avatar>

                        <p class="ml-3">
                            <span class="font-weight-bold pl-2 subheading grey--text text--darken-1">
                                {{ displayName }} |
                                {{ displaySex }} |
                                {{ displayDob }} ( {{ displayAge }})
                            </span>
                            <br>
                          <v-chip color="red" text-color="white" small v-if="patientInfo && patientInfo.number">
                          Patient number: {{ patientInfo.number }}
                        </v-chip>&nbsp;&nbsp;

                          <v-chip color="green" text-color="white" small v-if="showWallet">
                            Wallet number: {{ wallet_number}}
                          </v-chip>


                        </p>


                        <v-spacer></v-spacer>

                        <div v-html="content" v-if="content"></div>

                    </v-toolbar>

                </div>
            </v-card-text>
        </v-card>

    </transition>
</template>

<script>
import Patient from '@reception/libs/patients/Patient';
import axios from 'axios';

export default {
    name: 'finance-patient-information',

    props: {
        patient: {
            default: null,
        },

        patientId: {
            default: null,
            type: [String, Number],
        },

        // props for staff support
        staff: {
            default: null,
        },

        staffId: {
            default: null,
            type: [String, Number],
        },

        // props for corporate support
        corporate: {
            default: null,
        },

        corporateId: {
            default: null,
            type: [String, Number],
        },

        content: {
            default: null,
        },
    },

    data() {
        return {
            patientObj: new Patient(),
            patientInfo: null,
            staffInfo: null,
            corporateInfo: null,
            wallet_number: null,
        };
    },

    computed: {
        patientLoaded() {
            return this.patientObj.patient;
            return this.patientObj.patient;
        },

        initialised() {
            return this.patientInfo || this.staffInfo || this.corporateInfo;
        },

        // helpers for template
        displayImage() {
            return (this.patientInfo && this.patientInfo.image) ? this.patientInfo.image
                : (this.staffInfo && (this.staffInfo.image || this.staffInfo.avatar)) ? (this.staffInfo.image || this.staffInfo.avatar)
                : (this.corporateInfo && this.corporateInfo.logo) ? this.corporateInfo.logo
                : null;
        },

        displayName() {
            return (this.patientInfo && this.patientInfo.full_name) ? this.patientInfo.full_name
                : (this.staffInfo && (this.staffInfo.full_name || this.staffInfo.name)) ? (this.staffInfo.full_name || this.staffInfo.name)
                : (this.corporateInfo && this.corporateInfo.name) ? this.corporateInfo.name
                : 'Unknown';
        },

        displaySex() {
            if (this.corporateInfo) return 'N/A';
            return (this.patientInfo && this.patientInfo.sex) ? this.patientInfo.sex
                : (this.staffInfo && this.staffInfo.sex) ? this.staffInfo.sex
                : 'Gender not available';
        },

        displayDob() {
            if (this.corporateInfo) return 'N/A';
            return (this.patientInfo && this.patientInfo.dob_friendly) ? this.patientInfo.dob_friendly
                : (this.staffInfo && this.staffInfo.dob_friendly) ? this.staffInfo.dob_friendly
                : 'DOB not available';
        },

        displayAge() {
            if (this.corporateInfo) return 'N/A';
            return (this.patientInfo && this.patientInfo.age_friendly) ? this.patientInfo.age_friendly
                : (this.staffInfo && this.staffInfo.age_friendly) ? this.staffInfo.age_friendly
                : 'Age not available';
        },

        showWallet() {
            return this.patientInfo && this.msetting('finance.wallet_integrated');
        }
    },

    watch: {
        patientLoaded(value) {
            if (value) {
                this.patientInfo = value;
            }
        },
    },

    async mounted() {
        // if patient object passed as prop
        if (this.patient) {
            this.patientInfo = JSON.parse(this.patient);
        } else if (this.patientId) {
            this.patientObj.find(this.patientId);
        }

        // staff passed as JSON
        if (this.staff) {
            try {
                this.staffInfo = JSON.parse(this.staff);
            } catch (e) {
                // fallback: raw object
                this.staffInfo = this.staff;
            }
        } else if (this.staffId) {
            await this.fetchStaff(this.staffId);
        }

        // handle corporate data
        if (this.corporate) {
            try {
                this.corporateInfo = JSON.parse(this.corporate);
            } catch (e) {
                // fallback: raw object
                this.corporateInfo = this.corporate;
            }
        } else if (this.corporateId) {
            await this.fetchCorporate(this.corporateId);
        }

        // wallet only for patient
        if (this.patientId && this.msetting('finance.wallet_integrated')) {
            this.wallet_number = await this.patientObj.fetchPatientWalletAccount(this.patientId);
        }
    },

    methods: {
        async fetchStaff(id) {
            try {
                const res = await axios.get(`/api/users/${id}`);
                this.staffInfo = res && res.data ? res.data.user : null;
            } catch (e) {
                // try alternative endpoint if necessary or set null
                console.error('Failed fetching staff', e);
                this.staffInfo = null;
            }
        },

        async fetchCorporate(id) {
          console.log('fetching corporate id')
            try {
                const res = await axios.get(`/api/finance/corporates/${id}`);
                this.corporateInfo = res && res.data && res.data.success ? res.data.data : null;
                console.log('Corporate data:', this.corporateInfo); // For debugging
            } catch (e) {
                console.error('Failed fetching corporate', e);
                this.corporateInfo = null;
            }
        }
    },
};
</script>
<style scoped>
/* ...existing styles... */
</style>
