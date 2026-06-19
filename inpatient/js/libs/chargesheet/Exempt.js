/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-04-14
 * Time: 06:10
 * Project: platform
 */

import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './ExemptRepository';


export default class Exempt extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.chargesheetData = null;

        this.saved = false;
    }


    /**
     * update price for the selected investigation/procedure/consumable/prescription/daily-charge/ward
     */
    exemptInvoice(invoice, visit_id, amount) {
        const data = this.getFieldsExcept(['visit', 'saved', 'form', 'chargesheetData', 'patient']);
        data.invoice_id = invoice;
        data.amount = amount;
        this.saved = false;

        return this.form.submit('post', route('api.finance.invoices.store-exemption', visit_id).relative(), data)
            .then((response) => {
                this.saved = true;
                flash(response);
                return response;
            });
    }

    fetchExistingCreditNotes(invoice,visit_id){
        if(!visit_id){
            return;
        }
      const data = this.getFieldsExcept(['visit', 'saved', 'form', 'chargesheetData', 'patient']);
        data.invoice_id = invoice;

        return this.form.submit('post', route('api.finance.invoices.fetch-existing-credit-notes', { key: visit_id }).relative(), data)
            .then((response) => {
                this.saved = true;
                return response;
            });

    }

    creditNote(invoice, visit_id, credit_amount,selectedItems) {
        const data = this.getFieldsExcept(['visit', 'saved', 'form', 'chargesheetData', 'patient']);
        data.invoice_id = invoice;
        data.amount = credit_amount;
        data.selectedItems = selectedItems
        this.saved = false;

        return this.form.submit('post', route('api.finance.invoices.store-credit_note', visit_id).relative(), data)
            .then((response) => {
                this.saved = true;
                flash(response);
                return response;
            });
    }

        changeStatusCreditNote(invoice, visit_id,credit_note_reason, status) {
            const data = this.getFieldsExcept(['visit', 'saved', 'form', 'chargesheetData', 'patient']);

                data.invoice_id = invoice;
            data.credit_note_reason=credit_note_reason
                data.status = status
                this.saved = false;

                return this.form.submit('post', route('api.finance.invoices.change-status-credit_note', visit_id).relative(), data)
                    .then((response) => {
                        this.saved = true;
                        flash(response);
                        return response;
                    });
          }



}


