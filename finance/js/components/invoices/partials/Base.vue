<template>
    <div>
        <v-row>
            <v-col class="text-center" cols="12" >
                <nav class="navio grey lighten-2">
                    <v-btn-toggle v-model="icon" flat>
                        <router-link tag="v-btn"
                                     v-for="(nav, index) in navigation"
                                     class="text-center"
                                     :key="index"
                                     :to="usher(nav)"
                                     exact active-class="active">
                            <a>{{ nav.name }}</a>
                        </router-link>
                    </v-btn-toggle>
                </nav>
            </v-col>

            <v-col cols="12">
                <div class="mt-4 px-3">
                    <transition name="slide">
                        <router-view></router-view>
                    </transition>
                </div>
            </v-col>
        </v-row>
    </div>
</template>

<script>
export default {
    data() {
        return {
            icon: true,
            navigation: [
                { url: 'pending', name: 'Pending' },
                // { url: 'manual-invoice', name: 'Manual Invoice' },
                { url: 'billed', name: 'Billed' },
                { url: 'cancelled', name: 'Cancelled' },
                { url: 'dispatched', name: 'Dispatched' },
                // { url: 'insurance-payment', name: 'Insurance payment' },
                // { url: 'insurance-paid', name: 'Insurance paid' },
            ],
        };
    },

    methods: {
        usher(nav) {
            return `/finance/invoices/${nav.url}`;
        },
    },
};
</script>
