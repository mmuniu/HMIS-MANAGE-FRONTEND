import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './CashOutsRepository';

export default class CashOuts extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }


    /*
    * give out money
    * */
    async issueOutMoney() {
        const data = this.getFields();

        const response = await this.form.submit('post', `/api/finance/issue-out-cash`, data);

        if (response) {
            flash(response);

            return response;
        }
    }


    /*
    * give out money
    * */
    async receiveCash(id) {

        const response = await this.form.submit('post', route('api.finance.cash-outs.receive', id));

        if (response) {
            flash(response);

            return response;
        }
    }

    /*
    * edit
    * */
    assemble (prevValues) {
        this.issued_out_to = prevValues.issued_out_to;
        this.issue_to = prevValues.issued_to;
        this.money_for = prevValues.money_for;
        this.amount = prevValues.amount;
        this.resource_id = prevValues.resource_id;
        this.received_by = prevValues.received_by;
        this.comments = prevValues.comments;
    }
}
