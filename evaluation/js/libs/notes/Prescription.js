import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./PrescriptionRepository";
import axios from "axios";

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

    

    fetchCancelledPrescriptions(value){
        const originalData = { 
            visit_id: value 
        };

        return this.form.submit("post", "/api/evaluation/fetch-cancelled-prescriptions", originalData)
        .then((response) => {
            return response;
        })
        .catch((error) => {
            console.error("Error fetching cancelled prescriptions:", error);
            throw error;
        });
    }
    fetchOwnPrescriptions(value) {
        const originalData = { 
            visit_id: value 
        };

        return this.form.submit("post", "/api/evaluation/fetch-own-prescriptions", originalData)
        .then((response) => {
            return response;
        })
        .catch((error) => {
            console.error("Error fetching own prescriptions:", error);
            throw error;
        });
    }

      setreturnPrescriptionPending(data) {
      
        return this.form.submit("post", "/api/evaluation/return-prescription-pending", data)
        .then((response) => {
            flash(response);
            return response;

        })
        .catch((error) => {
            console.error("Error returning prescriptions:", error);
            throw error;
        });
    }

    fetchReturnStatus(data) {
        const originalData = { 
            prescription_id: data
        };
    
        return this.form
            .submit("post", "/api/evaluation/fetch-return-status", originalData)
            .then((response) => {

                const originalData = response.data?.original?.data;

                if (originalData) {
                    console.log("Return status:", originalData);
                    return originalData; // Return the extracted data
                } else {
                    console.warn("No return status found in the response.");
                    return null; // Or handle as needed
                }
            })
            
            .catch((error) => {
                console.error("Error fetching return status:", error);
                throw error; // Propagate the error
            });
    }
    

    updateReturnPrescription(data) {
      
        return this.form.submit("post", "/api/evaluation/update-return-status", data)
        .then((response) => {
             flash(response);
             return response;
        })
        .catch((error) => {
            console.error("Error returning prescriptions:", error);
            throw error;
        });
    }

    
    
     /*
     * Save own patient's vitals into the database
     */
   /*
 * Save own patient's prescriptions into the database
 */
   async saveOwnPrescription() {
    const data = this.getFieldsExcept(["form"]);
    
    // Remove 'own_' prefix from keys
    const originalData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key.replace(/^own_/, ''), value])
    );

    // Await the form submission to ensure modal closes only after response
    const response = await this.form.submit("post", "/api/evaluation/store-own-prescriptions", originalData);
    
    // Flash success message if no validation errors
    flash(response);
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
