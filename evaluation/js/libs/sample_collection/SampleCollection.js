import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './SampleCollectionRepository';
import { _ } from 'vue-underscore';

export default class SampleCollection extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /**
     * Save patient vitals into the database
     */
    async save() {
        const data = this.getFieldsExcept(['form']);

        const response = await this.form.submit('post', '/api/evaluation/sample-collection', data);

        if (response) {
            flash(response);

            this.setFields(fields);

            return response;
        }
    }

    /**
     * Save patient vitals into the database
     */
    async takeSample(request_id) {
        const data = this.getFieldsExcept(['form']);

        const response = await this.form.submit('post', `/api/evaluation/sample-collection/${request_id}/from-request`, data);

        if (response) {
            flash(response);

            this.setFields(fields);

            return response;
        }
    }

    /*
    * cancel sample collection request
    * */
    async cancelSampleCollectionRequest(sampleCollectionRequestId) {

        const response = await this.form.submit('delete', `/api/evaluation/sample-collection/requests/${sampleCollectionRequestId}/destroy`);

        if(response) {
            return response;
        }
    }

    /**
     * Save patient vitals into the database
     */
    async sampleRequestSample(patient) {
        const data = this.getFieldsExcept(['form']);

        const response = await this.form.submit('post', `/api/evaluation/sample-collection/request-sample/${patient.id}`, data);

        if (response) {
            flash(response);

            this.setFields(fields);

            return response;
        }
    }

    /*
    * add more investigations to a given sample no
    * */
    async addToSample(sample_id, added_investigations) {
        const data = {
            added_investigations: added_investigations,
        };

        const response = await this.form.submit('post', `/api/evaluation/sample-collection/add-to-sample/${sample_id}`, data);

        if (response) {
            flash(response);

            return response;
        }
    }

    /*
     * delete sample
     */
    async trashSample(sample_id) {
        const response = await this.form.submit('delete', `/api/evaluation/sample-collection/${sample_id}`);

        if (response) {
            flash(response);

            return response;
        }
    }

    /*
     * delete sample
     */
    async queuePatientToLab(sample_id, undo = false, record_results = false) {
        const response = await this.form.submit('post', `/api/evaluation/sample-collection/${sample_id}/queue?undo=${undo}&record_results=${record_results}`);

        if (response) {
            flash(response);

            if(record_results) {
                window.open(`/evaluation/visit/${response.visit_id}/destination/laboratory/ordered-investigations`, '_self');
            }

            return response;
        }
    }
}
