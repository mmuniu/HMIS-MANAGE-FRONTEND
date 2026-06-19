<!--
* Created by PhpStorm.
* User: Lexx YungCarter
* Date: 31/10/2018
* Time: 18:09
* Project: platform
-->

<template>
    <v-toolbar color="white" app fixed clipped-left>
        <v-toolbar-title><a :href="route('hr.frontend.home')" class="nav-title black--text lighen-1">Collabmed<span class="font-weight-light">HR</span></a></v-toolbar-title>
        <v-toolbar-side-icon @click.native="drawer = !drawer"></v-toolbar-side-icon>

        <v-text-field
                solo-inverted
                background-color="white"
                flat
                hide-details
                label="Search"
                prepend-inner-icon="search"
        ></v-text-field>
        <v-spacer></v-spacer>

        <v-btn outline color="blue" :href="route('hr.frontend.job-adverts.index')">
            <v-icon small class="pr-2">chrome_reader_mode</v-icon> Job Adverts
        </v-btn>

        <v-btn @click="login" v-if="!user">
            <v-icon small class="pr-2">lock</v-icon> Login
        </v-btn>

        <v-btn outline class="white" v-if="user">
            <v-icon small class="pr-2">account_circle</v-icon> {{ user.profile.full_name }}
        </v-btn>

        <v-btn @click="logout" color="red" outline v-if="user">
            Logout <v-icon small class="pl-2">lock</v-icon>
        </v-btn>

    </v-toolbar>
</template>

<script>
    import Auth from '@hr/libs/auth/Auth';
    import { customs_mixin } from "@users/components/customs_mixin";

    export default {
        mixins: [
            customs_mixin
        ],

        props: [
            'doe'
        ],

        data() {
            return {
                drawer: false,
                auth: new Auth,
                user: null,
            }
        },

        computed: {
            loggedInUser() {
                return this.auth.user;
            }
        },

        watch: {
            drawer(value) {
                window.events.$emit('toggle-hr-sidebar', value);
            },

            loggedInUser(value) {
                if(value) {
                    this.user = value;
                }
            }

        },

        methods: {
            login() {
                window.events.$emit('toggle-login-modal')
            },

            logout() {
                this.auth.logout();

                // clear token
                this.clearUser();

                // reload page
                window.location.reload(true);
            }
        },

        mounted() {
            this.user = this.auth.user;
        }

    }
</script>

<style scoped>
    .nav-title {
        text-decoration: none;
    }
</style>