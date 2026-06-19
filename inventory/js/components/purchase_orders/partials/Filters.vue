<template>
   <v-row class="text-right">
       <v-col cols="2">
           <users-search @results="userSelected"
                         label="Ordered by"
                         leaveSelected
                         required
                         @clearedSelected="userCleared"
           ></users-search>
       </v-col>
       <v-col cols="2">
           <suppliers-search @results="setSupplier" @clearedSelected="clearSupplier"></suppliers-search>
       </v-col>
       <v-col cols="2">
           <v-autocomplete
                   outline clearable
                   label="Store"
                   :items="stores.data"
                   item-text="name"
                   item-value="id"
                   v-model="filters.store_id"
           ></v-autocomplete>
       </v-col>
       <v-col md="2">
           <collabmed-date-time-picker @input="setStartDate" outline :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
       </v-col>

       <v-col md="2">
           <collabmed-date-time-picker @input="setEndDate" outline :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
       </v-col>
       <v-col cols="2">
           <v-select label="status"
                     :items="statuses"
                     v-model="filters.status"
           ></v-select>
       </v-col>
       <v-col cols="2">
           <v-btn small color="primary" @click="filter()">filter</v-btn>
           <v-btn small color="warning" @click="clearFilters()">clearFilters</v-btn>
       </v-col>
   </v-row>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import SuppliersSearch from '@inventory/components/searches/Suppliers';
import moment from 'moment';

export default {
    props: [
        'statuses',
    ],

    components: {
        SuppliersSearch,
    },

    data: () => ({
        filters: {
            ordered_by: null,
            start_date: moment(new Date()).startOf('month').format('YYYY-MM-DD HH:MM'),
            end_date: moment(new Date()).format('YYYY-MM-DD HH:MM'),
            amount_gt: null,
            store_id: null,
            supplier_id: null,
            status: status,
        },
    }),

    computed: {
        ...mapGetters({
            stores: 'getStores',
        }),
    },

    methods: {
        ...mapActions([
            'setStores',
        ]),

        setStartDate(datetime) {
            this.filters.start_date = datetime;
        },

        setEndDate(datetime) {
            this.filters.end_date = datetime;
        },

        userSelected(user) {
            this.filters.ordered_by = user.id;
        },

        setSupplier(supplier) {
            this.filters.supplier_id = supplier.id;
        },

        clearSupplier() {
            this.filters.supplier_id = null;
        },

        userCleared() {
            this.filters.ordered_by = null;
        },

        filter() {
            const filters = _.omitBy(this.filters, _.isNil);

            this.$emit('filter', filters);
        },

        clearFilters() {
            this.filters.ordered_by = null;
            this.filters.start_date = null;
            this.filters.end_date = null;
            this.filters.amount_gt = null;
            this.filters.store_id = null;
            this.filters.supplier_id = null;

            const filters = _.omitBy(this.filters, _.isNil);

            this.$emit('filter', filters);
        },
    },

    mounted() {
        this.setStores();
    },
};
</script>
