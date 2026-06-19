<template>
    <div>
        <v-app>
            <v-navigation-drawer v-model="drawer" absolute peristent light v-if="!type">
                <v-list dense nav class="py-0">
                    <v-list-item two-line>
                        <v-list-item-avatar>
                            <img src="/img/placeholder.png">
                        </v-list-item-avatar>

                        <v-list-item-content v-if="patient">
                            <v-list-item-title style="font-weight: bold; font-size: 18px" class="py-3">
                                {{ patient.full_name }}
                            </v-list-item-title>
                            <v-list-item-subtitle>
                                mobile: {{ patient.mobile }}
                            </v-list-item-subtitle>
                            <v-list-item-subtitle>
                                patient no: {{ patient.patient_no }}
                            </v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>

                    <v-divider></v-divider>

                    <v-subheader>Meta</v-subheader>

                    <v-list-item v-for="nav in meta" :key="nav.url" link :to="usher(nav)">
                        <v-list-item-icon>
                            <v-icon>{{ nav.icon }}</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>
                                {{ nav.title }}
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>

                    <v-divider></v-divider>


                    <v-subheader>Finance</v-subheader>

                    <v-list-item v-for="nav in finance" :key="nav.url" link :to="usher(nav)">
                        <v-list-item-icon>
                            <v-icon>{{ nav.icon }}</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>
                                {{ nav.title }}
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>

                </v-list>
            </v-navigation-drawer>

            <!-- Sizes your content based upon application components -->
            <v-main style="padding: 0;" :style="{marginLeft: type ? '0' : '20%' }">

                <!-- Provides the application the proper gutter -->
                <v-container fluid>

                    <v-row v-if="isDialog">
                        <v-col cols="12" class="text-right">
                            <v-btn fab small @click="closeModal()" color="error">x</v-btn>
                        </v-col>
                    </v-row>

                    <transition name="slide" v-if="!type">
                        <router-view :patientId="patientId"></router-view>
                    </transition>

                    <div v-else>
                        <component v-if="type" :is="type" :patient-id="patientId" :doc-side="docSide"></component>
                    </div>
                </v-container>
            </v-main>
        </v-app>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Investigations from './partials/Investigations.vue';
import Vitals from './partials/Vitals.vue';

export default {
    props: [
        'patientId', 'isDialog', 'type', 'docSide',
    ],

    components: {
        Investigations, Vitals
    },

    data: () => ({
        drawer: true,
        patient: null,
        meta: [
            { title: 'Details', icon: 'person_pin', url: 'details' },
            { title: 'Vitals', icon: 'local_hospital', url: 'vitals' },
            { title: 'Visits', icon: 'group', url: 'visits' },
            { title: 'Prescriptions', icon: 'eco', url: 'prescriptions' },
            { title: 'Investigations', icon: 'rowing', url: 'investigations' },
            { title: 'Procedures', icon: 'cached', url: 'procedures' },
            { title: 'Doctors Notes', icon: 'note_add', url: 'doctor-notes' },
            { title: 'Inpatient notes', icon: 'note', url: 'inpatient-notes' },
        ],

        finance: [
            { title: 'Overview', icon: 'account_balance', url: 'finance-overview' },
            { title: 'Deposits', icon: 'post_add', url: 'deposits' },
            { title: 'Withdrawals', icon: 'pie_chart', url: 'withdrawals' },
            { title: 'Cash payments', icon: 'attach_money', url: 'cash-payments' },
            { title: 'Invoice payments', icon: 'money', url: 'invoice-payments' },
            { title: 'Waivers', icon: 'money_off', url: 'waivers' },
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

        closeModal() {
            this.$emit('close');
        },

        usher(nav) {
            return `/reception/${this.patientId}/portal/${nav.url}`;
        },

        initialize() {
            if (this.patientId) {
                this.setPatients({
                    params: {
                        patient_id: this.patientId,
                    },
                });
            }
        },
    },

    created() {
        this.drawer = true;
        this.initialize();
    },
};
</script>
