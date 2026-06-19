import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import Search from '@app/libs/Search';
import { fields } from './StoreProductRepository';
import { _ } from 'vue-underscore';

export default class StoreProduct extends Base {
    constructor() {
        super(fields);

        this.search = new Search([]);

        this.form = new Form(fields);
    }

    /*
     * Return a listing of products, performs search as well
     */
    index(clinicId, schemeId = null, outpatient = 0) {
        let url = '/api/inventory/get/store/products';

        if (this.search.term) {
            if (schemeId) {
                url = `${url}?term=${this.search.term}&clinic=${clinicId}&scheme_id=${schemeId}&outpatient=${outpatient}&check_open=true`;
            } else {
                url = `${url}?term=${this.search.term}&clinic=${clinicId}&outpatient=${outpatient}&check_open=true`;
            }
        }

        _.debounce(this.fetch(url), 500);
    }


    own_index(clinicId, schemeId = null, outpatient = 0) {
        let url = '/api/inventory/get/store/products';

        console.log("search.own_term")

        console.log(this.search.own_term)
        if (this.search.own_term) {
            if (schemeId) {
                url = `${url}?term=${this.search.own_term}&clinic=${clinicId}&scheme_id=${schemeId}&outpatient=${outpatient}&check_open=true`;
            } else {
                url = `${url}?term=${this.search.own_term}&clinic=${clinicId}&outpatient=${outpatient}&check_open=true`;
            }
        }

        _.debounce(this.own_fetch(url), 500);
    }
    /*
     * fetch the products from the database
     */
    fetch(url) {
        this.search.loading = 'blue';

        this.form.submit('get', url).then(({ results }) => {
            if (results) {
                this.search.results = results;

                this.search.loading = false;

                if (this.search.results.length == 0) {
                    this.search.noData = 'Sorry! no results matched your search';
                }
            }
        });
    }


    own_fetch(url) {
        this.search.own_loading = 'blue';

        this.form.submit('get', url).then(({ results }) => {
            if (results) {
                this.search.own_results = results;

                this.search.own_loading = false;

                if (this.search.own_results.length == 0) {
                    this.search.noData = 'Sorry! no results matched your search';
                }
            }
        });
    }

    updateReOrderLevel(product) {
        this.form.submit('patch', `/api/inventory/store-products/${product.id}`, product)
            .then((response) => {
                flash(response);
            });
    }

    /*
     * Update the details of a store product
     * Used majorly to change the prices of a store product
     */
    async update(item) {
        _.each(_.keys(item), (key) => this[key] = item[key]);

        const data = this.getFields(['selling_price', 'insurance_price', 'lower_limit_price', 'lower_limit_percentage']);

        await this.form.submit('patch', `/api/inventory/store-products/${item.id}`, data);

        // console.log(;

        // console.log(item, type, this.store_id);
    }
}
