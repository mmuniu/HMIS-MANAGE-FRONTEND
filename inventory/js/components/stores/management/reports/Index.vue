<template>
    <v-card flat style="margin-left: -15px;width: 102%;">
        <v-row>
            <v-col class="pa-4" >
                <v-card-text>
                    <v-btn :to="usher(nav)"
                           class="mx-2"
                           v-for="nav in navigation"
                           :key="nav.url"
                    >
                        <v-icon>{{ nav.icon }}</v-icon>
                        {{  nav.name }}
                    </v-btn>
                </v-card-text>
            </v-col>
        </v-row>
    </v-card>
</template>
<script>
export default {
    data() {
        return {
            icon: true,
            navigation: [
                { url: 'stock-movement', name: 'Stock MovementA', icon: 'move_to_inbox' },
                { url: 'audit-report', name: 'Stock dispatch audit report', icon: 'book' },
               /* { url: 'stock-expiries', name: 'Stock Expiries', icon: 'next_week' },
                { url: 'stock-value', name: 'Stock Value', icon: 'assessment' },*/
            ],
        };
    },

    methods: {
        usher(nav) {
            const storeId = this.$route.params.storeId;
            return `/inventory/stores/${storeId}/store-reports/${nav.url}`;
        },
       
    },
};
</script>
