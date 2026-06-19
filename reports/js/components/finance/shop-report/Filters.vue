<template>
    <v-card class="pa-0 pt-3" flat>
        <v-card-text class="py-0 my-0">
            <v-row >
                <v-col cols="12" md="3">
                    <div class="mx-2">
                        <users-search
                                @results="setUser"
                                leaveSelected
                                @clearedSelected="userCleared()"
                        ></users-search>
                    </div>
                </v-col>

                <v-col md="2" class="px-2">
                    <collabmed-date-time-picker outline
                                                @input="setStartDate"
                                                :datetime="filters.start_date"
                                                label="Start date">
                    </collabmed-date-time-picker>
                </v-col>

                <v-col md="2" class="px-2">
                    <collabmed-date-time-picker outline
                                                @input="setEndDate"
                                                :datetime="filters.end_date"
                                                label="End date">
                    </collabmed-date-time-picker>
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
    title: "drugs dispensed",

    props: {
        obj: {
            required: true,
            type: Object,
        },
    },

    data: () => ({
        filename: "Insurance Status",
        insuranceSchemes: [],
        filters_info: null,
        filters: {
            start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
            end_date: moment(new Date()).format("YYYY-MM-DD HH:MM"),
            // facility_id: '',
            user_id: "",
        },
    }),

    computed: {
        ...mapGetters({
            facilities: "getFacilities",
            users: "getUsers",
        }),

        url() {
            return "/api/reports/module/finance/shop-report";
        },
    },

    methods: {
        ...mapActions([
            "setFacilities",
            "setUsers",
        ]),

        filtersInfo() {
            const filters_data = _.omitBy(this.filters, _.isNil);

            const filtersInfo = {};

            const self = this;

            _.map(filters_data, function(val, key) {
                if (key === "facility_id") {
                    _.map(self.facilities.facilities, (item) => {
                        if (item.id === val) {
                            filtersInfo["facility"] = item.name;
                        }
                    });
                } else {
                    filtersInfo[key.replace("_", " ")] = val;
                }
            });

            this.filters_info = filtersInfo;
        },

        setUser(user) {
            this.filters.user_id = user.id;
        },

        userCleared() {
            this.filters.user_id = null;
        },

        facilityCleared() {
            this.filters.facility_id = null;
        },

        setStartDate(datetime) {
            this.filters.start_date = datetime;
        },
        setEndDate(datetime) {
            this.filters.end_date = datetime;
        },

        filter() {
            this.obj.filters = _.omitBy(this.filters, _.isNil);

            this.$emit("filter");
        },
    },

    mounted() {
        this.setFacilities();
        this.setUsers();
        this.filtersInfo();
    },
};
</script>
