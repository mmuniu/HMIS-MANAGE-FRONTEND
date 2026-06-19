import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './StoreRepository';
import _ from 'lodash';

export default class Store extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    async find(storeId) {
        const response = await this.form.submit('get', `/api/inventory/stores/${storeId}`);

        this.assemble(response);
    }

    /*
     * Save the product
     */
    async save() {
        const data = this.getFields();

        this.form.submit('post', '/api/inventory/stores', data).then((response) => {
            this.setFields(fields);

            flash(response);

            window.location.reload();
        });
    }

    /*
     * Save the product
     */
    async addProductsToStore(data, store) {
        const response = await this.form.submit('post', `/api/inventory/${store}/storeProducts/add-products`, data);

        if (response) {
            return response;
        }
    }

    /*
     *
     */
    async update() {
        const data = this.getFields();

        const response = await this.form.submit('patch', `/api/inventory/stores/${data.id}`, data);

        flash(response);
    }

    /*
    * check to ensure we don't store what we're not told to
    * */
    checkOnOpenHours() {
        if (!this.open_only_between) {
            this.open_time = null;
            this.close_time = null;
        }

        return true;
    }


    assemble(store) {
        _.each(fields, (value, key) => {
            this[key] = store[key];
        });
    }
}
