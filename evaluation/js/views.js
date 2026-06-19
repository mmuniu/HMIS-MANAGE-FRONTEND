import Vue from 'vue';
import Evaluation from '@evaluation/components/evaluation/Evaluate';
import Prescribe from '@evaluation/components/Prescribe';
import TheatrePrescribe from '@evaluation/components/TheatrePrescribe';
import Procedures from '@evaluation/components/evaluation/actions/partials/procedures/Procedure';
import ProcedureRequests from '@evaluation/components/evaluation/actions/partials/procedures/OrderProcedures';
import OrderProcedures from '@evaluation/components/evaluation/actions/partials/procedures/OrderProcedures';
import TheatreOrderProcedures from '@evaluation/components/evaluation/actions/partials/procedures/TheatreOrderProcedures';
import CustomerFacingPos from '@evaluation/components/group-pos/CustomerFacingPos.vue';

import OrderedProcedures from '@evaluation/components/evaluation/actions/partials/procedures/OrderedProcedures';
import ProcedureApprovals from '@evaluation/components/approvals/Index';
import ProcedureSearch from '@evaluation/components/procedures/ProcedureSearch';
import ParentProcedureSearch from '@evaluation/components/procedures/ParentProcedureSearch';

import DiseaseSearch from '@evaluation/components/procedures/DiseaseSearch';
import ResultAnalyticsGroups from '@evaluation/components/setup/procedures/ResultAnalyticsGroups';
import Icd10Search from '@evaluation/components/evaluation/actions/partials/Icd10Search';
import Prescriptions from '@evaluation/components/prescriptions/Index';
import OwnPrescriptions from '@evaluation/components/own-prescriptions/Index';
import QueueLocations from '@evaluation/components/queue/Locations';
import QuickAccess from '@evaluation/components/queue/QuickAccess';
import SelectOperatingStore from '@evaluation/components/queue/SelectOperatingStore';
import QueueCheckout from '@evaluation/components/queue/Checkout';
import EvaluationSpeech from '@evaluation/components/evaluation/Speech';
import PatientMeta from '@evaluation/components/evaluation/actions/partials/PatientMeta';
import Icd10 from '@evaluation/components/evaluation/actions/Icd10';
import Register_705 from '@evaluation/components/evaluation/actions/Register_705';
import ProcedureCategories from '@evaluation/components/setup/procedures/Categories';
import PatientInformation from '@evaluation/components/PatientInformation';
import PatientHistory from '@evaluation/components/evaluation/actions/History';
import OcularHistory from '@evaluation/components/evaluation/actions/OcularHistory.vue';
import ProceduresIndex from '@evaluation/components/procedures/Index';
import ProceduresCreate from '@evaluation/components/procedures/Create';
import ProcedureTagCreate from '@evaluation/components/procedures/partials/ProcedureTag';
import ProceduresEdit from '@evaluation/components/procedures/Edit';
import ProcedureUpdatePrices from '@evaluation/components/procedures/partials/ProcedurePricesUpdateDialog';
import LabCategoriesIndex from '@evaluation/components/setup/lab_test_categories/Index';
import LabCategoriesCreate from '@evaluation/components/setup/lab_test_categories/Create';
import LabCategoriesEdit from '@evaluation/components/setup/lab_test_categories/Edit';
import LabTestUnitsIndex from '@evaluation/components/setup/lab_test_units/Index';
import LabTestUnitsCreate from '@evaluation/components/setup/lab_test_units/Create';
import LabTestUnitsEdit from '@evaluation/components/setup/lab_test_units/Edit';
import LabTestAdditivesIndex from '@evaluation/components/setup/lab_test_additives/Index';
import LabTestAdditivesCreate from '@evaluation/components/setup/lab_test_additives/Create';
import LabTestAdditivesEdit from '@evaluation/components/setup/lab_test_additives/Edit';
import AgeGroups from '@evaluation/components/setup/age_groups/Index';
import ReferenceRangesIndex from '@evaluation/components/setup/reference_ranges/Index';
import ReferenceRangesCreate from '@evaluation/components/setup/reference_ranges/Create';
import ReferenceRangesEdit from '@evaluation/components/setup/reference_ranges/Edit';
import TestRemarksIndex from '@evaluation/components/setup/test_remarks/Index';
import TestRemarksCreate from '@evaluation/components/setup/test_remarks/Create';
import TestRemarksEdit from '@evaluation/components/setup/test_remarks/Edit';
import MachinesCreate from '@evaluation/components/setup/machines/Create';
import MachinesEdit from '@evaluation/components/setup/machines/Edit';
import MachineCodeMappingsIndex from '@evaluation/components/setup/map_machine_codes/Index';
import OrderedInvestigations from '@evaluation/components/evaluation/actions/OrderedInvestigations';
import PublishedInvestigations from '@evaluation/components/evaluation/actions/PublishedInvestigations';
import MachineResults from '@evaluation/components/evaluation/actions/MachineResults';
import WalkinPosIndex from '@evaluation/components/walkin/Index';
import EvaluationGroupPosCreate from '@evaluation/components/group-pos/Create';
import EvaluationGroupCustomPosCreate from '@evaluation/components/group-pos/CustomCreate';
import POSProcedureSearch from '@evaluation/components/procedures/PosProcedureSearch';
import DeliveriesPrepare from '@evaluation/components/deliveries/Prepare';
import DeliveriesQueued from '@evaluation/components/deliveries/Queued';
import SampleCollection from '@evaluation/components/evaluation/SampleCollection';
import SampleCollectionRequests from '@evaluation/components/evaluation/SampleCollectionRequests';
import SampleCollectionRequestsDialog from '@evaluation/components/evaluation/RequestSampleDialog';
import EvaluationTreament from '@evaluation/components/evaluation/actions/Treatment';
import TheatreTreatment from '@evaluation/components/evaluation/actions/TheatreTreatment';
import Investigations from '@evaluation/components/evaluation/actions/Investigations';
import TheatreInvestigations from '@evaluation/components/evaluation/actions/TheatreInvestigations';
import PatientVisitsGraph from '@evaluation/components/graphs/visits/Index';
import InvoicesGeneratedGraph from '@evaluation/components/graphs/invoices/Index';
import VisitsTrendGraph from '@evaluation/components/graphs/visits/VisitTrend';
import EvaluationVisitsTrendWidget from '@evaluation/components/widgets/VisitTrend.vue';
import SelfQuarantineIndex from '@evaluation/components/self-quarantine/Index.vue';
import SelfQuarantineCreate from '@evaluation/components/self-quarantine/Create.vue';
import SelfQuarantineDischarge from '@evaluation/components/self-quarantine/Discharge.vue';
import PatientVitalsAnalysis from '@evaluation/components/VitalsAnalysis.vue';
import EditPrescriptions from '@evaluation/components/prescriptions/Edit';
// import RefractionBase from '@evaluation/components/evaluation/actions/RefractionBase';
 import RefractionBase from "./components/evaluation/actions/partials/RefractionBase.vue";

