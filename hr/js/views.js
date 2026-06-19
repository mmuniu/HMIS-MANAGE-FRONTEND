/**
 * Created by PhpStorm.
 * User: Lexx YungCarter
 * Date: 31/10/2018
 * Time: 18:07
 * Project: platform
 */

import Vue from "vue";

/*
 * Layout
 */
Vue.component("hr-vuetify-topbar", require("@hr/components/Toolbar"));
Vue.component("hr-vuetify-sidebar", require("@hr/components/NavSidebar"));
Vue.component("hr-vuetify-footer", require("@hr/components/Footer"));
Vue.component("hr-vuetify-login", require("@hr/components/Login"));

/**
 * front-end pages
 */
Vue.component("hr-pages-home", require("@hr/pages/Home"));
Vue.component("hr-pages-job-advert", require("@hr/pages/JobAdvert"));


/**
 * Backend Pages
 */
Vue.component("hr-job-advert-index", require("@hr/components/job-adverts/Index"));


