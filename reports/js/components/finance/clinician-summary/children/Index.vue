<template>
    <div>
        <collabmed-floating-loader v-if="list.length < 1 || obj.form.loading"></collabmed-floating-loader>

        <v-card v-if="list.radiology">
            <v-card-title height="23">
                <h4>Clinician Radiology Summary for {{ list.request.doctor_name }} Between {{ $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') }} and {{ $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss') }}</h4>
            </v-card-title>
            <download-to-pdf :headers="clinical_radiology_headers" :data="list.radiology" :filename="'Clinician Radiology Summary for ' + list.request.doctor_name + ' Between ' + $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') + ' and ' + $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss')" :title="report_title"></download-to-pdf>
            <download-to-csv :headers="clinical_radiology_headers" :data="list.radiology" :filename="'Clinician Radiology Summary for ' + list.request.doctor_name + ' Between ' + $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') + ' and ' + $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss')"></download-to-csv>
            <div>
                <v-alert
                        :value="true"
                        color="success"
                        outlined
                >
                    Amount: {{ list.amount }}
                </v-alert>
            </div>

            <v-data-table
                    hide-default-footer
                    :headers="clinical_radiology_headers"
                    :items="list.radiology"
                    class="elevation-1"
            >
            </v-data-table>
            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
        </v-card>
        <v-card v-if="list.lab">
            <v-card-title height="23">
                <h4>Clinician Lab Summary for {{ list.request.doctor_name }} Between {{ $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') }} and {{ $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss') }}</h4>
            </v-card-title>
            <download-to-pdf :headers="clinical_lab_headers" :data="list.lab" :filename="'Clinician Lab Summary for ' + list.request.doctor_name + ' Between ' + $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') + ' and ' + $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss')" :title="report_title"></download-to-pdf>
            <download-to-csv :headers="clinical_lab_headers" :data="list.lab" :filename="'Clinician Lab Summary for ' + list.request.doctor_name + ' Between ' + $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') + ' and ' + $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss')"></download-to-csv>
            <div>
                <v-alert
                        :value="true"
                        color="success"
                        outline
                >
                    Amount: {{ list.amount }}
                </v-alert>
            </div>

            <v-data-table
                    hide-default-footer
                    :headers="clinical_lab_headers"
                    :items="list.lab"
                    class="elevation-1"
            >
            </v-data-table>
            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
        </v-card>
        <v-card v-if="list.procedure">
            <v-card-title height="23">
                <h4>Clinician Procedure Summary for {{ list.request.doctor_name }} Between {{ $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') }} and {{ $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss') }}</h4>
            </v-card-title>
<!--            <download-to-excel :filters="obj.filters" :url="url" :filename="filename"></download-to-excel>-->
            <download-to-pdf :headers="clinical_Procedure_headers" :data="list.procedure" :filename="'Clinician Procedure Summary for ' + list.request.doctor_name + ' Between ' + $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') + ' and ' + $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss')" :title="report_title"></download-to-pdf>
            <download-to-csv :headers="clinical_Procedure_headers" :data="list.procedure" :filename="'Clinician Procedure Summary for ' + list.request.doctor_name + ' Between ' + $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') + ' and ' + $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss')"></download-to-csv>
            <div>
                <v-alert
                        :value="true"
                        color="success"
                        outline
                >
                    Amount: {{ list.amount }}
                </v-alert>
            </div>

            <v-data-table
                    hide-default-footer
                    :headers="clinical_Procedure_headers"
                    :items="list.procedure"
                    class="elevation-1"
            >
            </v-data-table>
            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
        </v-card>
        <v-card v-if="list.prescriptions">
            <v-card-title height="23">
                <h4>Clinician Prescription Summary for {{ list.request.doctor_name }} Between {{ $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') }} and {{ $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss') }}</h4>
            </v-card-title>
<!--            <download-to-excel :filters="obj.filters" :url="url" :filename="filename"></download-to-excel>-->
            <download-to-pdf :headers="clinical_prescription_headers" :data="list.prescriptions" :filename="'Clinician Prescription Summary for ' + list.request.doctor_name + ' Between ' + $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') + ' and ' + $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss')" :title="report_title"></download-to-pdf>
            <download-to-csv :headers="clinical_prescription_headers" :data="list.prescriptions" :filename="'Clinician Prescription Summary for ' + list.request.doctor_name + ' Between ' + $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') + ' and ' + $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss')"></download-to-csv>
            <div>
                <v-alert
                        :value="true"
                        color="success"
                        outline
                >
                    Amount: {{ list.amount }}
                </v-alert>
            </div>

            <v-data-table
                    hide-default-footer
                    :headers="clinical_prescription_headers"
                    :items="list.prescriptions"
                    class="elevation-1"
            >
            </v-data-table>
            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
        </v-card>
        <v-card v-if="list.admissions">
            <v-card-title height="23">
                <h4>Clinician Admissions Summary for {{ list.request.doctor_name }} Between {{ $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') }} and {{ $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss') }}</h4>
            </v-card-title>
