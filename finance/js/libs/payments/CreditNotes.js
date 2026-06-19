import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './CreditNotesRepository';

export default class CreditNotes extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    async transferAmountToPatientAccount() {
        const data = this.toAccount;

        const response = await this.form.submit('post', route('api.finance.credit-notes.transfer-to-account', this.toAccount.credit_note_id), data);

        flash(response);

        return response;
    }

    async refundClient() {
        const data = this.refund;

        const response = await this.form.submit('post', route('api.finance.credit-notes.refund', this.refund.credit_note_id), data);

        flash(response);

        return response;
    }
}
