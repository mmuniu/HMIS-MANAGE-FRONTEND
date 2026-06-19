<!--
* Created by PhpStorm.
* User: Lexx YungCarter
* Date: 01/11/2018
* Time: 13:30
* Project: platform
-->

<template>
        <v-layout row justify-center>
            <v-dialog v-model="dialog" persistent max-width="300px">

                <form v-on:submit.prevent="submit">
                    <v-card>
                        <v-card-title>
                            <span class="headline">Login</span>
                        </v-card-title>

                        <v-card-text>
                            <v-container grid-list-md>
                                <v-layout wrap>
                                    <v-flex xs12>
                                        <v-text-field label="Username*" v-model="auth.username" required></v-text-field>
                                    </v-flex>
                                    <v-flex xs12>
                                        <v-text-field type="password" v-model="auth.password" label="Password*" required></v-text-field>
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="green lighten-1" flat type="submit">Login</v-btn>
                            <v-btn color="blue darken-1" flat @click.native="dialog = false">Close</v-btn>
                        </v-card-actions>
                    </v-card>
                </form>
            </v-dialog>
        </v-layout>
</template>

<script>
    import Auth from '@hr/libs/auth/Auth';
    import { customs_mixin } from "@users/components/customs_mixin";

    export default {
        mixins: [
            customs_mixin
        ],

        data() {
            return {
                dialog: false,
                auth: new Auth,
            }
        },

        computed: {
            passport(){
                return this.auth.passport;
            }
        },

        watch:
        {
            passport(value) {
                if(value) {
                    this.setUser(value);
                    return window.location.reload(true);

                }

                return this.clearUser();
            }
        },

        methods: {
            submit()
            {
                return this.auth.login();
            }
        },

        created() {
            window.events.$on('toggle-login-modal', () => {
                this.dialog = !this.dialog;
            });
        }
    }
</script>

<style scoped lang="scss">

</style>