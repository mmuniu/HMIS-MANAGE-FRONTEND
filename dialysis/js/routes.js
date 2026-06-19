/*
 * Assessment
 */
import MachineAssessment from "./components/assessment/MachineAssessment";
import VascularAssessment from "./components/assessment/VascularAssessment";
import PatientAssessment from "./components/assessment/PatientAssessment";

import Monitoring from "./components/evaluation/monitoring/MonitoringTable";
import Prescription from "./components/evaluation/prescriptions/PrescriptionsMain";
import Procedures from "./components/evaluation/procedures/ProceduresMain";
import Investigations from "./components/evaluation/investigations/InvestigationsMain";
import ChargeSheet from "./components/evaluation/charges/ChargesMain";
import Consumables from "./components/evaluation/consumables/ConsumablesMain";
import Notes from "./components/evaluation/notes/NotesMain";
import DoctorNotes from "./components/evaluation/doctorsnotes/DoctorsNotesMain";


const assess = "/dialysis/session/:sessionId/assess";
const evaluate = "/dialysis/visit/:visitId/evaluate";

export const dialysis = [

    /*
     * Assessment routes
     */
    { path: `${assess}/machine`, component: MachineAssessment },

    { path: `${assess}/vascular`, component: VascularAssessment },

    { path: `${assess}/patient`, component: PatientAssessment },

    // { path: `${assess}/heparinization`, component: HeparinizationAssessment },

    /*
     * Evaluation Routes
     */
    { path: `${evaluate}/monitoring`, component: Monitoring },

    { path: `${evaluate}/prescriptions`, component: Prescription },

    { path: `${evaluate}/procedures`, component: Procedures },

    { path: `${evaluate}/investigations`, component: Investigations },

    { path: `${evaluate}/consumables`, component: Consumables },

    { path: `${evaluate}/post-dialysis-notes`, component: Notes },

    { path: `${evaluate}/doctors-notes`, component: DoctorNotes },


    { path: `${evaluate}/charge-sheet`, component: ChargeSheet },

];
