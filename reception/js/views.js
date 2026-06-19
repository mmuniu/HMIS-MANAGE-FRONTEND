
import Vue from 'vue';
import PatientSearch from '@reception/components/patients/PatientSearch.vue';
import CustomPosPatientSearch from '@reception/components/patients/CustomPosPatientSearch.vue';

import PatientAppointmentCalendar from '@reception/components/appointments/Calendar.vue';
import PatientAppoinmentsCreate from '@reception/components/appointments/Create.vue';
import PatientAppoinmentsIndex from '@reception/components/appointments/Index.vue';
import PatientAppoinmentsEdit from '@reception/components/appointments/Edit.vue';
import PatientsIndex from '@reception/components/patients/Index';
import PatientsUpdate from '@reception/components/patients/Update';
import PatientsCreate from '@reception/components/patients/Create';
import CustomersCreate from '@reception/components/customers/Create';
import CustomersIndex from '@reception/components/customers/Index';
import CustomersUpdate from '@reception/components/customers/Update';
import UnknownPatient from '@reception/components/patients/partials/UnknownPatient';
import PatientsInfo from '@reception/components/patients/partials/PatientInfo';
import ViewOnMap from '@reception/components/patients/ViewMapLocation';
import PatientDocuments from '@reception/components/patients/documents/Index';
import VisitsIndex from '@reception/components/visits/Index';
import VisitsEdit from '@reception/components/visits/Edit';
import VisitsCreate from '@reception/components/visits/Create';
import PatientPortal from '@reception/components/patients/portal/Index';
import CustomersPortal from '@reception/components/customers/portal/Index';

// Customer Portal Components
import CustomerDetails from '@reception/components/customers/portal/partials/CustomerDetails';
import PortalVisits from '@reception/components/customers/portal/partials/Visits';
import FinanceOverview from '@reception/components/customers/portal/partials/FinanceOverview';
import Deposits from '@reception/components/customers/portal/partials/Deposits';
import Withdrawals from '@reception/components/customers/portal/partials/Withdrawals';
import CashPayments from '@reception/components/customers/portal/partials/CashPayments';
import InvoicePayments from '@reception/components/customers/portal/partials/InvoicePayments';
import Waivers from '@reception/components/customers/portal/partials/Waivers';

import ContactTracing from '@reception/components/contact-tracing/Index';
import ContactTracingDetails from '@reception/components/contact-tracing/Details';
import PatientMovements from '@reception/components/patients/ViewMovements';
import ScreenPatient from '@reception/components/patients/Screen';
import PatientIdentityCard from '@reception/components/patients/portal/partials/PatientIdentityCard';
import CustomerIdentityCard from '@reception/components/customers/portal/partials/CustomerIdentityCard';

import MorgueCheckin from "@reception/components/Checkin"
import  ReceptionFollowUpIndex from "@reception/components/follow-up/Index"
Vue.component('reception-patient-search', PatientSearch);
Vue.component('custom-pos-patient-search', CustomPosPatientSearch);


/**
 * appointments
 */
Vue.component('reception-patients-appointments-calendar', PatientAppointmentCalendar);
Vue.component('morgue-existing-patient-checkin', MorgueCheckin);
Vue.component('reception-patients-appointments-create', PatientAppoinmentsCreate);
Vue.component('reception-patients-appointments-index', PatientAppoinmentsIndex);
Vue.component('reception-patients-appointments-edit', PatientAppoinmentsEdit);

/* patients*/
Vue.component('reception-patients-index', PatientsIndex);
Vue.component('reception-customers-index', CustomersIndex);
Vue.component('reception-patients-update', PatientsUpdate);
Vue.component('reception-patients-create', PatientsCreate);
Vue.component('reception-customers-create', CustomersCreate);
Vue.component('reception-customers-update', CustomersUpdate);

Vue.component('reception-patient-info', PatientsInfo);
Vue.component('reception-patient-documents', PatientDocuments);
Vue.component('reception-view-on-map', ViewOnMap);
Vue.component('reception-patient-movements', PatientMovements);
Vue.component('reception-screen-patient', ScreenPatient);
Vue.component('reception-patients-portal', PatientPortal);
Vue.component('reception-customers-portal', CustomersPortal);

Vue.component('reception-patient-identity-card', PatientIdentityCard);
Vue.component('reception-customer-identity-card', CustomerIdentityCard);

Vue.component('reception-unknown-patient', UnknownPatient);
Vue.component('reception-follow-up-index',ReceptionFollowUpIndex)

/* visits */
Vue.component('reception-visits-index', VisitsIndex);
Vue.component('reception-visits-edit', VisitsEdit);
Vue.component('reception-visits-create', VisitsCreate);

// contact tracing
Vue.component('reception-contact-tracing', ContactTracing);
Vue.component('reception-contact-tracing-details', ContactTracingDetails);
