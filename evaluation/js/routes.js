import Notes from "./components/evaluation/actions/Notes";
import Vitals from "./components/evaluation/actions/Vitals";
import PreliminaryExam from "./components/evaluation/actions/PreliminaryExam";
import Wellness from "./components/evaluation/actions/Wellness";
import Treatment from "./components/evaluation/actions/Treatment";
import OrderedDrugs from "./components/evaluation/actions/OrderedDrugs";
import Dispensed from "./components/evaluation/actions/Dispensed";
import Investigations from "./components/evaluation/actions/Investigations";
import History from "./components/evaluation/actions/History";
import OcularHistory from "./components/evaluation/actions/OcularHistory.vue";
import Documents from "./components/evaluation/actions/Documents";
import Consumables from "./components/evaluation/actions/Consumables";
import OldSystemHistory from "./components/evaluation/actions/OldSystemHistory";
import Dosh from "./components/evaluation/actions/Dosh";
import SystemsReview from "./components/evaluation/actions/SystemsReview";
import ExaminationsReview from "./components/evaluation/actions/ExaminationReview";
import Refraction from "./components/evaluation/actions/Refraction";
import OpticalDispensing from "./components/evaluation/actions/OpticalDispensing";

import AwaitingOptical from "./components/evaluation/actions/AwaitingOptical";

import OphthalmologistNotes from "./components/evaluation/actions/OphthalmologistNotes";
import MalariaandTB from "./components/evaluation/actions/Screening";
// import RefractionBase from "./components/evaluation/actions/partials/RefractionBase.vue";

/*
* laboratory
* */
import OrderNew from "./components/evaluation/actions/OrderNewInvestigation";
import MachineResults from "./components/evaluation/actions/MachineResults";
import OrderedInvestigations from "./components/evaluation/actions/OrderedInvestigations";
import UnApprovedInvestigations from "./components/evaluation/actions/UnApprovedInvestigations";
import ApprovedInvestigations from "./components/evaluation/actions/ApprovedInvestigations";
import PublishedInvestigations from "./components/evaluation/actions/PublishedInvestigations";
import RetractedInvestigations from "./components/evaluation/actions/RetractedInvestigations";
import InvestigationResultsAnalytics from "./components/evaluation/actions/InvestigationsResultsAnalytics";

import PendingApprovals from "./components/approvals/Pending";
import ApprovedApprovals from "./components/approvals/Approved";
import RejectedApprovals from "./components/approvals/Rejected";

const evaluate = "/evaluation/visit/:visitId/destination/:destination/";
let approval = route("evaluation.approvals.index", ":key").relative(true);
approval = approval.replace(":key", "");

export const evaluation = [

    { path: `${evaluate}notes`, component: Notes },

    { path: `${evaluate}vitals`, component: Vitals },
    { path: `${evaluate}preliminary-exam`, component: PreliminaryExam },


    { path: `${evaluate}wellness`, component: Wellness },

    { path: `${evaluate}dosh`, component: Dosh },

    { path: `${evaluate}systems-review`, component: SystemsReview },

    { path: `${evaluate}examinations-review`, component: ExaminationsReview },

    { path: `${evaluate}treatment`, component: Treatment },

    { path: `${evaluate}investigations`, component: Investigations },

    { path: `${evaluate}ordered-drugs`, component: OrderedDrugs },

    { path: `${evaluate}dispensed`, component: Dispensed },

    { path: `${evaluate}history`, component: History },
    { path: `${evaluate}ocular-history`, component: OcularHistory },
    { path: `${evaluate}documents`, component: Documents },
    { path: `${evaluate}consumables`, component: Consumables },

    { path: `${evaluate}old-system-history`, component: OldSystemHistory },

    { path: `${evaluate}refraction`, component: Refraction },
    { path: `${evaluate}optical-dispensing`, component: OpticalDispensing },

        { path: `${evaluate}awaiting-optical`, component: AwaitingOptical },

    { path: `${evaluate}ophthalmologist_notes`, component: OphthalmologistNotes },

    { path: `${evaluate}malariaandTB`, component: MalariaandTB },

    // laboratory
    { path: `${evaluate}order-new`, component: OrderNew },
    { path: `${evaluate}machine-results`, component: MachineResults },
    { path: `${evaluate}ordered-investigations`, component: OrderedInvestigations },
    { path: `${evaluate}un-approved-investigations`, component: UnApprovedInvestigations },
    { path: `${evaluate}approved-investigations`, component: ApprovedInvestigations },
    { path: `${evaluate}published-investigations`, component: PublishedInvestigations },
    { path: `${evaluate}retracted-investigations`, component: RetractedInvestigations },
    { path: `${evaluate}investigation-results-analytics`, component: InvestigationResultsAnalytics },

    { path: `${approval}pending`, component: PendingApprovals },

    { path: `${approval}approved`, component: ApprovedApprovals },

    { path: `${approval}rejected`, component: RejectedApprovals },

];
