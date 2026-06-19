<template>
    <v-card elevation="2" class="mx-auto"
            max-width="500"
            v-if="patient"
            max-height="500"
            tile>
        <v-card-title class="white--text" style="background-color: #1976d2 !important">
            Patient Identity Card
            <v-spacer/>
            <span style="font-size: 12px">ID: {{ patient.id_no }}</span>
        </v-card-title>
        <v-row class="px-5 pb-3">
            <v-col class="pa-0" cols="12" md="4">
                <v-avatar
                        class="profile mt-2"
                        color="grey"
                        size="164"
                        tile
                >
                    <v-img :src="patient.image ? patient.image : '/img/placeholder.png'"></v-img>
                </v-avatar>
            </v-col>
            <v-col class="py-0" md="8" cols="12">
                <div class="subtitle-2 pt-1">Name: <span style="font-weight: bold">{{ patient.full_name }}</span></div>
                <div class="subtitle-2 pt-1">Gender: <span style="font-weight: bold">{{ patient.sex }}</span></div>
                <div class="subtitle-2 pt-1">Locale:
                    <span>{{ patient.home_location ? patient.home_location.name : patient.town }}</span>
                </div>
                <div>
                    <qrcode :value="patient.system_id" format="code128" v-if="patient.system_id" :options="{ width: 120 }">
                        Unable to load QR Code
                    </qrcode>
                </div>
            </v-col>
        </v-row>
    </v-card>
</template>
<script>
import VueQrcode from '@chenfengyuan/vue-qrcode';
export default {
    props: [
        'patientData', 'patientJson',
    ],

    components: {
        'qrcode': VueQrcode,
    },

    data: () => ({
        patient: null,
    }),

    created() {
        this.patient = this.patientData ? this.patientData : JSON.parse(this.patientJson);
    },
}
</script>
