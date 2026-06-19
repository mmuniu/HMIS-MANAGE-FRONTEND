<template>
        <patient-search  soloed
                         prepend="search"
                         class="hidden-sm-and-down ml-4 mt-3 mb-3"
                         @patientSelected="viewPatientProfile">
        </patient-search>
</template>

<script>
import PatientSearch from "@reception/components/patients/PatientSearch";

export default {

    components: {
        PatientSearch,
    },

    methods: {
        viewPatientProfile(patient) {
            window.open(`/reception/${patient.id}/portal`, "_blank");
        },
    },
};
</script>
