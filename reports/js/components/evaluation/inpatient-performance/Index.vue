<template>
   <v-card>
       <v-card-title height="23">
           <h4>Inpatient Performance</h4>
           <v-spacer></v-spacer>
           <inpatient-performance-graph :graphData="list.data"></inpatient-performance-graph>
       </v-card-title>
       <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
       <inpatient-performance-filter :obj="obj" @filter="performFilter()"></inpatient-performance-filter>
       <template>
           <v-data-table
                   hide-default-footer
                   :headers="list.headers"
                   :items="list.data"
                   class="elevation-1"
           >
           </v-data-table>
       </template>
   </v-card>
</template>
<script>
import { reportsMixin } from '@reports/libs/reportsMixin';
import Filter from './Filters';
import Graph from './ViewGraph';

export default {

    mixins: [
        reportsMixin,
    ],

    components: {
        'inpatient-performance-filter': Filter,
        'inpatient-performance-graph': Graph,
    },

    data: () => ({
        module: 'evaluation',
        decoratorKey: 'inpatient-performance',
    }),

    // methods: {
    //     viewMore(data){
    //         // console.log(data);
    //         let filters = this.obj.filters;
    //         //
    //         filters.facility_id = data.facility_id;
    //         //
    //         let request_data = '?child=true&';
    //         //
    //         _.map(filters, (item, key) => {
    //             request_data = request_data  + key + '=' + item + '&';
    //         });
    //         //
    //         request_data = request_data + 'ward_id=' + data.ward_id;
    //         //
    //         window.open(`inpatient-performance${request_data}`, '_blank');
    //     }
    // }
};
</script>
