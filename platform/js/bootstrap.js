 import Vue from 'vue';

import Swal from 'sweetalert2';
import Echo from 'laravel-echo';
window._ = require('lodash');
window.Popper = require('@popperjs/core').default;
import Error403 from './components/errors/403.vue';


window.axios = require('axios');
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.interceptors.request.use(null, (error) => Promise.reject(error));

window.axios.interceptors.response.use((response) => // intercept the global error
    response,
(error) => {
    if (error.response.status === 401) { // if the error is 401
        alert('Sorry. It seems your access token has expired ');
    }

    if (error.response.status === 403) {
        alert('Unauthorised access!');
    }

    if (error.response.status === 500) {
        alert(error.response);
    }

    // Reject the error and proceed
    return Promise.reject(error);
});


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

const token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

window.events = new Vue();

window.flash = function(details) {
    window.events.$emit('flash', details);
};

// window.Pusher = require('pusher-js');
//
// window.Echo = new Echo({
//     broadcaster: 'pusher',
//     key: process.env.MIX_PUSHER_APP_KEY,
//     cluster: process.env.MIX_PUSHER_APP_CLUSTER,
//     encrypted: true,
//     forceTLS: true,
// });
