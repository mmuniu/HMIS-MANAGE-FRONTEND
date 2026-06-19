<!--
* Created by PhpStorm.
* User: Lexx YungCarter
* Date: 01/11/2018
* Time: 01:54
* Project: platform
-->

<template>

    <div class="my-2 relative" :class="[ item.internal ? 'cyan lighten-4' : 'white' ]">

        <div class="internal-label ribbon base" v-if="item.internal">
            <span>Internal</span>
        </div>

        <v-layout class="px-4 pt-3">
            <v-flex xs3 sm3>
                <h3 class="headline mb-0 font-weight-thin">{{ item.name | ucwords }}</h3>
                Westlands, Nairobi
            </v-flex>

            <v-flex xs6 sm6>
                Ready to change the way content is generated and shared in Kenya? Join one of the fastest growing sites in Kenya. With over 3.8 million monthly readers, your work is certain to be seen! Hivisasa is looking for a UX minded designer to help co-create a product our readers and writers will enjoy and…

            </v-flex>

            <v-flex xs3 sm3>
                <div class="pl-4">
                    <p >Position: {{ item.position }}</p>
                    <p>26 May, 2018</p>
                    <v-btn flat color="primary">Read More</v-btn>
                </div>
            </v-flex>
        </v-layout>

        <v-divider></v-divider>
    </div>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";

    export default {
        props: [
            'item'
        ],

        data() {
            return {}
        },

        methods: {},

        mounted() {

        }
    }
</script>

<style scoped lang="css">
    .relative {
        position: relative;
    }
    .ribbon {
        position: absolute;
        top: 20px;
        right: -5px;
        padding: 10px;
    }
    .ribbon.base {
        background: #3498db;
        color: #fff;
        border-right: 5px solid #8bc4ea;
    }
    .ribbon.light {
        background: #ecf0f1;
        color: #2c3e50;
        border-right: 5px solid #dde4e6;
    }
    .ribbon.dark {
        background: #131313;
        color: #fff;
        border-right: 5px solid #464646;
    }
    .ribbon.base-alt {
        background: #9cd70e;
        color: #fff;
        border-right: 5px solid #c6f457;
    }
    .ribbon.red {
        background: #e91b23;
        color: #fff;
        border-right: 5px solid #f2787d;
    }
    .ribbon.orange {
        background: #ff8a3c;
        color: #fff;
        border-right: 5px solid #ffc7a2;
    }
    .ribbon.yellow {
        background: #ffd800;
        color: #fff;
        border-right: 5px solid #ffe866;
    }
    .ribbon:before, .ribbon:after {
        content: '';
        position: absolute;
        left: -9px;
        border-left: 10px solid transparent;
    }
    .ribbon:before {
        top: 0;
    }
    .ribbon:after {
        bottom: 0;
    }
    .ribbon.base:before {
        border-top: 27px solid #3498db;
    }
    .ribbon.base:after {
        border-bottom: 27px solid #3498db;
    }
    .ribbon.light:before {
        border-top: 27px solid #ecf0f1;
    }
    .ribbon.light:after {
        border-bottom: 27px solid #ecf0f1;
    }
    .ribbon.dark:before {
        border-top: 27px solid #131313;
    }
    .ribbon.dark:after {
        border-bottom: 27px solid #131313;
    }
    .ribbon.base-alt:before {
        border-top: 27px solid #9cd70e;
    }
    .ribbon.base-alt:after {
        border-bottom: 27px solid #9cd70e;
    }
    .ribbon.red:before {
        border-top: 27px solid #e91b23;
    }
    .ribbon.red:after {
        border-bottom: 27px solid #e91b23;
    }
    .ribbon.orange:before {
        border-top: 27px solid #ff8a3c;
    }
    .ribbon.orange:after {
        border-bottom: 27px solid #ff8a3c;
    }
    .ribbon.yellow:before {
        border-top: 27px solid #ffd800;
    }
    .ribbon.yellow:after {
        border-bottom: 27px solid #ffd800;
    }
    .ribbon span {
        display: block;
        font-size: 16px;
        font-weight: 600;
    }
</style>