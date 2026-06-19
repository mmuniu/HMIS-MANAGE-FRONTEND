import Vue from 'vue';
import CustomsClear from '@users/components/CustomsClear';
import PassportCustoms from '@users/components/Customs';
import UsersSearch from '@users/components/users/UsersSearch';
import CompanySearch from '@users/components/users/CompanySearch';
import CheckedInBy from '@users/components/users/CheckedInBy';
import SeenByUsers from './components/users/SeenByUsers.vue';
import UsersIndex from '@users/components/users/Index';
import UsersSignature from '@users/components/users/Signature';


Vue.component('users-passport-customs', PassportCustoms);
Vue.component('users-passport-customs-clear', CustomsClear);
Vue.component('users-search', UsersSearch);
Vue.component('seen-by', SeenByUsers);
Vue.component('checked-in-by', CheckedInBy);

Vue.component('users-index', UsersIndex);
Vue.component('users-signature', UsersSignature);

