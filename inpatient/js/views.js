
import Vue from 'vue';
import InpatientAdmissionsRequestIndex from '@inpatient/components/admission-requests/Index';
import MorgueAdmissionsRequestIndex from '@inpatient/components/admission-requests/MorgueIndex';
import InpatientAdmissionsRequestCreate from '@inpatient/components/admission-requests/Create';
import InpatientAdmissionsRequestCreateModal from '@inpatient/components/admission-requests/CreateModal';
import InpatientProceduresForm from '@inpatient/components/evaluation/procedures/ProceduresForm';
import InpatientProceduresTable from '@inpatient/components/evaluation/procedures/ProceduresTable';
import InpatientInvestigationsForm from '@inpatient/components/evaluation/investigations/InvestigationsForm';
import InpatientInvestigationsTable from '@inpatient/components/evaluation/investigations/InvestigationsTable';
import InpatientChargesheetEdit from '@inpatient/components/chargesheet/Edit';
import MorgueAdmissionsIndex from '@inpatient/components/morgue/admissions/Index';
import ReceiveSampleModal from '@inpatient/components/receive-sample/Modal';

import InpatientDailyChargesheetEdit from '@inpatient/components/chargesheet/EditDailyChargeSheet';
import InpatientVerifyDaysCharges from '@inpatient/components/chargesheet/VerifyDaysCharges';
import InpatientAddRebate from '@inpatient/components/chargesheet/AddRebate';
import InpatientPendingProcedures from '@inpatient/components/pending-procedures/Index';
import DoctorNotesViewLogs from '@inpatient/components/evaluation/view-logs/DoctorNotesViewLogs';
import NurseNotesViewLogs from '@inpatient/components/evaluation/view-logs/NurseNotesViewLogs';
import PrescriptionsViewLogs from '@inpatient/components/evaluation/view-logs/PrescriptionsViewLogs';
import InvestigationResultViewLogs from '@inpatient/components/evaluation/view-logs/InvestigationResultsViewLogs';
import ReportOnLaborForm from '@inpatient/components/admissions/partials/ReportOnLaborForm';

import InpatientHistoryViewLogs from '@inpatient/components/evaluation/view-logs/InpatientHistoryViewLog';

import InpatientPrescriptionsAdministerDrugs from '@inpatient/components/evaluation/prescriptions/AdministerDrugs';
import InpatientAdmissionsIndex from '@inpatient/components/admissions/Index';
import InpatientAdmissionsCreate from '@inpatient/components/admissions/Create';
import InpatientEvaluationNavigation from '@inpatient/components/admissions/partials/Navigation';
import InpatientConsumablesCreate from '@inpatient/components/evaluation/consumables/Create';
import TheatreConsumableForm from '@inpatient/components/evaluation/consumables/partials/TheatreConsumableForm';

import InpatientConsumablesIndex from '@inpatient/components/evaluation/consumables/Index';
import InpatientPatientsPerWard from '@inpatient/components/graphs/patients_wards/Index';
import SummaryofLabour from '@inpatient/components/admissions/partials/SummaryofLabour';
import PartographAnalytics from '@inpatient/components/admissions/partials/PartographAnalytics';
import DohAnalytics from '@inpatient/components/admissions/partials/DohAnalytics';
import PulseAnalytics from '@inpatient/components/admissions/partials/PulseAnalytics';
import InpatientCheckinElsewhere from '@inpatient/components/admissions/partials/InpatientCheckinElsewhere.vue';
import PatientVitalsForm from '@inpatient/components/admissions/partials/PatientVitalsForm.vue';
import ValidateVitalsForm  from '@inpatient/components/admissions/partials/ValidateVitalsForm';
import ExemptInvoice from '@inpatient/components/chargesheet/ExemptInvoice';
import CreditNote from '@inpatient/components/chargesheet/CreditNote';


import InpatientPatientDischarges from '@inpatient/components/discharges/Index';

import InpatientBillBreakdown from '@inpatient/components/chargesheet/AddBillChargeBreakDown';
import SystemDashbaordIndex from '@core/components/dashboard/Index.vue';
import AdmissionCreate from "@inpatient/components/morgue/admissions/Create"
import MorgueDispatch from "@inpatient/components/morgue/Dispatch"
import MorgueFridgeSetup from "@inpatient/components/morgue/setup/Fridges"
import MorguePatientDipatches from '@inpatient/components/morgue/dispatches/Index';

