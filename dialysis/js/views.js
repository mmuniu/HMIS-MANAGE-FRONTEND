
import Vue from "vue";
import PlantsIndex from "@dialysis/components/plants/Index";
import PlantsCreate from "@dialysis/components/plants/Create";
import PlantsEdit from "@dialysis/components/plants/Edit";
import WardTypesIndex from "@dialysis/components/ward_types/Index";
import WardTypesCreate from "@dialysis/components/ward_types/Create";
import WardTypesEdit from "@dialysis/components/ward_types/Edit";
import WardsIndex from "@dialysis/components/wards/Index";
import WardsCreate from "@dialysis/components/wards/Create";
import WardsEdit from "@dialysis/components/wards/Edit";
import MachinesIndex from "@dialysis/components/machines/Index";
import MachinesCreate from "@dialysis/components/machines/Create";
import MachinesEdit from "@dialysis/components/machines/Edit";
import ChairsIndex from "@dialysis/components/chairs/Index";
import ChairsCreate from "@dialysis/components/chairs/Create";
import ChairsEdit from "@dialysis/components/chairs/Edit";
import RenalDialysis from "@dialysis/components/RenalDiagnosis";
import SessionsIndex from "@dialysis/components/sessions/Index";
import SessionsCreate from "@dialysis/components/sessions/Create";
import Assessment from "@dialysis/components/assessment/Assess";
import DialysisPatients from "@dialysis/components/patients/Index";
import SchedulesIndex from "@dialysis/components/schedules/Index";
import SchedulesCreate from "@dialysis/components/schedules/Create";
import DialysisEvaluation from "@dialysis/components/evaluation/Evaluate";
import PrescriptionForm from "@dialysis/components/evaluation/prescriptions/PrescriptionsForm";
import PrescriptionTable from "@dialysis/components/evaluation/prescriptions/PrescriptionsTable";

/*
 * Dialysis plants
 */
Vue.component("dialysis-plants-index", PlantsIndex);
Vue.component("dialysis-plants-create", PlantsCreate);
Vue.component("dialysis-plants-edit", PlantsEdit);

/*
 * Dialysis ward types
 */
Vue.component("dialysis-ward-types-index", WardTypesIndex);
Vue.component("dialysis-ward-types-create", WardTypesCreate);
Vue.component("dialysis-ward-types-edit", WardTypesEdit);


/*
 * Dialysis wards
 */
Vue.component("dialysis-wards-index", WardsIndex);
Vue.component("dialysis-wards-create", WardsCreate);
Vue.component("dialysis-wards-edit", WardsEdit);


/*
 * Dialysis machines
 */
Vue.component("dialysis-machines-index", MachinesIndex);
Vue.component("dialysis-machines-create", MachinesCreate);
Vue.component("dialysis-machines-edit", MachinesEdit);


/*
 * Dialysis chairs
 */
Vue.component("dialysis-chairs-index", ChairsIndex);
Vue.component("dialysis-chairs-create", ChairsCreate);
Vue.component("dialysis-chairs-edit", ChairsEdit);

/*
 * Dialysis diagnosis
 */
Vue.component("renal-diagnosis", RenalDialysis);

/*
 * Dialysis visits
 */
Vue.component("dialysis-sessions-index", SessionsIndex);
Vue.component("dialysis-sessions-create", SessionsCreate);

/*
 * Dialysis assessment
 */
Vue.component("dialysis-assessment", Assessment);

/*
 * Dialysis patients
 */
Vue.component("dialysis-patients-index", DialysisPatients);

/*
 * Dialysis schedules
 */
Vue.component("dialysis-schedules-index", SchedulesIndex);
Vue.component("dialysis-schedules-create", SchedulesCreate);

/*
 * EValuation process
 */
Vue.component("dialysis-evaluation", DialysisEvaluation);

/* Prescriptions */
Vue.component("dialysis-prescriptions-form", PrescriptionForm);

Vue.component("dialysis-prescriptions-table", PrescriptionTable);
                                                                                                                                                                           