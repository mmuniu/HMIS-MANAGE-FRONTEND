<template>
    <div>
        <v-tabs
            class="tabs"
            centered
            grow
            height="60px"
            v-model="activeTab"
        >
            <v-tab v-for="(action, index) in actions"
                   :key="index"
                   class="item text-center text--black"
                   ripple
                   :to="usher(action)"
                   active-class="active"
                   exact
            >
                <span style="color: black;"> {{ action.display_name }}</span>
            </v-tab>
        </v-tabs>

        <div class="mt-4">
            <router-view :visit-id="visitId"
                         :patient-id="patientId"
                         :payment-mode="paymentMode"></router-view>
        </div>
    </div>
</template>

<script>
export default {
    name: 'theatre-evaluate',

    props: [
        'visitId', 'paymentMode', 'patientId',
    ],

    data() {
        return {
            icon: true,
            activeTab: 'pre-op-notes',
            actions: [
                { display_name: 'Pre Op Notes', url: 'pre-op-notes' },
                { display_name: 'Drugs', url: 'drugs' },
                { display_name: 'Anaesthetics', url: 'anaesthetics' },
                { display_name: 'Consumables', url: 'consumables' },
                { display_name: 'Post Op notes', url: 'post-op-notes' },
                { display_name: 'Chargesheet', url: 'charges' },
            ],
        };
    },

    methods: {
        usher(nav) {
            const operationId = this.$route.params.operationId;

            return `/theatre/operation/${operationId}/${nav.url}`;
        },
    },
};
</script>
<style lang="scss">
.v-tabs.evaluation {
    a {
        font-weight: 600;
        color: #5d5d5d;
    }

    .active {
        background-color: #cccccc;

        * {
            color: #231f1f !important;
            font-weight: 600;
        }
    }

    .item {
        &:hover {
            background-color: #f6f6f6;
        }
    }

    .v-tabs__icon--next, .v-tabs__icon--prev {
        font-size: 46px;
    }
}
</style>
