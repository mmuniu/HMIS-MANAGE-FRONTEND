<template>
    <v-card>
        <v-card-title height="23">
        </v-card-title>
        <div class="mb-3 mr-3">
            <v-row >
                <v-col></v-col>
                <v-col class="mr-2" md="4" cols="12" >
                    <patients-search @patientSelected="patientSelected" label="Search customer" outline></patients-search>
                </v-col>
            </v-row>
        </div>

        <collabmed-floating-loader v-if="!patients.data"></collabmed-floating-loader>

        <template>
            <v-data-table
                    hide-default-footer
                    :loading="saveLoader"
                    :headers="headers"
                    :items="patients.data"
                    class="elevation-1"

            >
                <template v-slot:item.actions="{ item }">
                    <a @click="viewAccount(item)">
                        <v-btn small color="success">
                            <i class="fa fa-address-book-o"></i> &nbsp;View Account / Profile
                        </v-btn>
                    </a>
                </template>
            </v-data-table>
            <collabmed-paginator v-if="patients.meta" :meta="patients.meta" @change="navigate" />
        </template>
    </v-card>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import PatientSearch from '@reception/components/patients/PatientSearch.vue';

export default {
    data: () => ({
        saveLoader: false,
        headers: [
            { text: 'Name', align: 'left', value: 'full_name', sortable: false },
            { text: 'Patient No.', value: 'number', sortable: false },
            { text: 'ID Number', value: 'id_no', sortable: false },
            { text: 'Mobile', value: 'mobile', sortable: false },
            { text: 'Account Balance', sortable: false, value: 'balance' },
            { text: 'Actions', value: 'actions', sortable: false },
        ],
    }),

    components: {
        'patients-search': PatientSearch,
    },

    computed: {

        ...mapGetters({
            patients: 'getPatientAccounts',
        }),

    },

    methods: {

        navigate(page) {
            this.setPatientAccounts({
                page,
            });
        },

        patientSelected(patient) {
            this.setPatientAccounts({
                params: {
                    patient_id: patient.id,
                },
            });
        },

        ...mapActions([
            'setPatientAccounts',
        ]),

        viewAccount(data) {
            window.open(`${data.id}/overview`, '_blank');
        },

    },

    created() {
        // let params = JSON.parse(this.params);

        this.setPatientAccounts();

        window.events.$on('STORE_SET_ACTION_LOADING', (loading) => {
            this.saveLoader = loading;
        });
    },
};
</script>
