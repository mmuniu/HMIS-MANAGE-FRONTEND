<template>
    <div class="px-2">
        <v-container fluid class="px-5">
            <v-row >
                <v-col cols="12" sm="9">
                    <visit :items="history.visit"></visit>
                </v-col>

                <v-col cols="12" sm="9">
                    <outpatient-notes :items="history.outpatientNotes"></outpatient-notes>
                </v-col>

                <v-col cols="12" sm="9">
                    <prescriptions :items="history.prescriptions" :prints="history.prints"></prescriptions>
                </v-col>

                <v-col cols="12" sm="9">
                    <investigations :items="history.investigationsAndProcedures"></investigations>
                </v-col>

                <v-col cols="12" sm="9">
                    <preliminary-exam :items="history.preliminary_exam"></preliminary-exam>
                </v-col>
                <v-col cols="12" sm="9">
                    <slit-lamp-exam :items="history.slit_lamp_exam?.original?.data"></slit-lamp-exam>
                </v-col>
                <v-col cols="12" sm="9">
                    <refraction :items="history.preliminary_exam"></refraction>
                </v-col>

                <v-col cols="12" sm="9">
                    <pupillary-distance :items="history.pupillary_distance"></pupillary-distance>
                </v-col>
                <v-col cols="12" sm="9">
                    <next-steps :items="history.next_steps"></next-steps>
                </v-col>
               <!-- <v-flex xs12 sm9>
                    <inpatient-notes :items="history.vitals"></inpatient-notes>
                </v-flex>-->

                <v-col cols="12" sm="9">
                    <op-notes :items="history.opNotes"></op-notes>
                </v-col>

                <v-col cols="12" sm="9">
                    <vitals :items="history.vitals"></vitals>
                </v-col>

                <v-col cols="12" sm="9">
                    <prints :items="history.prints"></prints>
                </v-col>
            </v-row>
        </v-container>

        <!--<v-card-actions>

            <v-tooltip bottom>
                <v-btn flat color="red"
                       :disabled="!patient.email"
                       target="_blank"
                       slot="activator"
                       :href="history.prints.email_visit_history_url"
                >
                    <v-icon small class="pr-2">fa fa-envelope</v-icon> Email
                </v-btn>
                <span v-if="patient.email">Send an email to the patient and extra CCs specified in settings</span>
                <span v-else>The patient has no email attached to one's profile</span>
            </v-tooltip>

            <v-btn flat color="orange" :href="history.prints.print_visit_history_url" target="_blank">
                <v-icon small class="pr-2">fa fa-print</v-icon> Print
            </v-btn>
        </v-card-actions>-->
    </div>
</template>

<script>
import Prescriptions from './Prescriptions';
import Investigations from './Investigations';
import Vitals from './Vitals';
import Visit from './Visit';
import OutpatientNotes from './OutpatientNotes';
// import InpatientNotes from "./InpatientNotes";
import OpNotes from './OpNotes';
import PreliminaryExam from './PreliminaryExam';
import SlitLampExam from './SlitLamp';
import Refraction from './Refraction';
import PupillaryDistance from './PupillaryDistance';
import NextSteps from './NextSteps';

import Prints from './Prints';

export default {
    components: {
        Prescriptions, Investigations, Vitals, Visit, OutpatientNotes, /* InpatientNotes,*/ OpNotes, Prints,PreliminaryExam,SlitLampExam,Refraction,PupillaryDistance,NextSteps
    },

    props: [
        'history',
    ],

    data() {
        return {
            modal: {},
            selected: null,
        };
    },

    computed: {
        navigation() {
            return Object.keys(this.history);
        },

        patient() {
            return this.history.visit.patient;
        },

    },

    methods: {
        showHistory(history) {
            this.dialog = true;
        },

        swap(item) {
            this.selected = item;
            this.modal.title = item;
        },
    },

    mounted() {
        this.selected = 'visit';
    },

};
</script>

<style scoped>
    .selected {
        background-color: #009988;
        color: #fff;
    }
    .unselected {
        background-color: #fff;
        color: #000;
    }
    .selected *, .selected *:hover {
        opacity: 1;
        color: #fff;
    }
    .unselected *, .unselected *:hover {
        opacity: 1;
        color: #000;
    }
    .selected a:hover, .unselected a:hover {
        cursor: pointer;
    }
</style>
