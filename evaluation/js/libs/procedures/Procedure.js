import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import Search from '@app/libs/Search';
import { fields } from './ProcedureRepository';
import { _ } from 'vue-underscore';

export default class Procedure extends Base {
    constructor() {
        super(fields);

        this.search = new Search();

        this.form = new Form(fields);

        this.orderedProcedures = {};

        this.stop_investigation_reason = null;

        this.selected = null;
    }

    /*
     * Initialise search processs
     */
    index(schemeId = null) {
        let url = '/api/evaluation/procedures';
        if (this.search.term) {

          url = `${url}?categories=${this.type}&search=${this.search.term}&active_only=1`;
          // url = `${url}?applies_to=${this.type}&search=${this.search.term}&active_only=1`;
            // if (this.type) {
            //     url = `${url}?applies_to=${this.type}&search=${this.search.term}&active_only=1`;
            // } else {
            //     url = `${url}?search=${this.search.term}&active_only=1`;
            // }
        }

        if (schemeId) {
            url += `&scheme_id=${schemeId}&active_only=1`;
        }

        _.debounce(this.fetch(url), 500);
    }

    /**
     * find a specific procedure
     *
     * @param id
     */
    find(id) {
        this.form.submit('get', route('evaluation.procedures.show', id).relative()).then((procedures) => {
            // feed
        });
    }

    /*
     * fetch the products from the database
     */
    fetch(url) {
        this.search.loading = 'blue';

        this.form.submit('get', url).then((procedures) => {
            if (procedures) {
                this.search.results = procedures.data;


                this.search.loading = false;

                if (this.search.results.length == 0) {
                    this.search.noData = 'Sorry! no results matched your search';
                }

                this.form.submitted = false;
            }
        });
    }

    async requestClientPayment(procedure) {
        let data = {};
        data = {
            amount: procedure.amount,
            patient_id: procedure.patient_id ,
            mobile_number: procedure.mobile_number,
            account_number: procedure.wallet_number,
        };


        const response = await this.form.submit('post', route('api.finance.request.client-payment', 'finsprint'), data);


        if (response) {
            flash(response);
            this.processing_payment = false;
            return response;
        }
    }

    /*
     * Order procedures that have been added to the cart
     */
    async orderProcedures(cart, visitId) {
        const destinations = this.getFields(['destinations']);


        const data = {
            procedures: cart.items,
            visitId: visitId,
            total:cart.total,
            destinations,
            store_id: this.store_id,
            wallet_amount: cart.wallet_balance ?? null,
            wallet_number: cart.wallet_number ?? null,
        };


        const response = await this.form.submit('post', '/api/evaluation/treatment', data);

        if (response) {
            this.setFields(fields);

            flash(response);

            return response;
        }
    }

    async orderTheaterProcedures(cart, visitId,userId,operationId,storeId,type) {
        const destinations = this.getFields(['destinations']);

        const data = {
            procedures: cart.items,
            visitId: visitId,
            total:cart.total,
            operation_id:operationId,
            destinations,
            user:userId,
            amount: cart.total,
            store_id: storeId,
            type:type
        };


        const response = await this.form.submit('post', `/theatre/operation/${operationId}/procedure`, data);

        if (response) {
            this.setFields(fields);

            flash(response);

            return response;
        }
    }
    async orderTheaterInvestigations(cart, visitId,userId,operationId,storeId,type) {
        const destinations = this.getFields(['destinations']);

        const data = {
            procedures: cart.items,
            visitId: visitId,
            total:cart.total,
            operation_id:operationId,
            destinations,
            user:userId,
            amount: cart.total,
            store_id: storeId,
            type:type
        };


        const response = await this.form.submit('post', `/theatre/operation/${operationId}/investigations`, data);

        if (response) {
            this.setFields(fields);

            flash(response);

            return response;
        }
    }

    destroyOrderedProcedure(investigationId) {
        const data = {
            reason: this.stop_investigation_reason,
            id: investigationId,
        };

        this.form.submit('patch', '/api/evaluation/investigations/destroy', data).then((response) => {
            flash(response);
        });
    }

    /*
     * Send the details of a new procedure tag to the backend API form storage
     */
    async store() {
        const data = this.getFieldsExcept();

        data.labs.lab_result_options = JSON.stringify(this.meta.lab_result_options);

        const url = route('api.evaluation.procedures.store');

        const response = await this.form.submit('post', url, data);

        this.setFields(fields);

        flash(response);
    }


    /*
     * inactivate procedure
     */
    async inactivateProcedure(procedure) {
        const url = route('api.evaluation.procedures.inactivate', procedure.id);

        return await this.form.submit('post', url);
    }


    /*
     * Send the details of a new procedure to the backend API form storage
     */
    async updateDetails() {
        if (!this.labs.units) {
            this.labs.units = null;
        }

        const data = this.getFieldsExcept();

        data.labs.lab_result_options = JSON.stringify(this.meta.lab_result_options);

        data.meta = this.meta;

        const url = route('api.evaluation.procedures.update', this.procedure_id);

        const response = await this.form.submit('post', url, data);

        // this.setFields(fields);

        flash(response);
    }


    /**
     * update procedure prices w.r.t. facility
     */
    updatePrices(procedureId) {
        const data = { prices: this.getFields(['prices']) };

        this.form.submit('put', route('api.evaluation.procedures.update-prices', procedureId).relative(), data).then((response) => {
            flash(response);
        });
    }

    /*
    * soft delete procedure
    * */
    disableProcedure(procedure_id) {
        this.form.submit('delete', route('api.evaluation.procedures.delete', procedure_id)).then((response) => {
            flash(response);
        });
    }

    /**
     * reassemble
     */
    assemble(data) {
        const procedure = data;

        this.procedure_id = data['id'];

        _.each(fields, (value, key) => {
            if (_.isObject(value)) {
                if (key === 'meta') {
                    this[key].gender = procedure['gender'];
                    this[key].pricing.cash_charge = procedure['cash_charge'];
                    this[key].pricing.insurance_charge = procedure['insurance_charge'];
                    this[key].pricing.precharge = procedure['precharge'];
                    this[key].hasConsumables = procedure['consumables'].length > 0 ? true : false;
                    if (procedure['categoryObj'].name === 'Lab' || procedure['categoryObj'].name === 'Radiology') {
                        this[key].isLab = true;
                    }
                }
                if (key === 'labs') {
                    if (procedure['labs'].length > 0) {
                        const prozedure = procedure['labs'][0];
                        this[key].parent = prozedure['parent'];
                        this[key].category = prozedure['category'];
                        this[key].units = prozedure['units'];
                        this[key].additive = null;
                        this[key].lab_result_type = prozedure['lab_result_type'];
                        this[key].lab_sample_type = prozedure['lab_sample_type'];
                        this[key].turn_around_time = prozedure['turn_around_time'];
                        this[key].lab_ordered_independently = prozedure['lab_ordered_independently'];
                        this[key].lab_multiple_orders_allowed = prozedure['lab_multiple_orders_allowed'];

                        this.meta.lab_result_options = JSON.parse(prozedure['lab_result_options']);
                    }
                }
            } else {
                this[key] = procedure[key];
            }
        });
    }
}
