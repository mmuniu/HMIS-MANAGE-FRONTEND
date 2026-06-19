/**
 * Created by: jjoek
 * On:  03 Aug, 2021
 */
import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './AdmissionRepository';

export default class Admission extends Base {


    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.saved = false;
    }

    async save () {
      console.log(this.admission_data);
        const response = await this.form.submit('post', route('morgue.save-admission'), this.admission_data);

        if(response) {
            flash(response);

            if(response.alert === 'success') {
                window.open('/morgue/admissions', '_self');
            }
        }
    }

    async dispatch () {
        let data = this.admission_data;

        data.dispatch = true;

        const response = await this.form.submit('post', route('morgue.save-admission'), data);

        if(response) {
            flash(response);

            if(response.alert === 'success') {
                window.open('/morgue/discharges', '_self');
            }
        }
    }

}
