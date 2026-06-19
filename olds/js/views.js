
import Vue from 'vue';
import InpatientAdmissionsRequestIndex from '@inpatient/components/admission-requests/Index';
import InpatientAdmissionsRequestCreate from '@inpatient/components/admission-requests/Create';
import InpatientAdmissionsRequestCreateModal from '@inpatient/components/admission-requests/CreateModal';
import InpatientProceduresForm from '@inpatient/components/evaluation/procedures/ProceduresForm';
import InpatientProceduresTable from '@inpatient/components/evaluation/procedures/ProceduresTable';
import InpatientInvestigationsForm from '@inpatient/components/evaluation/investigations/InvestigationsForm';
import InpatientInvestigationsTable from '@inpatient/components/evaluation/investigations/InvestigationsTable';
import InpatientChargesheetEdit from '@inpatient/components/chargesheet/Edit';
import InpatientDailyChargesheetEdit from '@inpatient/components/chargesheet/EditDailyChargeSheet';
import InpatientVerifyDaysCharges from '@inpatient/components/chargesheet/VerifyDaysCharges';
import InpatientAddRebate from '@inpatient/components/chargesheet/AddRebate';
import InpatientPendingProcedures from '@inpatient/components/pending-procedures/Index';
import InpatientPrescriptionsAdministerDrugs from '@inpatient/components/evaluation/prescriptions/AdministerDrugs';
import InpatientAdmissionsIndex from '@inpatient/components/admissions/Index';
import InpatientAdmissionsCreate from '@inpatient/components/admissions/Create';
import InpatientEvaluationNavigation from '@inpatient/components/admissions/partials/Navigation';
import InpatientConsumablesCreate from '@inpatient/components/evaluation/consumables/Create';
import InpatientConsumablesIndex from '@inpatient/components/evaluation/consumables/Index';
import InpatientPatientsPerWard from '@inpatient/components/graphs/patients_wards/Index';
import InpatientPatientDischarges from '@inpatient/components/discharges/Index';
import InpatientBillBreakdown from '@inpatient/components/chargesheet/AddBillChargeBreakDown';

/*
 * Admission Requests
 */
Vue.component('inpatient-admission-requests-index', InpatientAdmissionsRequestIndex);
Vue.component('inpatient-admission-requests-create', InpatientAdmissionsRequestCreate );
Vue.component('inpatient-admission-requests-create-modal', InpatientAdmissionsRequestCreateModal);

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

/*
* admissions
 */
Vue.component('inpatient-admissions-index', InpatientAdmissionsIndex);
Vue.component('inpatient-admissions-create', InpatientAdmissionsCreate);
Vue.component('inpatient-evaluation-navigation', InpatientEvaluationNavigation);

/*
* consumables
* */
Vue.component('inpatient-consumables-create', InpatientConsumablesCreate);
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
