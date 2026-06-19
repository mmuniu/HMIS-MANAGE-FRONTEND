/**
 * First we will load all of this project's JavaScript dependencies which
 * include Vue. This gives a great starting point for
 * building robust, powerful web applications using Vue and Laravel.
 */

// window.Vue = require("vue").default;
import Vue from "vue";

import { _ } from "vue-underscore";
import { mapActions } from "vuex";
import { permissionsKey, immigrantKey, settingsKey } from "@app/libs/Util";


import { initMixin } from "@app/libs/initMixin";
import titleMixin from "./libs/titleMixin";
import "./plugins/plugins"; // all imports here
import vuetify from "./plugins/vuetify";

import router from "./plugins/vue-router";
import { store } from "./store/store";

import "./views";
require("./bootstrap");
import "./plugins/http";

window.events = new Vue();
Vue.mixin(titleMixin);
Vue.mixin(initMixin); // load system wide components

new Vue({
    el: "#app",

    props: [
        "shift",
    ],

    router,

    vuetify,

    store,

    methods: {
        ...mapActions([
            "setUserPermissions",
            "setSessions",
            "setSettings"
        ]),
    },

    mounted() {
        const immigrant = window.localStorage.hasOwnProperty(immigrantKey);

        const userPermissions = window.localStorage.hasOwnProperty(permissionsKey);

        const msettings = window.localStorage.hasOwnProperty(settingsKey);

        const isAuth = window.location.href.indexOf("auth") > -1;

        let inNonAuthroute = false;

        const nonAuthRoutes = ["frontend"];

        _.each(nonAuthRoutes, (item) => {

            // if route is not supposed to be under auth
            if (window.location.href.indexOf(item) > -1) {
                inNonAuthroute = true;
            }
        });

        // if immigrant is not set, and we are not on authentication routes then setPermissions
        // or user is in an auth route [eg. not in hr's frontend routes] > 851900 > 0706, 17388,
        if (!inNonAuthroute && !isAuth) {
            if (!userPermissions) {
                this.setUserPermissions();
            }

            if (!msettings) {
                this.setSettings();
            }

            this.setSessions();
        }
    },

    created() {
        window.events.$on("UPDATE_USER_PERMISSIONS", () => {
            Permissions.updatePermissions();

            window.events.$emit("UPDATED_USER_PERMISSIONS");
        });

        window.events.$on("UPDATE_SYSTEM_SETTINGS", () => {
            MSettings.updateSettings();

            window.events.$emit("UPDATED_SYSTEM_SETTINGS");
        });
    }
});
