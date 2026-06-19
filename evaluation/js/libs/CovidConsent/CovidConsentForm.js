import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from './CovidConsentFormRepository';

export default class CovidConsentForm extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    async save (visitId) {
        const data = this.getFieldsExcept(["form"]);

        const response = await this.form.submit('post', route('api.evaluation.covid-consent.store', visitId), data);

        if(response){
            flash(response);

            return response;
        }
    }


    assemble (consent) {
        if(consent) {
            this.signature = consent.signature;
            this.employer = consent.employer;
            this.symptoms = consent.symptoms;
            this.travel = consent.travel;
            this.testing_reason = consent.testing_reason;
        }
    }
}