/*
 * Admission Requests
 */
Vue.component('inpatient-admission-requests-index', InpatientAdmissionsRequestIndex);
Vue.component('morgue-admission-create', AdmissionCreate);
Vue.component('morgue-admission-requests-index', MorgueAdmissionsRequestIndex);
Vue.component('morgue-setup-fridges', MorgueFridgeSetup);
Vue.component('morgue-dispatch', MorgueDispatch);
Vue.component('morgue-dispatches', MorguePatientDipatches);
Vue.component('inpatient-admission-requests-create', InpatientAdmissionsRequestCreate );
Vue.component('inpatient-admission-requests-create-modal', InpatientAdmissionsRequestCreateModal);
Vue.component('system-dashboard-view', SystemDashbaordIndex);

/**
 * Evaluation Section:
 *
 * procedures & investigations
 */
Vue.component('inpatient-procedures-form', InpatientProceduresForm);
Vue.component('inpatient-procedures-table', InpatientProceduresTable);

Vue.component('inpatient-investigations-form', InpatientInvestigationsForm);
Vue.component('inpatient-investigations-table', InpatientInvestigationsTable);

/**
 * chargesheet  & Editing
 */
Vue.component('inpatient-chargesheet-edit', InpatientChargesheetEdit);
Vue.component('inpatient-daily-chargesheet-edit', InpatientDailyChargesheetEdit);
Vue.component('inpatient-verify-days-charges', InpatientVerifyDaysCharges);

/*
* add rebate
* */
Vue.component('inpatient-add-rebate', InpatientAddRebate);

/**
 * pending procedures and approvals
 */
Vue.component('inpatient-pending-procedures-index', InpatientPendingProcedures);

/**
 * prescriptions - administer
 */
Vue.component('inpatient-prescriptions-administer-drugs', InpatientPrescriptionsAdministerDrugs);

Vue.component('doctor-notes-view-logs',DoctorNotesViewLogs);
Vue.component('nurse-notes-view-logs',NurseNotesViewLogs);
Vue.component('prescriptions-view-logs',PrescriptionsViewLogs);
Vue.component('investigation-result-view-logs',InvestigationResultViewLogs);
Vue.component('inpatient-history-view-logs',InpatientHistoryViewLogs);


/*
* admissions
 */
Vue.component('inpatient-admissions-index', InpatientAdmissionsIndex);
Vue.component('morgue-admissions-index', MorgueAdmissionsIndex);
Vue.component('inpatient-admissions-create', InpatientAdmissionsCreate);
Vue.component('inpatient-evaluation-navigation', InpatientEvaluationNavigation);

/*
* consumables
* */
Vue.component('inpatient-consumables-create', InpatientConsumablesCreate);
Vue.component('theatre-consumable-form', TheatreConsumableForm);

Vue.component('inpatient-consumables-index', InpatientConsumablesIndex);

/*
* graphs
 * */
Vue.component('patients-per-ward', InpatientPatientsPerWard);

/**
 * discharges
 */
Vue.component('patients-discharged', InpatientPatientDischarges);
/*
* bill breakdown
* */
Vue.component('inpatient-bill-breakdown', InpatientBillBreakdown);
/**
 * Summary of labour form
 */
Vue.component('summary-of-labour', SummaryofLabour);
Vue.component('partograph-analytics', PartographAnalytics);
Vue.component('doh-analytics', DohAnalytics);
Vue.component('pulse-analytics', PulseAnalytics);
Vue.component('inpatient-checkin-elsewhere', InpatientCheckinElsewhere);

/*
* patient vitals form
 * */
Vue.component('patient-vitals-form',PatientVitalsForm);
Vue.component('validate-vitals-form',ValidateVitalsForm)
Vue.component('exempt-invoice',ExemptInvoice);
Vue.component('credit-note',CreditNote);
Vue.component('receive-sample-modal',ReceiveSampleModal);



/*
report on labor form
*/
Vue.component('report-on-labor-form',ReportOnLaborForm);
