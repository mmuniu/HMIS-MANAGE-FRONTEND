/**
 * Created by: jjoek
 * On:  11 Jan, 2020
 */
import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './SplitBillRepository';

export default class CreditNotes extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
    * process invoices
    * interim, is just a final invoice that basically re-builds its items
    * */
    processInvoices(is_interim) {
        const data = this.getFields();

        this.loading = true;

        // console.log(this.total_amount);

        this.form.submit('post', route('api.finance.split-bill', this.visit_id) + '?is_interim=' + is_interim, data)
            .then((response) => {
                // flash(response);



                self.loading = false;

                window.location.reload();
            });
    }

    /*
    * get the total of the selected items
    * */
    totalCostOfSelectedItems(items) {
        let selected_total = 0;

        // console.log(items);

        _.map(items, function(item) {
            if (item.type == 'rebate') {
                selected_total -= parseFloat(item.amount);
            } else {
                selected_total += parseFloat(item.amount);
            }
        });

        console.log(items);

        this.total_amount = parseFloat(selected_total);
    }

    /*
    * get the total of all the set payment options
    * */
    calculateInvoicesTotal() {
        this.invoices_amount = 0;

        //

        const self = this;

        _.map(this.payment_options.schemes, (value, item) => {
            value ? self.invoices_amount += parseFloat(value) : 0;
        });

        self.invoices_amount += self.payment_options.invoice_patient ? parseFloat(self.payment_options.invoice_patient) : 0;



      }
}


