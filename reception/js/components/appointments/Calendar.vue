<template>
    <v-card class="pa-4">
        <v-sheet
                tile
                height="54"
                class="d-flex"
        >
            <v-btn
                    fab small
                    class="primary white--text ma-2"
                    @click="$refs.calendar.prev()"
            >
                <
            </v-btn>
            <span>{{ start_date }}</span>
            <v-select
                    v-model="type"
                    :items="types"
                    dense
                    outlined
                    hide-details
                    class="ma-2"
                    label="type"
            ></v-select>
            <v-select
                    v-model="weekday"
                    :items="weekdays"
                    dense
                    outlined
                    hide-details
                    label="weekdays"
                    class="ma-2"
            ></v-select>
            <v-spacer></v-spacer>
            <span>{{ end_date }}</span>
            <v-btn
                    fab small
                    class="primary white--text ma-2"
                    @click="$refs.calendar.next()"
            >
               >
            </v-btn>
        </v-sheet>

        <v-sheet height="600">
            <v-calendar
                    ref="calendar"
                    v-model="value"
                    :weekdays="weekday"
                    :type="type"
                    :events="events.data"
                    :event-overlap-mode="mode"
                    :event-overlap-threshold="30"
                    :event-color="getEventColor"
                    @change="fetchData"
            ></v-calendar>
        </v-sheet>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
export default {
    data: () => ({
        type: 'month',
        types: ['month', 'week', 'day', '4day'],
        weekday: [0, 1, 2, 3, 4, 5, 6],
        weekdays: [
            { text: 'Sun - Sat', value: [0, 1, 2, 3, 4, 5, 6] },
            { text: 'Mon - Sun', value: [1, 2, 3, 4, 5, 6, 0] },
            { text: 'Mon - Fri', value: [1, 2, 3, 4, 5] },
            { text: 'Mon, Wed, Fri', value: [1, 3, 5] },
        ],
        mode: 'column',
        value: '',
        start_date: '',
        end_date: '',
    }),
    computed: {
        ...mapGetters({
            events: 'getCalendarEvents',
        }),
    },

    methods: {
        ...mapActions({
            fetchEvents: 'setCalendarEvents',
        }),

        getEventColor(event) {
            return event.color;
        },

        fetchData({ start, end }) {
            this.start_date = start.date;
            this.end_date = end.date;

            this.fetchEvents({
                params: {
                    start_date: start.date,
                    end_date: end.date,
                },
            });
        },
    },
};
</script>
