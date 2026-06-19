import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './InvoiceRepository';

export default class Invoice extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.selectedInvoice = false;
    }

    /*
     * find an invoice
     */
    find(id) {
        this.form.submit('get', route('api.finance.invoices.show', id)).then((response) => {
            this.selectedInvoice = response.data;
        });
    }

    updateSignature(id) {
        const data = this.getFields('patient_signature');

        this.form.submit('post', route('api.finance.invoices.update-signature', id), data).then((response) => {
            flash(response);

            this.find(id);
        });
    }

    addItemsToInvoice(data) {
        this.form.submit('post', '/api/finance/add-items-to-patient-bills', data).then((response) => {
            flash(response);

            window.location.reload();
        });
    }

    updateInvoiceDetails(data) {
        this.form.submit('post', '/api/finance/update-invoice-details', data).then((response) => {
            flash(response);

            window.location.reload();
        });
    }

    saveWaiver(data) {
        // Define the correct URL dynamically
        const url = `/finance/waivers/${data.invoice_id}/waivers`;
    
        // Submit the form using the dynamic URL
        this.form.submit('post', url, data).then((response) => {
            flash(response); // Display a success message
    
            window.location.reload(); // Reload the page on success
        }).catch((error) => {
            console.error("Error saving waiver:", error); // Log errors for debugging
        });
    }
    


    async dispatchInvoices(data) {
        const response = await this.form.submit('post', '/api/finance/invoices/billed/store', data);

        if (response) {
            flash(response);

            return response;
        }
    }


    async undoInvoiceCancellation(invoice_id) {
        const response = await this.form.submit('post', `/api/finance/invoices/cancelled/${invoice_id}/undo`);

        if (response) {
            flash(response);

            return response;
        }
    }

    async processInsurancePayment(selectedInvoices) {
        const response = await this.form.submit('post', '/api/finance/invoices/insurance-payment/store', selectedInvoices);

        if (response) {
            flash(response);

            return response;
        }
    }

    /*
    * settle insurance payments via excel
    * */
    async uploadExcel() {
        const formData = this.prepareDataFormData();

        const response = await this.form.submit('post', '/api/finance/invoices/insurance-payment/upload-excel',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

        if (response) {
            flash(response);

            window.location.reload();

            return response;
        } else {
            setTimeout( () => {
                flash(response);

                window.location.reload();
            }, 1500);
        }
    }


    /**
     * unbill items from the given invoice
     * @returns {FormData}
     */
    async unbillItems (invoice) {
        const response = this.form.submit('post', `/api/finance/invoices/cancelled/${invoice.id}/un-bill-items`);

        if(response) {
            flash(response);

            return response;
        }
    }

    prepareDataFormData() {
        const formData = new FormData();

        formData.append('excel_upload', true);
        formData.append('excel_doc', this.excel.file);
        formData.append('company_id', this.excel.company_id);
        // cheque
        formData.append('cheque_name', this.excel.cheque.name);
        formData.append('cheque_number', this.excel.cheque.number);
        formData.append('cheque_amount', this.excel.cheque.amount);
        formData.append('cheque_date', this.excel.cheque.date);
        formData.append('cheque_bank', this.excel.cheque.bank);

        return formData;
    }

    /**
     * @param data
     * @returns {Promise<any>}
     */
    async saveEdits(data) {
        const response = await this.form.submit('post', `/api/finance/invoices/edit/manual`, data)

        if(response) {
            flash(response);

            return response;
        }
    }

    /**
     * @param data
     * @returns {Promise<any>}
     */
    async saveAddedItems(data, invoice_id) {
        const response = await this.form.submit('post', `/api/finance/invoices/save-added-items/${invoice_id}/manual`, data)

        if(response) {
            flash(response);

            return response;
        }
    }

    /**
     * @param data
     * @param invoice_id
     * @returns {Promise<any>}
     */
    async updateInvoiceData(data, invoice_id) {
        const response = await this.form.submit('post', `/api/finance/invoices/save-added-items/${invoice_id}/edit-manual`, data)

        if(response) {
            flash(response);

            return response;
        }
    }

    /**
     * @param data
     * @returns {Promise<any>}
     */
    async deleteItem(data) {
        const response = await this.form.submit('post', `/api/finance/invoices/delete/manual`, data)

        if(response) {
            flash(response);

            return response;
        }
    }


    /**
     * @returns {Promise<void>}
     */
    async saveManualInv(data) {
        const response = await this.form.submit('post', `/api/finance/invoices/create/manual-invoice`, data)

        if(response) {
            flash(response);

            return response;
        }
    }
}
