<!--
* Created by PhpStorm.
* User: Lexx YungCarter
* Date: 01/11/2018
* Time: 09:45
* Project: platform
-->

<template>
    <v-layout class="footer">
        <v-flex xs12>
            <v-container class="px-4 py-4  my-4">
                <v-layout class="white--text">
                    <v-flex xs4>
                        <h4 class="title">{{ facility ? facility.name : '' }}</h4>
                        <p>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type changed.
                        </p>

                        <v-list two-line subheader dark>
                            <v-subheader>Contact Information</v-subheader>

                            <v-list-tile avatar>
                                <v-list-tile-content>
                                    <v-list-tile-title>
                                        <v-icon class="pr-2">location_on</v-icon> Nairobi
                                    </v-list-tile-title>
                                    <v-list-tile-sub-title>Industrial Area</v-list-tile-sub-title>
                                </v-list-tile-content>
                            </v-list-tile>

                            <v-list-tile avatar>
                                <v-list-tile-content>
                                    <v-list-tile-title>
                                        <v-icon class="pr-2">call</v-icon> 0701 222 333
                                    </v-list-tile-title>
                                    <v-list-tile-sub-title>Open from Monday - Friday, 8:00 AM to 5:00 PM</v-list-tile-sub-title>
                                </v-list-tile-content>
                            </v-list-tile>

                            <v-list-tile avatar>
                                <v-list-tile-content>
                                    <v-list-tile-title>
                                        <v-icon class="pr-2">email</v-icon> email@gmail.com
                                    </v-list-tile-title>
                                    <v-list-tile-sub-title>Send us any inquiry</v-list-tile-sub-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </v-list>

                    </v-flex>

                    <v-flex xs4>
                        <div  class="pr-2">
                            <h4 class="title">Useful Links</h4>

                            <ul>
                                <li>About Us</li>
                                <li>Contact Us</li>
                            </ul>
                        </div>

                    </v-flex>

                    <v-flex xs4>
                        <div>
                            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d510564.6498664422!2d36.56720029142611!3d-1.3031933719272912!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf0254b297924c!2sNairobi!5e0!3m2!1sen!2ske!4v1541058188450" width="600" height="450" frameborder="0" style="border:0" allowfullscreen></iframe>
                        </div>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-flex>
    </v-layout>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";

    export default {
        props: [
            'facility',
        ],

        data() {
            return {}
        },

        methods: {},

        mounted() {
            console.log('name', this.facility)
        }
    }
</script>

<style scoped lang="scss">
    .footer {
        background-image: url('/modules/hr/img/footer.jpg');
        background-size: cover;
        background-position: center center;
    }
</style>