import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './ValidateVitalsFormRepository';


export default class Admission extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.saved = false;

    }

}

