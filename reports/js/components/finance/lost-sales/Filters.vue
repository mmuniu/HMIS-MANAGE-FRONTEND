<template>
    <v-card class="pa-0 pt-3" flat>
        <v-card-text class="py-0 my-0">
            <v-row >
                <v-col cols="12" md="3" class="px-2">
                    <v-autocomplete
                            :items="facilities.facilities"
                            outline
                            v-model="filters.facility_id"
                            color="blue-grey lighten-2"
                            label="Select Facility"
                            item-text="name"
                            clearable
                            @click:clear="facilityCleared"
                            item-value="id"
                    ></v-autocomplete>
                </v-col>

                <v-col md="2" class="px-2">
                    <v-select v-model="filters.type"
                              outline label="Type"
                              :items="['Prescriptions', 'Services']"></v-select>
                </v-col>

                <v-col md="2" class="px-2">
                    <collabmed-date-time-picker outline v-model="filters.start_date" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
                </v-col>

                <v-col md="2" class="px-2">
                    <collabmed-date-time-picker outline v-model="filters.end_date" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
                </v-col>
            </v-row>
            <v-row >
                <v-col>
                    <v-btn @click="filter()" small color="success">filter</v-btn>
                    <download-to-excel :filters="filters" :url="url" :filename="filename"></download-to-excel>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>
<script>
import moment from "moment";
import { mapActions, mapGetters } from "vuex";

export default {
    title: "Lost Sales",

    props: {
        obj: {
            required: true,
            type: Object,
        },
    },

    data: () => ({
        filename: "lost sales",
        filters: {
            start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
            end_date: moment(new Date()).format("YYYY-MM-DD HH:MM"),
            facility_id: null,
        },
    }),

    computed: {
        ...mapGetters({
            facilities: "getFacilities",
        }),

        url() {
            return "/api/reports/module/finance/lost-sales";
        },
    },

    methods: {
        ...mapActions([
            "setFacilities",
        ]),

        facilityCleared() {
            this.filters.facility_id = null;
        },

        filter() {
            this.obj.filters = _.omitBy(this.filters, _.isNil);

            this.$emit("filter");
        },
    },

    mounted() {
        this.setFacilities();
    },
};
</script>
