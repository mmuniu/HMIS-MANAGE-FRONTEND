<template>
    <div>
        <v-card>
            <v-card-title height="23">
                <h4>Clinician Summary</h4>
            </v-card-title>

            <clinician-summary-filter :obj="obj"  @filter="performFilter"></clinician-summary-filter>
                    <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>

                    <template>

                        <v-data-table
                        hide-default-footer
                        :headers="list.headers"
                        :items="list.data"
                        :items-per-page="-1"
                        class="elevation-1">
                        <template v-slot:item.procedure_amount="{ item }">
                       <a v-if="item.clinician !== ''" @click="viewProcedures(item)">{{ item.procedure_amount }}</a>
                    <span v-else-if="item.clinician === ''">{{ item.procedure_amount }}</span>

                    </template>
                        <template v-slot:item.laboratory_amount="{ item }">
                            <a v-if="item.clinician !== ''" @click="viewLab(item)">{{ item.laboratory_amount }}</a>
                            <span v-else-if="item.clinician === ''">{{ item.laboratory_amount }}</span>
                        </template>
                        <template v-slot:item.radiology_amount="{ item }">
                            <a v-if="item.clinician !== ''" @click="viewRadiology(item)">{{ item.radiology_amount }}</a>
                            <span v-else-if="item.clinician === ''">{{ item.radiology_amount }}</span>
                        </template>
                        <template v-slot:item.prescriptions_amount="{ item }">
                            <a v-if="item.clinician !== ''" @click="viewPrescriptions(item)">{{ item.prescriptions_amount }}</a>
                            <span v-else-if="item.clinician === ''">{{ item.prescriptions_amount }}</span>
                          </template>
                        <template v-slot:item.admissions_amount="{ item }">
                            <a v-if="item.clinician !== ''" @click="viewAdmissions(item)">{{ item.admissions_amount }}</a>
                            <span v-else-if="item.clinician === ''">{{ item.admissions_amount }}</span>
                        </template>
                        <template v-slot:item.doctor_amount="{ item }">
                            <a v-if="item.clinician !== ''" @click="viewDoctors(item)">{{ item.doctor_amount }}</a>
                            <span v-else-if="item.clinician === ''">{{ item.doctor_amount }}</span>
                        </template>
                        <template v-slot:item.consultation_amount="{ item }">
                            <a v-if="item.clinician !== ''" @click="viewConsultations(item)">{{ item.consultation_amount }}</a>
                            <span v-else-if="item.clinician === ''">{{ item.consultation_amount }}</span>
                          </template>

                    </v-data-table>
                            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
                    </template>
        </v-card>
    </div>
</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filter from "./Filters";

export default {
    mixins: [
        reportsMixin,
    ],

    data: () => ({
        module: "finance",
        decoratorKey: "clinician-summary",

    }),

    components: {
        "clinician-summary-filter": Filter,
    },

    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },

        viewProcedures(data) {
            const filters = this.obj.filters;

            filters.user_id = data.user;
            filters.mode = "procedures";

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "total_amount=" + data.procedure_amount;

            window.open(`clinician-summary${request_data}`, "_blank");
        },

        viewLab(data) {
            const filters = this.obj.filters;

            filters.user_id = data.user;
            filters.mode = "lab";

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "total_amount=" + data.laboratory_amount;

            window.open(`clinician-summary${request_data}`, "_blank");
        },

        viewRadiology(data) {
            const filters = this.obj.filters;

            filters.user_id = data.user;
            filters.mode = "radiology";

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "total_amount=" + data.radiology_amount;

            window.open(`clinician-summary${request_data}`, "_blank");
        },

        viewPrescriptions(data) {
            const filters = this.obj.filters;

            filters.user_id = data.user;
            filters.mode = "prescriptions";

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "total_amount=" + data.total_prescriptions_amount;

            window.open(`clinician-summary${request_data}`, "_blank");
        },

        viewAdmissions(data) {
            const filters = this.obj.filters;


            filters.user_id = data.user;
            filters.mode = "admissions";

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "total_amount=" + data.total_admissions_amount;


            window.open(`clinician-summary${request_data}`, "_blank");
        },

        viewDoctors(data) {
            const filters = this.obj.filters;


            filters.user_id = data.user;
            filters.mode = "doctor";

            let request_data = "?child=true&";



            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "total_amount=" + data.total_admissions_amount;



            window.open(`clinician-summary${request_data}`, "_blank");
        },

        viewWardCharges(data) {
            const filters = this.obj.filters;


            filters.user_id = data.user;
            filters.mode = "wardCharge";

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "total_amount=" + data.total_admissions_amount;

            window.open(`clinician-summary${request_data}`, "_blank");
        },

        viewConsultations(data) {
            const filters = this.obj.filters;




            filters.user_id = data.user;
            filters.mode = "consultation";

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "total_amount=" + data.total_admissions_amount;

            window.open(`clinician-summary${request_data}`, "_blank");
        },
    },


};
</script>