import EditPrescriptionsDialog from '@evaluation/components/prescriptions/Edit';
import TBandMalaria from './components/evaluation/actions/partials/notes/TBandMalaria.vue';
import AdministerDrugsModal from './components/prescriptions/AdministerDrugsModal.vue';
import CriticalValuesForm from '@evaluation/components/evaluation/CriticalValues.vue';
/*
 * Evaluation process
 */

Vue.component('patient-evaluation', Evaluation);
Vue.component('prescribe-drugs', Prescribe);
Vue.component('theatre-prescribe-drugs',TheatrePrescribe);
Vue.component('evaluation-procedures', Procedures);
Vue.component('evaluation-procedure-requests', ProcedureRequests);
Vue.component('order-procedures', OrderProcedures);
Vue.component('theatre-order-procedures', TheatreOrderProcedures);
Vue.component('customer-facing-pos', CustomerFacingPos);
Vue.component('ordered-procedures', OrderedProcedures);
Vue.component('evaluation-procedure-approvals', ProcedureApprovals);
Vue.component('evaluation-procedure-search', ProcedureSearch);
Vue.component('evaluation-parent-procedure-search', ParentProcedureSearch);

Vue.component('evaluation-disease-search', DiseaseSearch);
Vue.component('evaluation-result-analytics-groups', ResultAnalyticsGroups);
Vue.component('evaluation-icd10-search', Icd10Search);
Vue.component('evaluation-prescriptions-index', Prescriptions);
Vue.component('evaluation-own-prescriptions-index', OwnPrescriptions);

Vue.component('evaluation-queue-locations', QueueLocations);

