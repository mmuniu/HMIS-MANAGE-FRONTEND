import Errors from './Errors';
import { visa } from './Customs';

export default class Form {
    constructor(fields) {
        this.errors = new Errors(fields);

        this.submitted = false;

        this.errorDetected = false;

        this.loading = false;
    }

    /*
     * Save the data that has been passed to the form into the database
     */
    submit(request, url, record, headers = null) {
        this.loading = true;
        this.errors.clear();

        this.submitted = false;
        this.errorDetected = false;

        return new Promise((resolve, reject) => {
            let call;
            if (!headers) {
                headers = visa();
            }

            if (request === 'get' || request === 'delete') {
                call = axios[request](url, headers);
            } else {
                call = axios[request](url, record, headers);
            }

            call.then(({ data }) => {
                resolve(data);

                this.submitted = true;

                this.loading = false;
            }).catch(({ response }) => {
                this.errors.record(response.data);

                if (response.data.hasOwnProperty('exception') || response.data.hasOwnProperty('message')) {
                    flash({ alert: 'error', message: response.data.message });
                }

                reject(response.data);

                this.errorDetected = true;

                this.loading = false;
            });
        });
    }
}
