<template>
    <v-col cols="12" class="my-4" md="6">
        <collabmed-loading v-if="!list"></collabmed-loading>

        <base-material-card
                v-else
                class="px-5 py-3"
        >
            <v-card-title class="warning white--text" style="margin-top: -50px; border-radius: 8px; box-shadow: 4px 0px 10px 3px #d4d2d2">
                <div class="display-1 font-weight-bold">
                    {{ covidEnabled ? 'High alert screening' : 'Quick patient management'}}
                </div>

                <div class="subtitle-1 font-weight-light">
                    {{ covidEnabled ? 'High alert cases currently screened.' : 'List of latest checked in patients to doctors queue.' }}
                </div>
            </v-card-title>
            <v-card-text>
                <v-data-table
                        :headers="headers"
                        :items-per-page="5"
                        :items="list">
                    <template v-slot:item.actions="{ item }">
                        <v-btn small class="white--text" color="purple" @click="reviewPatient(item.patient_id)" >Review</v-btn>
                    </template>
                </v-data-table>
            </v-card-text>
        </base-material-card>
    </v-col>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    props: ['covidEnabled'],
    data: () => ({
        list: null,
        headers: [
            { text: 'Patient', sortable: false, value: 'patient_name' },
            { text: 'Mobile', sortable: false, value: 'mobile', align: 'right' },
            { text: 'screen date', sortable: false, value: 'created_at', align: 'right' },
            { text: 'Actions', sortable: false, value: 'actions', align: 'right' },
        ],
    }),

    watch: {
        visits(val) {
            this.list = val;
        },
    },

    computed: {
        ...mapGetters({
            visits: 'getQuickVisitsView',
        }),
    },

    methods: {
        ...mapActions([
            'setQuickVisitsView',
        ]),

        reviewPatient(patient_id) {
            window.open(`/reception/visits?patient_id=${patient_id}`, '_self');
        },
    },

    mounted() {
        this.setQuickVisitsView();
    },
};
</script>
