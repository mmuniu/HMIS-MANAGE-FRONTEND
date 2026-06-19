/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */
import Vue from 'vue';
import VueRouterTransition from 'v-router-transition';
import Flash from './components/Flash.vue';
import Loader from './components/Loading.vue';
import FloatingLoader from './components/FloatingLoader';
import NoInternetAlert from './components/Disconnected';
import DateTimePicker from './components/DateTimePicker.vue';
import YearPicker from './components/YearPicker.vue';
import YearMonthPicker from './components/YearMonthPicker.vue';
import CustomReportExports from './components/CustomReportExports.vue';
import Paginator from './components/Paginator';
import TinyCmeEditor from '@tinymce/tinymce-vue';
// import TinyMce from "@app/components/TinyMce";
import VueSignature from "vue-signature"

// errors
import Error403 from './components/errors/403.vue';
import CKEditor from '@ckeditor/ckeditor5-vue2';
import ColorSettings from './components/ColorSettings.vue';
import PesapalPull from '@finance/components/pesapal/PesapalPull.vue';
Vue.component('collabmed-flash', Flash);
Vue.component('collabmed-loading', Loader);
Vue.component('collabmed-floating-loader', FloatingLoader);
Vue.component('collabmed-disconnected', NoInternetAlert);
Vue.component('v-router-transition', VueRouterTransition);
Vue.component('collabmed-date-time-picker', DateTimePicker);
Vue.component('collabmed-year-picker', YearPicker);
Vue.component('collabmed-year-month-picker', YearMonthPicker);
Vue.component('collabmed-custom-report-export', CustomReportExports);
Vue.component('collabmed-paginator', Paginator);
Vue.component('tinymce', TinyCmeEditor);
Vue.component('VueSignature', VueSignature);
Vue.component('color-settings', ColorSettings);
Vue.component('pesapal-pull', PesapalPull);
Vue.use( CKEditor );

// erros
Vue.component('error-403', Error403);
