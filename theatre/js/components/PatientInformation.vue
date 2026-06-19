<template>
    <transition name="slide">
        <div v-if="visit" class="mb-4">
            <v-toolbar flat height="100" color="white">
                <v-avatar size="60px">
                    <img v-if="visit.patient.image" :src="patientInfo.image" alt="Avatar">
                    <img v-else src="/img/placeholder.png" alt="Avatar">
                </v-avatar>

                <p class="ml-3 mt-3">
                <span class="font-weight-bold pl-2 subheading grey--text text--darken-1">
                    {{ visit.patient.full_name }} | {{ visit.patient.sex }} |{{ visit.patient.dob_friendly }} ( {{ visit.patient.age_friendly }})
                </span>
                    <br>
                    <v-chip color="red" text-color="white" small>
                        {{ visit.patient.number }}
                    </v-chip>

                    <v-chip color="blue" text-color="white" small v-if="visit.patient.ip_number">
                        IP No. {{ visit.patient.ip_number }}
                    </v-chip>
                </p>
            </v-toolbar>
        </div>
    </transition>
</template>

<script>
import Visit from "@reception/libs/visits/Visit";

export default {
    name: "theatre-patient-information",

    props: {
        visitId: {
            required: true,
        },
    },

    data() {
        return {
            visitObj: new Visit,
        };
    },

    computed: {
        visit() {
            return this.visitObj.selectedVisit;
        },
    },

    mounted() {
        console.log(this.visitId)
        this.visitObj.find(this.visitId);
    },
};
</script>
