<!--
* Created by PhpStorm.
* User: Lexx YungCarter
* Date: 01/11/2018
* Time: 01:00
* Project: platform
-->

<template>
    <div>
        <section>
            <v-parallax src="/modules/hr/img/hero-cropped.jpg" height="600">
                <v-layout
                        column
                        align-center
                        justify-center
                        class="white--text"
                >
                    <div class="hero-text px-5 py-5">
                        <h2 class="white--text mx-4 my-4 display-2 font-weight-light text-xs-center">Welcome to the HR Front-end Module</h2>
                    </div>
                </v-layout>
            </v-parallax>
        </section>
    </div>
</template>

<script>

    export default {

    }
</script>

<style scoped lang="scss">
    .hero-text {
        background-color: rgba(0,0,0,0.7);
        padding: 40px 10px;
    }
</style>