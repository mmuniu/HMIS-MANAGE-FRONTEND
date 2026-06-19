<template>
    <v-card>
        <collabmed-loading v-if="!movements.data"></collabmed-loading>
        <GoogleMapLoader
                v-else
                style="height: 800px"
                :mapConfig="mapConfig"
                apiKey="AIzaSyAXPsC6VZy82P_LaXTx4_ufWT9NWdS5SMU"
        >
            <template slot-scope="{ google, map }">
                <GoogleMapMarker
                        v-for="marker in movements.data.markers"
                        :key="marker.id"
                        :marker="marker"
                        :google="google"
                        :map="map"
                />
                <GoogleMapLine
                        v-for="line in movements.data.lines"
                        :key="line.id"
                        :path.sync="line.path"
                        :google="google"
                        :map="map"
                />
            </template>
        </GoogleMapLoader>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import GoogleMapLoader from '@core/components/globals/google_map/GoogleMapLoader';
import GoogleMapMarker from '@core/components/globals/google_map/GoogleMapMarker';
import GoogleMapLine from '@core/components/globals/google_map/GoogleMapLine';

import { mapSettings } from '@app/plugins/google_maps';

export default {
    components: {
        GoogleMapLoader,
        GoogleMapMarker,
        GoogleMapLine,
    },

    data() {
        return {
            mapCenter: 0,
            params: {
                start_date: '',
                end_date: '',
                patient_id: null,
            },
        };
    },

    computed: {
        ...mapGetters({
            movements: 'getPatientMovements',
        }),

        mapConfig() {
            return {
                ...mapSettings,
                center: this.mapCenter,
            };
        },
    },

    watch: {
        movements(val) {
            this.mapCenter = val.data.center;
        },
    },

    methods: {
        ...mapActions([
            'setPatientMovements',
        ]),

        initialize() {
            this.setPatientMovements({
                params: this.params,
            });
        },
    },

    mounted() {
        this.params.patient_id = window.location.href.split('/').pop();
        this.initialize();
    },
};
</script>