<!--            <download-to-excel :filters="obj.filters" :url="url" :filename="filename"></download-to-excel>-->
            <download-to-pdf :headers="clinical_admission_headers" :data="list.admissions" :filename="'Clinician Admissions Charge Summary for ' + list.request.doctor_name + ' Between ' + $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') + ' and ' + $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss')" :title="report_title"></download-to-pdf>
            <download-to-csv :headers="clinical_admission_headers" :data="list.admissions" :filename="'Clinician Admissions Charge Summary for ' + list.request.doctor_name + ' Between ' + $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') + ' and ' + $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss')"></download-to-csv>
            <div>
                <v-alert
                        :value="true"
                        color="success"
                        outline
                >
                    Amount: {{ list.amount }}
                </v-alert>
            </div>
            <collabmed-floating-loader v-if="list.length < 1 || obj.form.loading"></collabmed-floating-loader>

            <v-data-table
                    hide-default-footer
                    :headers="clinical_admission_headers"
                    :items="list.admissions"
                    class="elevation-1"
            >
            </v-data-table>
            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
        </v-card>
        <v-card v-if="list.doctor_fee">
            <v-card-title height="23">
                <h4>Clinician Doctor Fee Summary for {{ list.request.doctor_name }} Between {{ $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') }} and {{ $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss') }}</h4>
            </v-card-title>
            <!--            <download-to-excel :filters="obj.filters" :url="url" :filename="filename"></download-to-excel>-->
            <download-to-pdf :headers="clinical_doctor_headers" :data="list.doctor_fee" :filename="'Clinician Doctor Fee Summary for ' + list.request.doctor_name + ' Between ' + $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') + ' and ' + $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss')" :title="report_title"></download-to-pdf>
            <download-to-csv :headers="clinical_doctor_headers" :data="list.doctor_fee" :filename="'Clinician Doctor Fee Summary for ' + list.request.doctor_name + ' Between ' + $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') + ' and ' + $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss')"></download-to-csv>
            <div>
                <v-alert
                        :value="true"
                        color="success"
                        outline
                >
                    Amount: {{ list.amount }}
                </v-alert>
            </div>
            <collabmed-floating-loader v-if="list.length < 1 || obj.form.loading"></collabmed-floating-loader>

            <v-data-table
                    hide-default-footer
                    :headers="clinical_doctor_headers"
                    :items="list.doctor_fee"
                    class="elevation-1"
            >
            </v-data-table>
            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
        </v-card>
        <v-card v-if="$route.query.mode === 'consultation'">
            <v-card-title height="23">
                <h4>Clinician Consultation Summary for  {{ list.request.doctor_name }} Between {{ $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') }} and {{ $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss') }}</h4>
            </v-card-title>
            <!--            <download-to-excel :filters="obj.filters" :url="url" :filename="filename"></download-to-excel>-->
            <download-to-pdf :headers="clinical_consultation_headers" :data="list.consultation" :filename="'Clinician Consultation Charge Summary for ' + list.request.doctor_name + ' Between ' + $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') + ' and ' + $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss')" :title="report_title"></download-to-pdf>
            <download-to-csv :headers="clinical_consultation_headers" :data="list.consultation" :filename="'Clinician Consultation Charge Summary for ' + list.request.doctor_name + ' Between ' + $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') + ' and ' + $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss')"></download-to-csv>
            <div>
                <v-alert
                        :value="true"
                        color="success"
                        outline
                >
                    Amount: {{ list.amount }}
                </v-alert>
            </div>
            <collabmed-floating-loader v-if="list.length < 1 || obj.form.loading"></collabmed-floating-loader>




            <v-data-table
                    hide-default-footer
                    :headers="clinical_consultation_headers"
                    :items="list.consultation_charge"
                    class="elevation-1"
            >
            </v-data-table>
            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
        </v-card>
        <v-card v-if="list.wardCharge">
            <v-card-title height="23">
                <h4>Clinician Ward Charge Summary for {{ list.request.doctor_name }} Between {{ $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') }} and {{ $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss') }}</h4>
            </v-card-title>
            <!--            <download-to-excel :filters="obj.filters" :url="url" :filename="filename"></download-to-excel>-->
            <download-to-pdf :headers="clinical_ward_charge_headers" :data="list.wardCharge" :filename="'Clinician Ward Charge Summary for ' + list.request.doctor_name + ' Between ' + $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') + ' and ' + $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss')" :title="report_title"></download-to-pdf>
            <download-to-csv :headers="clinical_ward_charge_headers" :data="list.wardCharge" :filename="'Clinician Ward Charge Summary for ' + list.request.doctor_name + ' Between ' + $moment(list.request.start_date).format('DD-MM-YYYY HH:mm:ss') + ' and ' + $moment(list.request.end_date).format('DD-MM-YYYY HH:mm:ss')"></download-to-csv>
            <div>
                <v-alert
                        :value="true"
                        color="success"
                        outline
                >
                    Amount: {{ list.amount }}
                </v-alert>
            </div>
            <collabmed-floating-loader v-if="list.length < 1 || obj.form.loading"></collabmed-floating-loader>

            <v-data-table
                    hide-default-footer
                    :headers="clinical_ward_charge_headers"
                    :items="list.wardCharge"
                    class="elevation-1"
            >
            </v-data-table>
            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
        </v-card>
    </div>
