/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-05-23
 * Time: 14:56
 */

import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './AdmissionRepository';


export default class Admission extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.saved = false;

        this.generatedIpNuber = false;
    }

    /**
     * change a user's ward
     */
    changeWard() {
        const data = this.wardChange;

        this.saved = false;

        console.log(data);

          this.form.submit('post', route('api.inpatient.admissions.change-ward', data.admission_id).relative(), data).then((response) => {
              this.saved = true;

              flash(response);
          });
    }

    resetWardChange() {
        this.wardChange.admission_id = null;
        this.wardChange.bed_id = null;
        this.wardChange.ward_id = null;
        this.wardChange.charges = [];
    }

    save() {
        const data = this.admission;
        this.saved = false;

        this.form.submit('post', route('api.inpatient.admissions.store', data).relative(), data).then((response) => {
            this.saved = true;

            flash(response);
        });
    }

    /**
     * generate a unique inpatient number
     */
    generateInpatientNumber() {
        this.form.submit('get', route('api.inpatient.admissions.generate-inpatient-number').relative()).then((response) => {
            this.generatedIpNuber = response.data;
        });
    }

    /*
    * edit admission details
    * */
    async submitEdittedDetails() {
        const response = await this.form.submit('post', `/api/inpatient/admissions/${this.editAdmissionDetails.admission_id}/edit-admission-details`, this.editAdmissionDetails);

        if (response) {
            flash(response);

            return response;
        }
    }
};

