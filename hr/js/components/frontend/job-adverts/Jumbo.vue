<!--
* Created by PhpStorm.
* User: Lexx YungCarter
* Date: 01/11/2018
* Time: 01:00
* Project: platform
-->

<template>
    <section>
        <v-parallax src="/modules/hr/img/hero-cropped.jpg" height="600">
            <v-layout
                    column
                    align-center
                    justify-center
                    class="white--text"
            >

                <div class="hero-text">
                    <h2 class="white--text mx-4 my-4 display-2 font-weight-light text-xs-center">Job Advertisements</h2>

                    <v-text-field
                            dark
                            color="white"
                            label="Search for a Job"
                            append-icon="search"
                            width="300px"
                            class="jumbo-search"
                    ></v-text-field>
                    <div>Popular Keywords:
                        <v-chip color="pink" text-color="white" small label>IT</v-chip>
                        <v-chip color="pink" text-color="white" small label>Financial Adviser</v-chip>
                    </div>
                </div>
            </v-layout>
        </v-parallax>
    </section>
</template>

<script>

    export default {
        data() {
            return {}
        },

        methods: {},

        mounted() {

        }
    }
</script>

<style scoped lang="scss">
    .hero-text {
        background-color: rgba(0,0,0,0.7);
        min-width: 70%;
        border-radius: 7px;
        padding: 50px 20px;
    }
    .jumbo-search {
        max-width: 70%;
        width: 50%;
        margin: 0 auto;
    }
</style>