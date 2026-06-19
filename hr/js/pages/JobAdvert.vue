<!--
* Created by PhpStorm.
* User: Lexx YungCarter
* Date: 01/11/2018
* Time: 01:00
* Project: platform
-->

<template>
    <div>
        <jumbo></jumbo>

        <v-container fluid fill-height class="grey lighten-4">
            <v-layout>

                <!-- listings -->
                <v-flex xs12 sm8 md9>
                    <listing></listing>
                </v-flex>

                <!-- other part -->
                <v-flex xs-12 sm4 md3>
                    <div class="pl-4">
                        <v-card>
                            <v-img
                                    src="https://cdn.vuetifyjs.com/images/cards/desert.jpg"
                                    aspect-ratio="2.75"
                            ></v-img>

                            <v-card-title primary-title>
                                <div>
                                    <h3 class="headline mb-0">Previous Applications</h3>
                                    <div>Login to access your previous applications, searches, and short-listings</div>
                                </div>
                            </v-card-title>

                            <v-card-actions>
                                <v-btn flat color="orange">Login</v-btn>
                                <v-btn flat color="green">Register</v-btn>
                            </v-card-actions>
                        </v-card>
                    </div>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<script>

    import Jumbo from '../components/frontend/job-adverts/Jumbo';
    import Listing from '../components/frontend/job-adverts/Listing';

    export default {
        components: {
            Jumbo, Listing
        }
    }
</script>

<style scoped lang="scss">

</style>