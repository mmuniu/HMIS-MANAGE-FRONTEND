<template>
    <v-card>
        <v-card-title height="23">
            <h4>Internal Stores</h4>
        </v-card-title>
        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
        <template>
            <v-data-table
                    hide-default-footer
                    :headers="list.headers"
                    :items="list.data"
                    class="elevation-1"
            >
                <template v-slot:item.actions="{ item }" class="text-right">
                    <a @click="viewStore(item)">
                        <v-btn small outline color="success">Store</v-btn>
                    </a>
                    <a @click="viewMovement(item)">
                        <v-btn small outline color="warning">Movement</v-btn>
                    </a>
                    <a @click="viewExpiry(item)">
                        <v-btn small outline color="primary">Expiry</v-btn>
                    </a>
                </template>
            </v-data-table>
        </template>
    </v-card>
</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";

export default {
    mixins: [
        reportsMixin,
    ],
    data: () => ({
        module: "inventory",
        decoratorKey: "stores-reports",
    }),

    methods: {
        viewStore(store) {
            const filters = {};

            filters.mode = "store";

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "store_id=" + store.id;

            window.open(`stores-reports${request_data}`, "_blank");
        },

        viewMovement(movement) {
            const filters = {};

            filters.mode = "movement";

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "store_id=" + movement.id;

            window.open(`stores-reports${request_data}`, "_blank");
        },

        viewExpiry(expiry) {
            const filters = {};

            filters.mode = "expiry";

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "store_id=" + expiry.id;

            window.open(`stores-reports${request_data}`, "_blank");
        },
    },

};
</script>
