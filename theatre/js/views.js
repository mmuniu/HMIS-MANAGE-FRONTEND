
import Vue from "vue";
import TheatreBookingsCreate from "./components/bookings/Create";
import TheatreBookingCreateModal from "./components/bookings/CreateModal";
import BookingsConsumableRequirements from "./components/bookings/ConsumableRequirements";
import TheatreBookingIndex from "./components/bookings/Index";
import TheatreSchedulesIndex from "./components/schedules/Index";
import TheatreSchedulesCreate from "./components/schedules/Create";

import TheatrePatientInformation from "./components/PatientInformation";
import TheatreNurseCheck from "./components/wardcheck/NurseCheck";
import TheatreDoctorCheck from "./components/wardcheck/DoctorCheck";
import TheatreAnaesthetistCheck from "./components/wardcheck/AnaesthetistCheck";
import PreOpConsentForm from "./components/PreOpConsentForm.vue";
import StandardConsentForm from "./components/StandardConsentForm.vue";
// import TheatreBookingCreateModal

/*
 * Theatre bookings
 */
Vue.component("theatre-bookings-create", TheatreBookingsCreate);
Vue.component("theatre-bookings-create-modal", TheatreBookingCreateModal);
Vue.component("theatre-bookings-index", TheatreBookingIndex);

Vue.component("theatre-bookings-consumable-requirements", BookingsConsumableRequirements);

// schedules
Vue.component("theatre-schedules-index", TheatreSchedulesIndex);
Vue.component("theatre-schedules-create", TheatreSchedulesCreate);

// patient info
Vue.component("theatre-patient-information", TheatrePatientInformation);

//ward check
Vue.component("theatre-nurse-ward-check", TheatreNurseCheck)
Vue.component("theatre-doctor-ward-check", TheatreDoctorCheck)
Vue.component("theatre-anaesthetist-ward-check", TheatreAnaesthetistCheck)
// evaluation - pre-op consent form


Vue.component("pre-op-consent-form", PreOpConsentForm);
Vue.component("standard-consent-form", StandardConsentForm);
