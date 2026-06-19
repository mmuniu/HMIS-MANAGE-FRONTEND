<template>
    <v-row>
        <v-col>
            <v-card class="navio mb-4" flat>
                <v-btn-toggle flat>
                    <router-link tag="v-btn" v-for="(item, index) in nav" :key="index"
                                 :to="usher(item.url)" active-class="active" exact
                                 class="text-center">
                        <a>{{ item.name }}</a>
                    </router-link>
                </v-btn-toggle>
            </v-card>

            <v-card class="mt-4">
                <v-card-text>
                    <v-router-transition transition="slide">
                        <router-view></router-view>
                    </v-router-transition>
                </v-card-text>
            </v-card>

        </v-col>
    </v-row>
</template>

<script>

import _ from 'lodash';

export default {

    data() {
        return {
            nav: [
                { name: 'Pending', url: 'pending' },
                { name: 'Approved', url: 'approved' },
                { name: 'Rejected', url: 'rejected' },
            ],
        };
    },

    methods: {
        usher(key) {
            const url = route('evaluation.approvals.index', ':key').relative(true);
            return url.replace(':key', key);
        },

        hasKey() {
            const url = window.location.href;

            return _.find(this.nav, { url: url.split('/').pop() });
        },
    },

    mounted() {
        if (! this.hasKey()) {
            this.$router.push(this.usher(_.first(this.nav).url));
        }
    },
};
</script>
