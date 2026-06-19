import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./DispatchRepository.js";
import { _ } from "vue-underscore";

export default class Store extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Save the record
     */
    save() {
        const data = this.getFields();


        data.name_of_motician = data.dispatched_by;
        console.log(data);
        return fetch('/api/morgue/dispatch/body/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // You can add additional headers if needed
          },
          body: JSON.stringify({
            data: data // Include the selected item IDs in the body
          }),
            })
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.json(); // Parse the JSON response
            })
            .then(data => {
              // Handle the response data
              console.log(data);
              flash(data);
            })
            .catch(error => {
              // Handle errors
              console.error('There was a problem with the fetch operation:', error);
            });



    }

    /*
     * Save the record
     */
    async update(id, providedData = null) {
        const data = providedData ? providedData : this.getFields();

        const response = await this.form.submit("patch", route("api.evaluation.consumable-update", id), data);

        flash(response);

        return response;
    }

    /*
     * Save the record
     */
    cancelConsumable(data) {
        return this.form.submit("patch", route("api.evaluation.consumable-cancel", data.id), data).then((response) => {
            flash(response);
        });
    }

    /*
    * get payment mode
    * */
    // async getPaymentMode(visitId) {
    //     const response = await this.form.submit("get", `/api/reception/visit/${visitId}`);

    //     if (response) {
    //         console.log(response);
    //     }
    // }
}
