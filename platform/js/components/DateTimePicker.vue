<template>
    <v-menu
            :close-on-content-click="false"
            v-model="menu"
            transition="scale-transition"
            offset-y
            min-width="290px"
    >
        <template v-slot:activator="{ on }">
            <v-text-field
                   v-on="on"
                    :label="label"
                    class="mx-1"
                    :color="color"
                    :outline="outline"
                    :placeholder="placeholder"
                    v-model="actualDatetime"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                    readonly
            ></v-text-field>
        </template>

        <v-tabs ref="tabs" :value="selectedTab" grow icons light height="285">
            <v-tabs-bar slot="activators">
                <v-tabs-item href="#calendar">
                    <v-icon>event</v-icon>
                </v-tabs-item>
                <v-tabs-item href="#timer">
                    <v-icon>access_time</v-icon>
                </v-tabs-item>
            </v-tabs-bar>
            <div id="calendar" v-if="!timeOnly">
                <v-date-picker
                        v-model="dateModel"
                        no-title
                        scrollable
                        actions
                        :max="maxDate"
                        :min="minDate"
                        @input="checkHours"
                ></v-date-picker>
            </div>
            <div id="timer" v-if="!dateOnly">
                <v-time-picker
                        ref="timer"
                        v-model="timeModel"
                        no-title
                        scrollable
                        format="24hr"
                        actions
                        @input="checkMinutes"
                ></v-time-picker>
            </div>
        </v-tabs>
    </v-menu>
</template>

<script>
import moment from 'moment';

export default {
    props: {
        datetime: {
            type: String,
            default: null,
        },

        color: {
            type: String,
            default: '',
        },

        placeholder: {
            type: String,
            default: '',
        },

        label: {
            type: String,
            default: 'Select Date',
        },

        outline: {
            type: Boolean,
            default: false,
        },

        dateOnly: {
            type: Boolean,
            default: false,
        },

        timeOnly: {
            type: Boolean,
            default: false,
        },

        maxDate: {
            default: undefined, // valid ISO date
        },

        minDate: {
            default: undefined, // valid ISO date
        },
    },

    data() {
        return {
            dateModel: '',
            timeModel: '',
            menu: false,
            selectedTab: 'calendar',
        };
    },

    watch: {
        menu(val) {
            if (val) {
                this.selectedTab='calendar';
                if (this.$refs.timer) {
                    this.$refs.timer.selectingHour=true;
                }
            }
        },

        dateTime () {
            this.initializeHolders();
        }
    },

    computed: {
        actualDatetime() {
            if (this.dateOnly) {
                return this.dateModel;
            } else {
                return this.dateModel + ' ' + this.timeModel;
            }
        },
    },

    methods: {
        checkMinutes(val) {
            if (this.$refs.timer.selectingHour===false) {
                this.timeModel=val;
                this.$refs.timer.selectingHour = true;
                this.selectedTab = 'calendar';
                this.menu=false;
                this.$emit('input', this.actualDatetime);
            }
        },

        checkHours(val) {
            this.dateModel=val;
            this.selectedTab='timer';

            if (this.dateOnly) {
                this.menu=false;
                this.$emit('input', this.actualDatetime);
            }
        },

        initializeHolders() {
            this.dateModel = this.timeOnly ? '' : this.datetime ? this.datetime.split(' ')[0] : '';
            // take care too many ifs here: please don't disturb the peace
            this.timeModel = this.dateOnly ? '' :
                this.timeOnly ? this.datetime :
                    this.datetime ? this.datetime.split(' ')[1] : '';
        }
    },

    created() {
        this.initializeHolders();
    },
};
</script>
