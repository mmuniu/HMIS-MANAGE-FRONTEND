/**
 * Created by PhpStorm.
 * User: Lexx YungCarter
 * Date: 15/11/2018
 * Time: 12:56
 * Project: platform
 */

import Vue from 'vue';
import UniversalSearch from './components/search/Universal';
import Emails from './components/emails/Index';
import SignaturePad from './components/globals/SignaturePad';
import Env from '@core/components/environment/Env';
import Oauth from '@core/components/environment/Oauth';
import BaseMaterialCard from '@core/components/globals/Card.vue';
import BaseMaterialChartCard from '@core/components/globals/MaterialChartCard';
import BaseMaterialStatsCard from '@core/components/globals/MaterialStatsCard';
import SystemDashbaordIndex from '@core/components/dashboard/Index';
import SystemGooglePlaces from '@core/components/globals/SystemGooglePlaces';

Vue.component('collabmed-universal-search', UniversalSearch);
Vue.component('core-emails', Emails);
Vue.component('core-signature-pad', SignaturePad);
Vue.component('core-environment-env', Env);
Vue.component('core-environment-oauth', Oauth);
Vue.component('base-material-card', BaseMaterialCard);
Vue.component('base-material-chart-card', BaseMaterialChartCard);
Vue.component('base-material-stats-card', BaseMaterialStatsCard);
Vue.component('system-dashboard-view', SystemDashbaordIndex);
Vue.component('system-google-places', SystemGooglePlaces);
