import Vue from 'vue';
import vueSignature from 'vue-signature';
import JsonExcel from 'vue-json-excel';
import VueSweetalert2 from 'vue-sweetalert2';
import VueQuillEditor from 'vue-quill-editor';
import * as VueGoogleMaps from 'vue2-google-maps';
import VueGoogleCharts from 'vue-google-charts'



import 'chartist/dist/chartist.min.css';

Vue.use(require('vue-chartist'));
Vue.use(vueSignature);
Vue.use(VueSweetalert2);
Vue.use(require('vue-moment').default);
Vue.use(VueQuillEditor /* { default global options } */);
Vue.use(VueGoogleMaps, {
    load: {
        key: 'AIzaSyBOj4Cu-TyqCOStDvas3n4ZckEEjxnlljQ',
        libraries: 'places',
    },
});
Vue.use(VueGoogleCharts)

// import modules
require('@app/modules');
Vue.component('downloadExcel', JsonExcel);

/**
 * directives
 */
Vue.prototype.$http = require('axios');

// import filters
require('@app/libs/Filters');
require('@app/libs/Permissions'); // permissions - attached to window
require('@app/libs/MSettings'); // msettings - attached to window
