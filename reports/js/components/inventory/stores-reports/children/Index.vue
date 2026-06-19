<template>
    <div>
        <collabmed-floating-loader v-if="list.length < 1 || obj.form.loading"></collabmed-floating-loader>
        <v-card v-if="list.store">
            <v-card-title height="23" class="pt-2 text-center">
                <h4>Internal Stores</h4>
            </v-card-title>
            <template>
                <v-data-table
                        hide-default-footer
                        :headers="store_headers"
                        :items="list.store"
                        class="elevation-1"
                >
                </v-data-table>
            </template>
            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
        </v-card>
        <v-card v-else-if="list.movement">
            <v-card-title height="23" class="pt-2 text-center">
                <h4>Stock Movement</h4>
            </v-card-title>
            <template>
                <v-data-table
                        hide-default-footer
                        :headers="movement_headers"
                        :items="list.movement"
                        class="elevation-1"
                >
                </v-data-table>
            </template>
            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
        </v-card>
        <v-card v-else-if="list.expiry">
            <v-card-title height="23" class="pt-2 text-center">
                <h4>Internal stores</h4>
            </v-card-title>
            <collabmed-loading v-if="!list.expiry"></collabmed-loading>
            <template>
                <v-data-table
                        hide-default-footer
                        :headers="expiry_headers"
                        :items="list.expiry"
                        class="elevation-1"
                >
                    <template v-slot:item.status="{ item }"> expiring in {{ item.status }} days </template>
                </v-data-table>
            </template>
            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
        </v-card>
    </div>
</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";


export default {
    mixins: [
        reportsMixin,
    ],

    data: () => ({
        decoratorKey: "stores-reports",
        module: "inventory",
        store_headers: [
            { text: "Product Name", value: "item", sortable: false },
            { text: "Cost", value: "cost", sortable: false },
            { text: "Remaining Stock", value: "quantity" },
            { text: "Value", value: "value" },
        ],
        movement_headers: [
            { text: "Item", value: "item", sortable: false },
            { text: "Type", value: "type", sortable: false },
            { text: "Store", value: "name" },
            { text: "Qty", value: "quantity" },
            { text: "Action", value: "action" },
            { text: "Facilitor", value: "action_by" },
            { text: "Opening", value: "opening_stock" },
            { text: "Closing", value: "closing_stock" },
            { text: "Date", value: "date" },
        ],
        expiry_headers: [
            { text: "Product Name", value: "product_name", sortable: false },
            { text: "Arrival Date", value: "arrival_date", sortable: false },
            { text: "Expiry Date", value: "expiry_date" },
            { text: "Remaining Stock", value: "quantity" },
            { text: "Status", value: "status" },
        ],
    }),

    computed: {
        url() {
            return "/api/reports/module/inventory/stores-reports";
        },
    },

    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },
    },

    watch: {
        page(val) {
            this.obj.filters = _.omitBy(this.$route.query, _.isNil);

            this.obj.performFilter(this.module, this.decoratorKey, val);
        },
    },

    created() {
        this.processing_child = true;

        this.obj.filters = _.omitBy(this.$route.query, _.isNil);

        this.obj.performFilter(this.module, this.decoratorKey);
    },
};
</script>
