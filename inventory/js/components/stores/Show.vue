<template>
    <v-row  >
        <v-col class="text-center" cols="12" >
            <nav class="navio grey lighten-2">
                <v-btn-toggle v-model="icon" flat>
                    <router-link tag="v-btn" v-for="(nav, index) in navigation" class="text-center"
                                 :key="index" :to="usher(nav)"
                                 
                                  exact active-class="active">
                        <a>{{ nav.name }}</a>
                    </router-link>
                </v-btn-toggle>
            </nav>
        </v-col>

        <v-col cols="12">
            <div class="mt-4 px-3">
                <transition name="slide">
                    <router-view :userId="userId"></router-view>
                </transition>
            </div>
        </v-col>
    </v-row>
</template>

<script>
export default {
    name: 'stores-show',

    props: [
        'isStore', 'userId',
    ],

    data() {
        return {
            icon: true,
            navigation: [
                { url: 'products', name: 'Products in store' },
                { url: 'receive', name: 'Direct orders' },
                // { url: 'external-orders', name: 'External orders' },
                { url: 'internal-orders', name: 'Internal orders' },
                { url: 'received-orders', name: 'Received orders' },
                { url: 'stock-take', name: 'Stock take' },
                { url: 'knock-off', name: 'Knock off items' },
                { url: 'store-reports', name: 'Store Analytics' },
                { url: 'issue-products', name: 'Issue out products' },
                { url: 'add-items-to-store', name: 'Add items to store' },
                // { url: 'stock-taking', name: 'Stock taking' },
            ],
        };
    },

    methods: {
        usher(nav) {
            const storeId = JSON.parse(this.isStore).id;
            return `/inventory/stores/${storeId}/${nav.url}`;
        },
    },
};
</script>
