import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./VitalRepository";
import { _ } from "vue-underscore";

export default class Vital extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Save patient vitals into the database
     */
    async save(visitId) {

      // const response_presenting =  await this.form.submit('get', route('api.evaluation.presenting_complaints.temp', visitId));

      // flash(response_presenting);


        const data = this.getFieldsExcept(["form", "result"]);

        let response = await this.form.submit("post", "/api/evaluation/vitals", data);







        if(response) {
            flash(response);

            const presentingData = {
              symptom: 'No symptom'
            };




            this.weight_percentile = response.vital.weight_percentile;

            this.length_percentile = response.vital.length_percentile;
        }
    }

    /*
     * Instantiates the values of the vitals given having a visit that already exists
     */
    populate(vitals) {
        _.each(vitals, (value, index) => {
            if (this.hasOwnProperty(index)) {
                this[index] = vitals[index];
            }
        });
    }
}