Vue.component('evaluation-quick-queue-access', QuickAccess);
Vue.component('evaluation-select-operating-store', SelectOperatingStore);
Vue.component('evaluation-queue-checkout', QueueCheckout);
Vue.component('evaluation-speech', EvaluationSpeech);
Vue.component('patient-meta', PatientMeta);
Vue.component('icd10', Icd10);
Vue.component('register_705', Register_705);
Vue.component('evaluation-setup-procedure-categories', ProcedureCategories);
Vue.component('evaluation-patient-information', PatientInformation);
Vue.component('evaluation-patient-history', PatientHistory);
Vue.component('evaluation-optical-history',OcularHistory);
Vue.component('evaluation-ordered-investigations', OrderedInvestigations);
Vue.component('evaluation-published-investigations', PublishedInvestigations);
Vue.component('evaluation-machine-results', MachineResults);
Vue.component('evaluation-walkin-pos', WalkinPosIndex);
Vue.component('evaluation-group-pos-create',EvaluationGroupPosCreate);
Vue.component('evaluation-group-custom-pos-create',EvaluationGroupCustomPosCreate);
Vue.component('critical-values-form',CriticalValuesForm)

Vue.component('evaluation-deliveries-prepare', DeliveriesPrepare);
Vue.component('evaluation-deliveries-queued', DeliveriesQueued);
Vue.component('evaluation-sample-collection', SampleCollection);
Vue.component('evaluation-sample-collection-requests', SampleCollectionRequests);
Vue.component('evaluation-sample-collection-request-dialog', SampleCollectionRequestsDialog);
Vue.component('visit-evaluations-treatment', EvaluationTreament);
Vue.component('theatre-evaluations-treatment', TheatreTreatment);
Vue.component('visit-evaluations-investigations', Investigations);
Vue.component('theatre-evaluations-investigations', TheatreInvestigations);

Vue.component('pos-procedure-search', POSProcedureSearch);
Vue.component('evaluation-tb-and-malaria', TBandMalaria);


// setup
Vue.component('evaluation-procedures-index', ProceduresIndex);
Vue.component('evaluation-procedures-create', ProceduresCreate);
Vue.component('evaluation-procedures-tag-create', ProcedureTagCreate);
Vue.component('evaluation-procedures-edit', ProceduresEdit);
Vue.component('evaluation-procedures-update-prices', ProcedureUpdatePrices);
Vue.component('evaluation-lab-test-categories-index', LabCategoriesIndex);
Vue.component('evaluation-lab-test-categories-create', LabCategoriesCreate);
Vue.component('evaluation-lab-test-categories-edit', LabCategoriesEdit);
Vue.component('evaluation-lab-test-units-index', LabTestUnitsIndex);
Vue.component('evaluation-lab-test-units-create', LabTestUnitsCreate);
Vue.component('evaluation-lab-test-units-edit', LabTestUnitsEdit);
Vue.component('evaluation-lab-test-additives-index', LabTestAdditivesIndex);
Vue.component('evaluation-lab-test-additives-create', LabTestAdditivesCreate);
Vue.component('evaluation-lab-test-additives-edit', LabTestAdditivesEdit);
Vue.component('evaluation-age-groups-index', AgeGroups);
Vue.component('evaluation-reference-ranges-index', ReferenceRangesIndex);
Vue.component('evaluation-reference-ranges-create', ReferenceRangesCreate);
Vue.component('evaluation-reference-ranges-edit', ReferenceRangesEdit);
Vue.component('evaluation-test-remarks-index', TestRemarksIndex);
Vue.component('evaluation-test-remarks-create', TestRemarksCreate);
Vue.component('evaluation-test-remarks-edit', TestRemarksEdit);
Vue.component('evaluation-setup-machines-create', MachinesCreate);
Vue.component('evaluation-setup-machines-edit', MachinesEdit);
Vue.component('evaluation-setup-machine-code-mappings-index', MachineCodeMappingsIndex );
Vue.component('evaluation-edit-prescriptions', EditPrescriptions);
Vue.component('evaluation-edit-prescriptions-dialog', EditPrescriptionsDialog);


// graphs
Vue.component('patients-visits', PatientVisitsGraph);
Vue.component('invoices-generated', InvoicesGeneratedGraph);
Vue.component('evaluation-visits-trend', VisitsTrendGraph);

// widgets
Vue.component('evaluation-visits-trend-widget', EvaluationVisitsTrendWidget);


// self - quarantine
Vue.component('evaluation-self-quarantine-index', SelfQuarantineIndex);
Vue.component('evaluation-self-quarantine-create', SelfQuarantineCreate);
Vue.component('evaluation-self-quarantine-discharge', SelfQuarantineDischarge);
Vue.component('evaluation-patient-vitals-analysis', PatientVitalsAnalysis);


// administer drugs modal
Vue.component('administer-drugs-modal', AdministerDrugsModal);
Vue.component('refraction-base', RefractionBase);
