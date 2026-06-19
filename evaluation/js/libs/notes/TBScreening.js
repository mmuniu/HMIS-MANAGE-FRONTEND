import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./TBScreeningRepository";

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

        // console.log(data);


        this.form.submit("post", "/api/evaluation/tb/screening", data).then((response) => {
            // this.setFields(fields);

            console.log(response);

            flash(response);
        });
    }

    /*
     * Update the prescriptions that were given
     */
    // update(prescriptionId, providedData = null) {
    //     const data = providedData ? providedData : this.getFieldsExcept(["form"]);

    //     this.form.submit("patch", `/api/evaluation/prescriptions/${prescriptionId}`, data).then((response) => {
    //         flash(response);
    //     });
    // }

    /*
    * print prescriptions
    * */
    // print(visitId, paper, selectedPrescriptions) {
    //     let url = "?prescriptions=";

    //     _.each(selectedPrescriptions, function(prescription_id) {
    //         url += prescription_id + "-";
    //     });

    //     window.open("/evaluation/print/prescription/" + visitId + "/" + paper + url, "_blank");
    // }

    /**
     * save prescription prices edit
     * @param prescriptionId
     * @param data
     */
    // async savePresPriceEdits (prescriptionId, data) {
    //     const resp = await this.form.submit("post", "/api/evaluation/prescriptions/" + prescriptionId + "/edit-prices", data);

    //     if(resp) {
    //         flash(resp);

    //         return resp;
    //     }
    // }
}
