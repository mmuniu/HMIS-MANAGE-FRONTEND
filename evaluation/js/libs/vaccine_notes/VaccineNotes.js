/**
 * Created by: fredkisingo
 * On:  22 July 2024
 */
import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from './VaccineNotesRepository';

export default class VaccineNotes extends Base
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

        const data = this.onlyGet([type]);

        const response =  await this.form.submit('post', route('api.evaluation.presenting_complaints.store', this.visit_id), data);

        if(response) {
                return response;

        }
    }
     saveVaccines(data){

        const response =  this.form.submit('post', '/evaluation/save-vaccines', data);

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
