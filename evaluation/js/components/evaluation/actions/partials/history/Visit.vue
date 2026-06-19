<template>
    <div>
        <h5 class="headline " style="font-weight: bold; text-decoration: underline">Visit</h5>

        <v-row>
            <v-col sm="6">
                <table class="table">
                    <tbody>
                        <tr>
                            <td><strong>Clinic:</strong></td>
                            <td>{{ visit.clinic.name }}</td>
                        </tr>
                        <tr>
                            <td><strong>Destinations:</strong></td>
                            <td>{{ visit.queued_at | ucwords }}</td>
                        </tr>
                        <tr>
                            <td><strong>Patient Name:</strong></td>
                            <td>{{ visit.patient.full_name }}</td>
                        </tr>
                        <tr>
                            <td><strong>Mobile:</strong></td>
                            <td>{{ visit.patient.mobile }}</td>
                        </tr>
                        <tr>
                            <td><strong>Date:</strong></td>
                            <td>{{ visit.created_at }}</td>
                        </tr>
                        <tr>
                            <td><strong>Meta:</strong></td>
                            <td>
                                <v-chip v-if="visit.admission" color="primary" text-color="white" small>Inpatient</v-chip>
                                <v-chip v-if="visit.operation" color="red" text-color="white" small>Theatre</v-chip>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </v-col>

            <v-col sm="6">
                <h4 class="title teal--text">Extra Patient Data</h4>
                <table class="table">
                    <tbody>
                        <tr>
                            <td><strong>Blood Group:</strong></td>
                            <td>{{ visit.patient.meta ? visit.patient.meta.blood_group : '' | strtoupper }}</td>
                        </tr>
                        <tr>
                            <td><strong>Rh Factor:</strong></td>
                            <td>{{ visit.patient.meta ? visit.patient.meta.rhesus_factor : '' }}</td>
                        </tr>
                        <tr>
                            <td><strong>Allergies:</strong></td>
                            <td><div v-if="visit.patient.meta" v-html="visit.patient.meta.allergies"></div></td>
                        </tr>
                        <tr>
                            <td><strong>Chronic Illnesses:</strong></td>
                            <td><div v-if="visit.patient.meta" v-html="visit.patient.meta.chronic_illnesses"></div></td>
                        </tr>
                        <tr>
                            <td><strong>HIV Status:</strong></td>
                            <td>{{ visit.patient.meta ? visit.patient.meta.hiv_status : '' }}</td>
                        </tr>
                        <tr>
                            <td><strong>Last Updated By:</strong></td>
                            <td>{{ visit.patient.meta && visit.patient.meta.last_updated_by ? visit.patient.meta.last_updated_by.full_name : '' }}</td>
                        </tr>
                    </tbody>
                </table>
            </v-col>
        </v-row>


    </div>

</template>

<script>
export default {
    props: ['items'],

    computed: {
        visit() {
            return this.items;
        },
    },

};
</script>

<style scoped>
</style>
