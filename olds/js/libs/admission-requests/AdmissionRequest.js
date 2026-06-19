import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './AdmissionRequestRepository';
import _ from 'lodash';


export default class AdmissionRequest extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.saved = false;

        this.cancelled = false;

        this.selected = false;
    }

    async save() {
        const data = this.getFieldsExcept(['form']);

        const response = await this.form.submit('post', route('api.inpatient.admissionRequests.store').relative(), data);

        if (response) {
            flash(response);

            return response;
        }
    }

    /**
     * check for existing admission request
     * @param visitId
     */
    findForVisit(visitId) {
        this.form.submit('get', route('api.inpatient.admissionRequests.show-for-visit', visitId).relative()).then((response) => {
            if (response.data) {
                const fillup = {};

                _.each(fields, (item, key) => {
                    fillup[key] = response.data[key];
                });


                this.setFields(fillup);
            }
        });
    }

    /**
     * find an admission request
     *
     * @param id
     */
    find(id) {
        this.form.submit('get', route('api.inpatient.admissionRequests.show', id).relative()).then((response) => {
            this.selected = response.data;
        });
    }

    /**
     * cancel an admission request
     *
     * @param id
     */
    cancelRequest(id) {
        this.cancelled = false;

        this.form.submit('get', route('inpatient.admission-requests.cancel', id).relative()).then((response) => {
            flash(response);

            this.cancelled = true;
        });
    }

    authorize() {
        const data = this.getFields(['authorization']);
        this.saved = false;

        this.form.submit('put', route('api.inpatient.admissionRequests.update', data.admission_request_id).relative(), data).then((response) => {
            flash(response);

            this.saved = true;
        });
    }
}
