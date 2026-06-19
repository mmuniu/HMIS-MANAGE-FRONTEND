<template>
    <v-card>
        <v-card-title height="23">
            <h4>Clinician Performance</h4>
        </v-card-title>
        <clinician-filter :obj="obj" @filter="performFilter"></clinician-filter>
        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
        <template>
            <v-data-table
                    hide-default-footer
                    :headers="list.headers"
                    :items="list.data"
                    class="elevation-1"
            >
                <template v-slot:item.visits="{ item }">
                    <a @click="viewVisits(item)">{{ item.visits }}</a>
                </template>
                <template v-slot:item.total_procedures="{ item }">
                    <a @click="viewProcedures(item)">{{ item.total_procedures }}</a>
                </template>
                <template v-slot:item.total_lab_test="{ item }">
                    <a @click="viewLabTests(item)">{{ item.total_lab_test }}</a>
                </template>
                <template v-slot:item.total_radiology="{ item }">
                    <a @click="viewRadiology(item)">{{ item.total_radiology }}</a>
                </template>
                <template v-slot:item.total_prescriptions="{ item }">
                    <a @click="viewPrescriptions(item)">{{ item.total_prescriptions }}</a>
                </template>
                <template v-slot:item.total_admissions="{ item }">
                    <a @click="viewAdmissions(item)">{{ item.total_admissions }}</a>
                </template>
                <template v-slot:item.total_consultations="{ item }">
                    <a @click="viewConsultations(item)">{{ item.total_consultations }}</a>
                </template>
            </v-data-table>
            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
        </template>
    </v-card>
</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filter from "./Filters";

export default {

    mixins: [
        reportsMixin,
    ],

    components: {
        "clinician-filter": Filter,
    },

    data: () => ({
        module: "evaluation",
        decoratorKey: "clinician-performance",
    }),

    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },

        viewVisits(data) {
            const filters = this.obj.filters;

            filters.user_id = data.user;
            filters.mode = "visits";

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "total_visits=" + data.visits;

            window.open(`clinician-performance${request_data}`, "_blank");
        },

        viewProcedures(data) {
            const filters = this.obj.filters;

            filters.user_id = data.user;
            filters.mode = "procedures";

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "total_procedures=" + data.total_procedures;

            window.open(`clinician-performance${request_data}`, "_blank");
        },

        viewLabTests(data) {
            const filters = this.obj.filters;

            filters.user_id = data.user;
            filters.mode = "lab";

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "total_lab_test=" + data.total_lab_test;

            window.open(`clinician-performance${request_data}`, "_blank");
        },

        viewRadiology(data) {
            const filters = this.obj.filters;

            filters.user_id = data.user;
            filters.mode = "radiology";

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "total_radiology=" + data.total_radiology;

            window.open(`clinician-performance${request_data}`, "_blank");
        },

        viewPrescriptions(data) {
            const filters = this.obj.filters;

            filters.user_id = data.user;
            filters.mode = "prescriptions";

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "total_prescriptions=" + data.total_prescriptions;

            window.open(`clinician-performance${request_data}`, "_blank");
        },

        viewAdmissions(data) {
            const filters = this.obj.filters;

            filters.user_id = data.user;
            filters.mode = "admissions";

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "total_admissions=" + data.total_admissions;

            window.open(`clinician-performance${request_data}`, "_blank");
        },
        viewConsultations(data) {
          const filters = this.obj.filters;

          filters.user_id = data.user;
          filters.mode = "consultations";

          let request_data = "?child=true&";

          _.map(filters, (item, key) => {
              request_data = request_data + key + "=" + item + "&";
          });

          request_data = request_data + "total_consultations=" + data.total_consultations;

          window.open(`clinician-performance${request_data}`, "_blank");
          },
    },
};
</script>
