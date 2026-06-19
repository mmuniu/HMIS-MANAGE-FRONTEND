/**
 * Created by: jjoek
 * On:  03 Aug, 2021
 */
import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './FridgesRepository';

export default class Admission extends Base {


    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.saved = false;
    }

    async save () {
        const data = this.getFieldsExcept(["form"]);

        const response = await this.form.submit('post', `/morgue/setup/fridgesCabinets`, data) ;

        if(response) {
            flash(response);
            this.setFields(fields);
            this.id = null;
        }
    }

    edit (item) {
        this.name = item.name;
        this.id = item.id;
        this.cabinets = JSON.parse(item.cabinets);
    }

    saveCabinet () {
        if(!this.cabinets.includes(this.cabinet_name)) {
            this.cabinets.push(this.cabinet_name);
            this.cabinet_name = null;
        } else {
            flash({
                message: 'Cabinet already added',
                alert: 'error'
            })
        }
    }

    removeCabinet (val) {
        this.cabinets.splice(this.cabinets.indexOf(val), 1);
    }
}
