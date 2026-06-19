/**
 * Created by PhpStorm.
 * User: Lexx YungCarter
 * Date: 01/11/2018
 * Time: 18:30
 * Project: platform
 */

import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from "./JobAdvertRepository";


export default class JobAdvert extends Base {

    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.submitted = false;

    }

    submit()
    {
        let data = this.getFieldsExcept(['form']);

        this.form.submit('post', route('api.hr.job-adverts.store'), data).then(response => {
            this.submitted = true;

            flash(response);
        });
    }

    delete(id)
    {
        let data = {id: id};

        this.form.submit('delete', route('api.hr.job-adverts.destroy'), data).then(response => {
            this.submitted = true;

            flash(response);
        });
    }
}