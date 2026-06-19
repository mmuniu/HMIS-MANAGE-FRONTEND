<template>
    <v-card>
        <v-card-title height="23">
            <h4>Sample collection report</h4>
        </v-card-title>

        <sample-collection-filter :obj="obj" @filter="performFilter"></sample-collection-filter>

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
import { reportsMixin } from '@reports/libs/reportsMixin';
import Filter from './Filters';

export default {

    mixins: [
        reportsMixin,
    ],

    components: {
        'sample-collection-filter': Filter,
    },

    data: () => ({
        module: 'evaluation',
        decoratorKey: 'collected-samples',
    }),

    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },
    },
};
</script>
