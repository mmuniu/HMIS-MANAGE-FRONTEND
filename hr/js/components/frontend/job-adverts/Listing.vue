<!--
* Created by PhpStorm.
* User: Lexx YungCarter
* Date: 01/11/2018
* Time: 01:45
* Project: platform
-->

<template>
    <div>
        <h2 class="display-2 font-weight-thin my-5 no-background"><span>Latest Job Offers</span></h2>

        <v-slide-y-transition
            class="py-0 transparent"
            group
            tag="v-list"
        >
            <list v-for="(list, i) in items" :key="i" :item="list"></list>

        </v-slide-y-transition>

        <div class="my-5">
            <div class="text-xs-center">
                <v-pagination
                        v-model="page"
                        :length="4"
                        circle
                ></v-pagination>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";
    import List from './List';

    export default {
        components: {
            List
        },

        data() {
            return {
                page: 1,
                items: [
                    {
                        name: 'Mechanic',
                        position: 'position 1',
                        internal: false,
                    },
                    {
                        name: 'ICT Officer',
                        position: 'position 2',
                        internal: true,
                    },
                    {
                        name: 'CEO Assistant',
                        position: 'position 3',
                        internal: false,
                    },
                ],
            }
        },

        methods: {},

        mounted() {

        }
    }
</script>

<style scoped lang="css">
    /**
 * Horizontal Type Line Behind Text
 * Inspired by this discussion @ CSS-Tricks: https://css-tricks.com/forums/topic/css-trick-for-a-horizontal-type-line-behind-text/#post-151970
 * Available on jsFiddle: http://jsfiddle.net/ericrasch/jAXXA/
 * Available on Dabblet: http://dabblet.com/gist/2045198
 * Available on GitHub Gist: https://gist.github.com/2045198
 */
    h2 {
        /*font: 33px sans-serif;*/
        /*margin-top: 30px;*/
        text-align: center;
        /*text-transform: uppercase;*/
    }
    h2.background {
        position: relative;
        z-index: 1;
    }
    h2.background:before {
        border-top: 2px solid #dfdfdf;
        content: "";
        margin: 0 auto;
        /* this centers the line to the full width specified */
        position: absolute;
        /* positioning must be absolute here, and relative positioning must be applied to the parent */
        top: 50%;
        left: 0;
        right: 0;
        bottom: 0;
        width: 95%;
        z-index: -1;
    }
    h2.background span {
        /* to hide the lines from behind the text, you have to set the background color the same as the container */
        background: #fff;
        padding: 0 15px;
    }
    h2.double:before {
        /* this is just to undo the :before styling from above */
        border-top: none;
    }
    h2.double:after {
        border-bottom: 1px solid blue;
        -webkit-box-shadow: 0 1px 0 0 red;
        -moz-box-shadow: 0 1px 0 0 red;
        box-shadow: 0 1px 0 0 red;
        content: "";
        margin: 0 auto;
        /* this centers the line to the full width specified */
        position: absolute;
        top: 45%;
        left: 0;
        right: 0;
        width: 95%;
        z-index: -1;
    }
    h2.no-background {
        position: relative;
        overflow: hidden;
    }
    h2.no-background span {
        display: inline-block;
        vertical-align: baseline;
        zoom: 1;
        *display: inline;
        *vertical-align: auto;
        position: relative;
        padding: 0 20px;
    }
    h2.no-background span:before,
    h2.no-background span:after {
        content: '';
        display: block;
        width: 1000px;
        position: absolute;
        top: 0.73em;
        border-top: 1px solid #dfdfdf;
    }
    h2.no-background span:before {
        right: 100%;
    }
    h2.no-background span:after {
        left: 100%;
    }
    h2.no-span {
        display: table;
        white-space: nowrap;
    }
    h2.no-span:before,
    h2.no-span:after {
        border-top: 1px solid green;
        content: '';
        display: table-cell;
        position: relative;
        top: 0.5em;
        width: 45%;
    }
    h2.no-span:before {
        right: 1.5%;
    }
    h2.no-span:after {
        left: 1.5%;
    }

</style>