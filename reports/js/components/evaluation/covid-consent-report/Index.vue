<template>
    <v-card>

        <covid-consent-filter  :obj="obj" @filter="performFilter"></covid-consent-filter>

        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>

        <template>
            <v-data-table
                hide-default-footer
                flat
                :headers="list.headers"
                disable-pagination
                :items="list.data"
                class="elevation-1"
            >
            </v-data-table>
            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
        </template>
    </v-card>
</template>
<script>
import Filters from "./Filters";
import { reportsMixin } from '@reports/libs/reportsMixin';

export default {

    mixins: [
        reportsMixin,
    ],

    components: {
        'covid-consent-filter': Filters,
    },

    data: () => ({
        module: 'evaluation',
        decoratorKey: 'covid-consent-report',
    }),

    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },
    },
};
</script>
