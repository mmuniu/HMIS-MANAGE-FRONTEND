/**
 * Created by: fredkisingo
 * On:  22 July 2024
 */
import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from './PresentingComplaintsRepository';

export default class PresentingComplaints extends Base
{
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.visit_id = null;
    }

    /*
    * save data
    * */
    async saveData(type) {

        // const data = this.onlyGet([type]);


          const response =  await this.form.submit('post', route('api.evaluation.presenting_complaints.store', this.visit_id), type);

             console.log(response);

          if(response['message'] != "Please Enter Temperature in Patient Vitals Tab") {
              flash(response);
              return response['disease'];
          }
          else
          {
            flash(response);
          }


    }

    async fetchSymptoms(){

        const data = '';
        const response =  await this.form.submit('get', route('api.evaluation.presenting_complaints.fetch_symptoms'), data);

        if(response) {
            return response;
        }
    }
    assemble(val) {
        _.each(val, (value, key) => {
            if(value !== null) {
                this[key] = val[key];
            }
        });
    }

}