</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";

export default {

    mixins: [
        reportsMixin,
    ],

    data: () => ({
        module: "finance",
        decoratorKey: "clinician-summary",
        filename: "Clinician Summary",

        report_title: "Clinician Summary",

        clinical_Procedure_headers: [
            { "text": "Name", "value": "name", "sortable": false },
            { "text": "Procedure", "value": "procedure", "sortable": false },
            { "text": "Patient", "value": "patient", "sortable": false },
            { "text": "Amount", "value": "amount", "sortable": false },
            { "text": "Time", "value": "time", "sortable": false },
        ],

        clinical_lab_headers: [
            { "text": "Name", "value": "name", "sortable": false },
            { "text": "Lab Procedure", "value": "lab_procedure", "sortable": false },
            { "text": "Patient", "value": "patient", "sortable": false },
            { "text": "Amount", "value": "amount", "sortable": false },
            { "text": "Time", "value": "time", "sortable": false },
        ],

        clinical_radiology_headers: [
            { "text": "Name", "value": "name", "sortable": false },
            { "text": "Radiology", "value": "radiology", "sortable": false },
            { "text": "Patient", "value": "patient", "sortable": false },
            { "text": "Amount", "value": "amount", "sortable": false },
            { "text": "Time", "value": "time", "sortable": false },
        ],

        clinical_prescription_headers: [
            { "text": "Name", "value": "name", "sortable": false },
            { "text": "Prescriptions", "value": "prescription", "sortable": false },
            { "text": "Patient", "value": "patient", "sortable": false },
            { "text": "Amount", "value": "amount", "sortable": false },
            { "text": "Time", "value": "time", "sortable": false },
        ],

        clinical_admission_headers: [
            { "text": "Name", "value": "name", "sortable": false },
            { "text": "Ward", "value": "ward", "sortable": false },
            { "text": "Patient", "value": "patient", "sortable": false },
            { "text": "Amount", "value": "amount", "sortable": false },
            { "text": "Time", "value": "time", "sortable": false },
        ],

        clinical_doctor_headers: [
            { "text": "Name", "value": "name", "sortable": false },
            { "text": "Procedure", "value": "procedure", "sortable": false },
            { "text": "Patient", "value": "patient", "sortable": false },
            { "text": "Amount", "value": "amount", "sortable": false },
            { "text": "Time", "value": "time", "sortable": false },
        ],

        clinical_consultation_headers: [
            { "text": "Name", "value": "name", "sortable": false },
            { "text": "Procedure", "value": "procedure", "sortable": false },
            { "text": "Patient", "value": "patient", "sortable": false },
            { "text": "Amount", "value": "amount", "sortable": false },
            { "text": "Time", "value": "time", "sortable": false },
        ],

        clinical_ward_charge_headers: [
            { "text": "Name", "value": "name", "sortable": false },
            { "text": "Ward", "value": "ward", "sortable": false },
            { "text": "Patient", "value": "patient", "sortable": false },
            { "text": "Amount", "value": "amount", "sortable": false },
            { "text": "Time", "value": "time", "sortable": false },
        ],
    }),

    computed: {

        url() {
            return "/api/reports/module/finance/clinician-summary";
        },

    },

    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },
    },

    watch: {
        page(val) {
            this.obj.filters = _.omitBy(this.$route.query, _.isNil);

            this.obj.performFilter(this.module, this.decoratorKey, val);
        },
    },

    created() {
        this.processing_child = true;

        this.obj.filters = _.omitBy(this.$route.query, _.isNil);

        this.obj.performFilter(this.module, this.decoratorKey);
    },

    mounted() {
      console.log(this.list.doctor_fee)
  }
};
</script>
