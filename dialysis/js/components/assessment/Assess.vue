<template>
    <div>
        <nav class="navio">
            <router-link v-for="(nav, index) in navigation"
                         :to="usher(nav)"
                         exact
                         active-class="active"
                         :key="index"
                         class="text-center"
            >
                {{ visuals(nav) }}
            </router-link>
        </nav>

        <div class="mt-4">
            <transition name="slide">
                <router-view></router-view>
            </transition>
        </div>
    </div>
</template>

<script>
export default {
    props: [
        "sessionId",
    ],

    data() {
        return {
            navigation: [
                { "machine": "Machine Assessment" },
                { "vascular": "Vascular Assessment" },
                { "patient": "Patient Assessment" },
            ],
        };
    },

    methods: {
        usher(nav) {
            const sessionId = JSON.parse(this.sessionId);

            return `/dialysis/session/${sessionId}/assess/${Object.keys(nav)[0]}`;
        },

        visuals(nav) {
            return nav[Object.keys(nav)[0]];
        },
    },
};
</script>

<style lang="scss">
    .navio{
        border-bottom: 1px solid #ddd;
        padding-bottom: 9px;
    }

    a{
        text-decoration: none;
        padding: 0 20px 10px 20px;
        color: #7f8c8d;
    }

    a.active{
        /*color: #3498db !important;*/
        color: #1abc9c !important;
        /*border-bottom: 3px solid #3498db;*/
        border-bottom: 3px solid #1abc9c;
        font-weight: 600;
    }

    /* Enter and leave animations can use different */
    /* durations and timing functions.              */
    .slide-enter-active {
        transition: all .4s ease;
        transition-delay: .2s;
    }
    .slide-leave-active {
        transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
    }
    .slide-enter, .slide-leave-to
        /* .slide-fade-leave-active below version 2.1.8 */ {
        transform: translateX(-30px);
        opacity: 0;
    }
</style>
