import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import {fields} from './PaymentRepository';
import {_} from 'vue-underscore';

export default class Payment extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    // send a payment request to the patient's phone
    async requestClientPayment(type) {
        // this.processing_payment = true;

        // console.log(type)
        let data = {};
        if(type === 'finsprint'){
            data = {
                amount: this.wallet.amount_to_pay,
                patient_id: this.patient_id,
                mobile_number: this.wallet.mobile_number,
                account_number:this.wallet.wallet_number,
            };
        }else{
            data = {
                amount: this.mpesa.amount_to_pay,
                patient_id: this.patient_id,
                mobile_number: this.mpesa.mobile_number,
            };
        }
        const response = await this.form.submit('post', route('api.finance.request.client-payment', type), data);

        if (response) {
            flash(response);

            this.processing_payment = false;

            return response;
        }
    }
     getDeviceId() {
        let deviceId = localStorage.getItem("device_id");
        if (!deviceId) {
            deviceId = crypto.randomUUID();
            localStorage.setItem("device_id", deviceId);
        }
        return deviceId;
    }

    async requestCustomClientPayment(data) {
        let payload_data = {};
            if (data.type === 'mpesa_manual') {
                payload_data = {
                    amount: data.amount,
                    patient_id: (data && data.patient_id) ? data.patient_id : 232031,
                    type: data.type,
                    code: data.code
                };
            } else {
                payload_data = {
                    amount: data.amount,
                    patient_id: (data && data.patient_id) ? data.patient_id : 232031,
                    mobile_number: data.mobile_number,
                    type:data.type
                };
            }

            let response = null;
            if(data.type === 'mpesa'){
                response = await this.form.submit('post', route('api.finance.request.client-payment', 'mpesa'), payload_data);
            }else if (data.type === 'mpesa_manual'){
                response = await this.form.submit('post', route('api.finance.request.client-payment', 'mpesa_manual'), payload_data);
            }else if (data.type === 'pesapal'){

                payload_data.device_id = this.getDeviceId();

                response = await this.form.submit('post', route('api.finance.request.client-payment', 'pesapal'), payload_data);

            }else if(data.type === 'giftcard')
            {
                            payload_data = {
                amount: data.amount,
                patient_id: 232031,
                type:data.type,
                code: data.code,
                items: data.items
            };


                response = await this.form.submit('post', route('api.finance.request.client-payment', 'giftcard'), payload_data);

            }
            else if(data.type === 'voucher')
            {
                            payload_data = {
                amount: data.amount,
                patient_id: 232031,
                mobile_number: data.mobile_number,
                type:data.type,
                code: data.code,
                items: data.items
            };
                response = await this.form.submit('post', route('api.finance.request.client-payment', 'voucher'), payload_data);
        
            }
            else
                {
                response = await this.form.submit('post', route('api.finance.request.client-payment', 'mpesa'), payload_data);

            }

        if (response) {
            flash(response);

            this.processing_payment = false;

            return response;
        }
    }

    /*
    * fetch transaction unused transactions
    * */

    async fetchTransaction(transaction_id = null, phoneNumber = null) {
        const data = {
            transaction_id: transaction_id,
            number: phoneNumber,
            used: false
        };

        const response = await this.form.submit('post', route('api.finance.payment-transactions.index'), data);

        if (response) {
            if (response.data) {
                response.data.forEach((val) => {
                    if (_.findWhere(this.mpesa.transactions, { id: val.id })) {
                        return null;
                    } else {
                        this.mpesa.amount += val.amount;
                        this.mpesa.transactions.push(val);
                    }
                });
            }

            if (response.message) {
                flash(response);
            }

            this.calculateTotal();

            return response;
        }
    }

    async recordPayment(postTo = null, paymentData = null) {
        const data = this.getFields();

        data.payment_data = paymentData;


        this.loading = true;

        const url = postTo ?? route('api.finance.visit.bills.settle');

        const response = await this.form.submit('post', url, data);

        if (response) {

            if (postTo) {

                window.location.reload();
            } else {
                this.resetFields(fields);

                this.setFields(fields);

                flash(response);


                if (response.paymentId) {
                    if (data.forInpatient) {
                        const depositID = response.paymentId;

                        const printUrl = route('finance.account.print', [data.patient_id, 'deposits', depositID]);

                        window.open(`${printUrl}?paper_size=thermal`, '_blank');
                    } else {
                        window.open('/finance/evaluation/payment_details/' + response.paymentId + '?reprint_first=true', '_blank');
                    }

                    return 'success';
                }

                this.loading = false;

                // reset obj
                this.reset();

                return response;
            }
        }
    }


    /*
    * verify payment
    * */
    verifyPayment() {
        const meta = {
            verification_code: this.verification_code,
        };

        return this.form.submit('post', route('api.finance.patient.bills.verify_payment'), meta).then((response) => {
            flash(response);

            return response.key;
        });
    }

    /*
    * this prepares the bill as indicated and returns the unique
    * id to be sent to the which ever payment gateways there are
    * */
    raiseBill(data) {
        return this.form.submit('post', route('api.finance.patient.bills.prepare'), data).then((response) => {
            flash(response);

            return response.key;
        });
    }

    discountedAmountChanged(totalCost) {
        this.percentage_discount = ((totalCost - this.discounted_amount) / totalCost) * 100;

        if (this.discounted_amount) {
            this.total_cost = this.discounted_amount;
        }
    }

    percentageDiscountChanged(totalCost) {
        this.discounted_amount = ((100 - this.percentage_discount) / 100) * parseInt(totalCost);

        if (this.percentage_discount) {
            this.total_cost = (totalCost / 100) * (100 - this.percentage_discount);
        }
    }

    reasonForDiscount() {

    }

    totalCostOfSelectedItems() {
        let selectedTotal = 0;

        // Filter out disabled items
        const enabledItems = this.selected.filter(item => !this.isItemDisabled(item));

        // Iterate over enabled items

        _.forEach(enabledItems, function(item) {
            // Check if the item is selected
            selectedTotal += parseFloat(item.amount);
        });

        // Round the total to two decimal places
        // Update the total amount
        this.total_cost = parseFloat(selectedTotal.toFixed(2));
    }


    isItemDisabled(item) {

        // Check if the item is a prescription and not processed
        return item.service_type == 'prescription' && item.processed == 0 || item.service_type == 'prescription' && item.processed == null && item.type !== 'changed to cash' ;
    }
    calculateTotal() {
        const cash = this.cash.amount ? this.cash.amount : 0;

        const card = this.card.amount ? this.card.amount : 0;
        const cheque = this.cheque.amount ? this.cheque.amount : 0;
        const mpesa = this.mpesa.amount ? this.mpesa.amount : 0;
        const pesa_pal_mpesa = this.pesa_pal_mpesa.amount ? this.pesa_pal_mpesa.amount:0;
        const pesa_pal_card = this.pesa_pal_card.amount ? this.pesa_pal_card.amount:0;
        const patientAccount = this.patientAccount.amount ? this.patientAccount.amount : 0;
        const giftCardAccount = this.giftcard.amount ? this.giftcard.amount : 0;

        this.paid_amount = parseFloat(cash)  + parseFloat(cheque) + parseFloat(mpesa) + parseFloat(patientAccount) + parseFloat(card)+ parseFloat(pesa_pal_mpesa)+ parseFloat(pesa_pal_card)+ parseFloat(giftCardAccount);

    }

    calculateTotalWallet() {
        if (this.wallet) {
            const walletCash = this.cash.amount ? this.cash.amount : 0;
            const walletCard = this.card.amount ? this.card.amount : 0;
            const walletCheque = this.cheque.amount ? this.cheque.amount : 0;
            const wallet = this.wallet.amount ? this.wallet.amount : 0;
            const walletAccount = this.wallet.wallet_account_amount ? this.wallet.wallet_account_amount : 0;
            // const availableBalance = this.wallet.wallet_available_balance ? this.wallet.wallet_available_balance : 0;

            this.paid_amount = parseFloat(walletCash) + parseFloat(walletCard) + parseFloat(walletCheque) + parseFloat(wallet) + parseFloat(walletAccount);
        }
    }
    async fetchExistingPatientWalletAccount(patientId) {

        try {
            return await this.form.submit('get', route('api.reception.patients.fetch_existing_wallet_record', patientId));
        } catch (error) {
            console.error("Error fetching patient wallet balance:", error);
            throw error; // Propagate the error if needed
        }
    }

    async fetchPatientWalletBalance(patientId) {

        try {
            return await this.form.submit('get', route('api.reception.patients.show_wallet_balance', patientId));
        } catch (error) {
            console.error("Error fetching patient wallet balance:", error);
            throw error; // Propagate the error if needed
        }
    }

    async fetchPatientActualWalletBalance(patientId) {

        try {
            return await this.form.submit('get', route('api.reception.patients.show_wallet_actual_balance', patientId));
        } catch (error) {
            console.error("Error fetching patient wallet balance:", error);
            throw error; // Propagate the error if needed
        }
    }

    async fetchPatientWalletAccount(patientId){
        try {
            const response = await this.form.submit('get', route('api.reception.patients.show_wallet_acc', patientId));

            return response;
        } catch (error) {
            console.error("Error fetching patient wallet balance:", error);
            throw error; // Propagate the error if needed
        }
    }


    reset() {
        this.cash.amount = null;
        this.pesa_pal_card.amount = null;
        this.pesa_pal_mpesa.amount = null;
        this.mpesa.code = null;
        this.mpesa.amount = null;
        this.wallet.code = null;
        this.wallet.wallet_number = null;
        this.wallet.amount_to_pay = null;
        this.wallet.wallet_available_balance = null;
        this.wallet.wallet_account_amount = null;
        this.cheque.name = null;
        this.cheque.amount = null;
        this.cheque.bank = null;
        this.cheque.expiry = null;
        this.cheque.number = null;

        this.card.type = null;
        this.card.valid_thru = null;
        this.card.receipt_number = null;
        this.card.authorisation_code = null;

        this.card.name = null;
        this.card.amount = null;
        this.voucher.amount = null;
        this.giftcard.amount = null;
        this.card.number = null;
        this.insurance.scheme = null;
        this.insurance.amount = null;

        this.jamboPay.amount = null;

        this.selected.total_amount = null;
        this.paid_amount = 0;
        this.percentage_discount = null;
        this.total_cost = 0;
        this.discounted_amount = null;
        this.totalCost = null;
        this.patient_id = null;
        this.internal_payment = true;
        this.forInpatient = false;
        this.verification_code = null;
    }
}
