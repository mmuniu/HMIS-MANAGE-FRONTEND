import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./PrescriptionRepository";

export default class Prescription extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Save patient vitals into the database
     */
    save() {
        const data = this.getFieldsExcept(["form"]);

        this.form.submit("post", "/api/evaluation/prescriptions", data).then((response) => {
            // this.setFields(fields);

            flash(response);
        });
    }

     /*
     * Save own patient's vitals into the database
     */
     saveOwnPrescription() {
        const data = this.getFieldsExcept(["form"]);
    
        // Remove 'own_' prefix from keys
        const originalData = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key.replace(/^own_/, ''), value])
        );
    
        this.form.submit("post", "/api/evaluation/store-own-prescriptions", originalData).then((response) => {
            // this.setFields(fields);
    
            flash(response);
        });
    }
    
    /*
     * Save prescriptions into the database
     */
    saveTheatrePrescriptions() {
        const data = this.getFieldsExcept(["form"]);
        this.form.submit("post", `/theatre/operation/${data.operation_id}/drugs`, data).then((response) => {
            // this.setFields(fields);

            flash(response);
        });
    }

    /*
     * Update the prescriptions that were given
     */
    update(prescriptionId, providedData = null) {
        const data = providedData ? providedData : this.getFieldsExcept(["form"]);

        this.form.submit("patch", `/api/evaluation/prescriptions/${prescriptionId}`, data).then((response) => {
            flash(response);
        });
    }

    /*
    * print prescriptions
    * */
    print(visitId, paper, selectedPrescriptions,administered=null) {
        let url = "?prescriptions=";

        _.each(selectedPrescriptions, function(prescription_id) {
            url += prescription_id + "-";
        });
        if(administered == 'administered'){
            window.open("/inpatient/evaluations/" + visitId + "/prescriptions/print");
        }else{

            window.open("/evaluation/print/prescription/" + visitId + "/" + paper + url, "_blank");

        }

    }

    /**
     * save prescription prices edit
     * @param prescriptionId
     * @param data
     */
    async savePresPriceEdits (prescriptionId, data) {
        const resp = await this.form.submit("post", "/api/evaluation/prescriptions/" + prescriptionId + "/edit-prices", data);

        if(resp) {
            flash(resp);

            return resp;
        }
    }
}
