<template>
    <v-dialog v-model="dialog" max-width="70%">
        <template v-slot:activator="{ on }">
            <v-btn color="success" dark v-on="on" small>{{ label ? label : 'view more' }}</v-btn>
        </template>

        <v-card>
            <collabmed-loading v-if="!patient"></collabmed-loading>

            <v-card-title v-else class="headline primary white--text">
                {{ patient.full_name }}
                <v-spacer></v-spacer>
                <v-btn small color="red"
                       @click="dialog = false"
                       text
                       icon
                       style="font-weight: bold">
                    <v-icon class="white--text">close</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="4" class="font-weight-bold">
                            <div class="my-2">Name: {{ patient.full_name }}</div>
                            <div class="my-2">Age: {{ patient.age_friendly }}</div>
                            <div class="my-2">Mobile: {{ patient.mobile }}</div>
                            <div class="my-2">Gender: {{ patient.sex }}</div>
                            <div v-if="patient.home_location" class="my-2">Home: {{ patient.home_location.name }}
                                <a :href="'/reception/show-on-map?lat=' + patient.home_location.lat + '&long=' + patient.home_location.long" target="_blank">
                                    <button  class="pa-1 v-btn primary btn-xs btn_assign">
                                        <i class="fa fa-map"></i> show on map
                                    </button>
                                </a>

                            </div>
                            <div v-if="patient.work_location" class="my-2">Work: {{ patient.work_location.name }}
                                <a :href="'/reception/show-on-map?lat=' + patient.work_location.lat + '&long=' + patient.work_location.long" target="_blank">
                                    <button  class="pa-1 v-btn primary btn-xs btn_assign">
                                        <i class="fa fa-map"></i> show on map
                                    </button>
                                </a>

                            </div>
                            <br/>
                            <div>
                                <h6 style="text-decoration: underline">Other Details about the patient:</h6>

                                <div>
                                    {{ patient.other_details }}
                                </div>
                            </div>
                            <br/>
                        </v-col>
                        <v-col cols="8">
                            <div class="text-center font-weight-bold">Contacts</div>

                            <v-data-table
                                    :headers="contactHeaders"
                                    :items-per-page="5"
                                    :items="patient.contacts">
                                <template v-slot:item.status="{ item }">
                                    <span v-if="item.tracking_status == 'pending'" class="text-right error--text">{{ item.tracking_status }}</span>
                                    <span v-else class="text-right success--text">{{ item.tracking_status }}</span>
                                </template>
                            </v-data-table>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12">
                            <div class="font-weight-bold">Vitals</div>

                            <v-row v-for="(vital, index) in patient.vitals" :key="index">
                                <v-col cols="4">Temperature: {{ vital.temperature }}</v-col>
                                <v-col cols="4">Symptoms:
                                    <span v-if="Array.isArray(vital.symptoms)">
                                          <v-chip small class="mr-1" v-for="(symptom, index) in vital.symptoms" :key="index">{{ symptom }}</v-chip>
                                    </span>
                                    <span v-else>
                                        {{ vital.symptoms }}
                                    </span>
                                </v-col>
                                <v-col cols="4">Date: {{ vital.date }}</v-col>
                            </v-row>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12">
                            <div class="font-weight-bold">Samples</div>

                            <v-data-table
                                    :headers="headers"
                                    :items-per-page="5"
                                    :items="patient.results">
                            </v-data-table>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
export default {
    props: [
        'patient', 'label',
    ],

    data: () => ({
        dialog: false,
        contactHeaders: [
            { text: 'Name', value: 'name' },
            { text: 'Mobile', value: 'mobile' },
            // { text: "Testing status", value: "testing_status" },
            { text: 'Tracking status', value: 'tracking_status' },
            { text: 'Location', value: 'location' },
            { text: 'Trackee', value: 'trackee' },
        ],
        headers: [
            { text: 'sample Type', value: 'sample' },
            { text: 'Procedure', value: 'procedures' },
            { text: 'Result', value: 'result' },
            { text: 'Date', value: 'date' },
            { text: 'Actions', value: 'actions' },
        ],
    }),
};
</script>
