/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-07-11
 * Time: 23:08
 */

import Vue from "vue";

Vue.component("passport-clients", require("@app/components/passport/Clients.vue"));

Vue.component("passport-authorized-clients", require("@app/components/passport/AuthorizedClients.vue"));

Vue.component("passport-personal-access-tokens", require("@app/components/passport/PersonalAccessTokens.vue"));

