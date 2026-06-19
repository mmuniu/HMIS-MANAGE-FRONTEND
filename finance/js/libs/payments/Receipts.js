import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './ReceiptsRepository';
import { data } from 'jquery';

export default class Receipts extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
    * cancelling a receipt will destroy the receipt,
    * later on we can offer you the ability to
    * raise another receipt from the receipt
    * or refund or give a credit note
    * */
    async cancelReceipt(receipt) {
        const response = await this.form.submit('post', route('api.finance.cash-payments-receipts.cancel', receipt.id));

        flash(response);

        return response;
    }


    async issueCreditNote(note) {
      console.log(note)
        const response = await this.form.submit('post', route('api.finance.cash-payments-receipts.issue-credit-note', note.receipt_id), note);

        flash(response);

        return response;
    }
}
