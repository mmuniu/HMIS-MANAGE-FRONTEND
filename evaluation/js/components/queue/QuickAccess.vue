<template>
    <div class="px-3">
        <v-row >
            <v-col sm="1" class="text-center">
                <span style="font-weight: bold">#</span>
            </v-col>
            <v-col sm="4">
                <span style="font-weight: bold">Patient</span>
            </v-col>
            <v-col sm="4" class="text-left">
                <span style="font-weight: bold">Date</span>
            </v-col>
            <v-col sm="1">
                <span style="font-weight: bold">Actions</span>
            </v-col>
        </v-row>

        <collabmed-loading v-if="!list"></collabmed-loading>

        <div v-else style="overflow-y: scroll; height:420px;">
            <v-row  v-for="(visit, index) in list" :key="index">
                <v-col sm="1" class="text-center">
                    {{ index + 1 }}
                </v-col>
                <v-col sm="4">
                    {{ visit.patient_name }}
                </v-col>
                <v-col sm="4" class="text-left">
                    {{ visit.created_at }}
                </v-col>
                <v-col sm="1">
                    <v-btn small color="primary" @click="reviewPatient(visit.patient_id)" rounded>Review</v-btn>
                </v-col>
            </v-row>
        </div>

    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Visit from '@reception/libs/visits/Visit';

export default {
    data: () => ({
        list: null,
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
