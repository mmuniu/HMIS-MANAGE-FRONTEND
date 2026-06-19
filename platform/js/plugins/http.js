import Vue from "vue";
import Swal from "sweetalert2";
import { immigrantKey } from "@app/libs/Util";

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

window.axios = require("axios");

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

window.axios.interceptors.request.use(null, (error) => Promise.reject(error));

window.axios.interceptors.request.use(
    (config) => {
        const tokenData = JSON.parse(window.localStorage.getItem(immigrantKey));

        if (tokenData) {
            config.headers.common["Accept"] = "application/json";
            config.headers.common["Authorization"] = `Bearer ${tokenData.access_token}`;
        }

        return config;
    },
    (error) => {
        console.log("sfsdfsdl");
        return Promise.reject(error);
    },
);
window.axios.interceptors.response.use(
    (response) => {
        if (response.status === 200 || response.status === 201) {
            return Promise.resolve(response);
        } else {
            return Promise.reject(response);
        }
    },
    (error) => {
        if (error.response.status) {
            switch (error.response.status) {
            case 400:
                break;
            case 422:
                return Promise.reject(error);
                break;
            case 401:
                if(confirm('Your session has expired, please log in again')) {
                    window.open(`/auth/login`, '_self')
                }
                break;
            case 403:
                router.replace({
                    path: "/login",
                    query: { redirect: router.currentRoute.fullPath },
                });
                break;
            case 404:
                alert("page not exist");
                break;
            case 502:
                setTimeout(() => {
                    router.replace({
                        path: "/login",
                        query: {
                            redirect: router.currentRoute.fullPath,
                        },
                    });
                }, 1000);
            }
            return Promise.reject(error.response);
        }
    },
);

/**
 * To avoid a user's token being deactivated due to inactivity,
 * we are going to start a timeout to refresh the page or logout user automatically
 */
// require('./libs/inactivityGuard');


/**
 * Next we will register the CSRF Token as a common header with Axios so that
 * all outgoing HTTP requests automatically have it attached. This is just
 * a simple convenience so we don't have to attach every token manually.
 */

const token = document.head.querySelector("meta[name=\"csrf-token\"]");

if (token) {
    window.axios.defaults.headers.common["X-CSRF-TOKEN"] = token.content;
} else {
    console.error("CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token");
}
