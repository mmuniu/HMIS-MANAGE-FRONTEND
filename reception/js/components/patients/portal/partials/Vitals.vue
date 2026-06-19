<template>
    <div>
        <collabmed-loading v-if="!vitals"></collabmed-loading>
        <v-data-table  text
                       v-else
                       :headers="headers"
                       disable-pagination
                       hide-default-footer
                       :items="vitals.data"
        >
            <template v-slot:footer>
                <collabmed-paginator :meta="vitals.meta" @change="updateData"></collabmed-paginator>
            </template>
        </v-data-table>
    </div>
</template>
<script>

    export default {
        props: [
            'patientId', 'docSide',
        ],

        data: () => ({
            page: 1,
            vitals: null,
            headers: [
                { text: 'Weight', value: 'weight' },
                { text: 'Height', value: 'height' },
                { text: 'Bp Systolic', value: 'bp_systolic' },
                { text: 'Bp Diastolic', value: 'bp_diastolic' },
                { text: 'Pulse', value: 'pulse' },
                { text: 'Respiration', value: 'respiration' },
                { text: 'Temperature', value: 'temperature' },
                { text: 'Bmi', value: 'bmi_percentile' },
                { text: 'Length/age percentile', value: 'length_percentile' },
                { text: 'Weight/age percentile', value: 'weight_percentile' },
                { text: 'Date', value: 'created_at' },
            ],
        }),

        methods: {
            updateData(page) {
                this.page = page;
                this.getData(page);
            },

            getData() {
                const params = {
                    page: this.page,
                    type_category: 'vitals',
                    doc_side: this.docSide ? true : false,
                };

                this.$http.get(`/api/reception/patients/${this.patientId}/portal/vitals`, { params: params })
                    .then((response) => {
                        if (response.data) {
                            this.vitals = response.data;
                        } else {
                            flash({ message: 'Unable to fetch data, try again later', alert: 'error' });
                        }
                    });
            },
        },

        mounted() {
            this.getData();
        },
    };
</script>
