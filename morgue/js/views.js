import Vue from 'vue';
import AdmissionCreate from "@morgue/components/admissions/create"
import MorgueCheckin from "@morgue/components/Checkin"
import MorgueDispatch from "@morgue/components/Dispatch"
import MorgueFridgeSetup from "@morgue/components/Setup/Fridges"


Vue.component('morgue-admission-create', AdmissionCreate);
Vue.component('morgue-existing-patient-checkin', MorgueCheckin);
Vue.component('morgue-setup-fridges', MorgueFridgeSetup);
Vue.component('morgue-dispatch', MorgueDispatch);
