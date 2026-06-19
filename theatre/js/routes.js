
import PreOpNotes from "@theatre/components/evaluate/actions/PreOpNotes";
import Consumables from "@theatre/components/evaluate/actions/Consumables";
import Anaesthetics from "@theatre/components/evaluate/actions/Anaesthetics";
import Drugs from "@theatre/components/evaluate/actions/Drugs";
import PostOpNotes from "@theatre/components/evaluate/actions/PostOpNotes";
import Chargesheet from "@theatre/components/evaluate/actions/Chargesheet";

const theatre_operation = `/theatre/operation/:operationId/`;

export const theatre = [
    { path: `${theatre_operation}pre-op-notes`, component: PreOpNotes },
    { path: `${theatre_operation}drugs`, component: Drugs },
    { path: `${theatre_operation}anaesthetics`, component: Anaesthetics },
    { path: `${theatre_operation}consumables`, component: Consumables },
    { path: `${theatre_operation}post-op-notes`, component: PostOpNotes },
    { path: `${theatre_operation}charges`, component: Chargesheet },
];
