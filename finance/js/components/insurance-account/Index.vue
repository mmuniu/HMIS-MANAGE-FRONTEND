<template>
    <collabmed-loading v-if="!insurance"></collabmed-loading>

    <v-card v-else>
        <v-card-title>
            <h3>{{ insurance.name }}</h3>
            <v-spacer></v-spacer>
            <nav class="navio">
                <v-btn-toggle flat>
                    <router-link tag="v-btn" v-for="(nav, index) in navigation" class="text-center"
                                 :key="index" :to="usher(nav)" exact active-class="active">
                        <a>{{ nav.name }}</a>
                    </router-link>
                </v-btn-toggle>
            </nav>
        </v-card-title>

        <v-card-text>
            <v-col cols="12">
                <div class="px-3">
                    <transition name="slide">
                        <router-view :insurance="insurance"></router-view>
                    </transition>
                </div>
            </v-col>
        </v-card-text>
    </v-card>
</template>
<script>
export default {
    props: [
        'company',
    ],

    data: () => ({
        navigation: [
            { url: 'dispatched-invoices', name: 'Dispatch' },
            { url: 'insurance-payments', name: 'Settle invoices' },
            { url: 'excel-upload-statuses', name: 'Settlement excel upload status' },
            { url: 'billed-invoices', name: 'Invoices & statement' },
            { url: 'insurance-paid', name: 'Insurance payments' },
            // { url: "summary", name: "Summary and analytics" },
        ],
    }),

    computed: {
        insurance() {
            return JSON.parse(this.company);
        },
    },

    methods: {
        usher(nav) {
            return `/finance/insurance-company/${this.insurance.id}/account/${nav.url}`;
        },
    },
};
</script>
