<template>
    <v-card>
        <v-card-title height="23">
            <h4>Patient admissions report</h4>
            <v-spacer></v-spacer>
        </v-card-title>

        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>

        <filters  :obj="obj" @filter="performFilter()"></filters>

        <v-data-table
                flat
                disable-pagination
                hide-default-footer
                :headers="list.headers"
                :items="list.data"
        >
        </v-data-table>


        <v-row>
            <v-col cols="12" class="text-center">
                <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
            </v-col>
        </v-row>
    </v-card>
</template>
<script>
import { reportsMixin } from '@reports/libs/reportsMixin';
import Filters from './Filters';

export default {
    name: 'patient-admissions',

    mixins: [
        reportsMixin,
    ],

    components: {
        Filters,
    },

    data: () => ({
        module: 'inpatient',
        decoratorKey: 'patient-admissions',
    }),

};
</script>
