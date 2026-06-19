import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './DispatchRepository';

export default class Dispatch extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     *  Dispatch items from a given order
     */
    async dispatch(store, data) {
        const response = await this.form.submit('post', `/api/inventory/store/${store}/dispatch`, data);

        flash(response);
    }

    /*
    * issue out products to some other store without it ordering for the items
    * */
    async issueOutProducts(store) {
        const data = this.unordered;

        const response = await this.form.submit('post', `/api/inventory/store/${store}/dispatch-self`, data);

        flash(response);

        return response;
    }
}
