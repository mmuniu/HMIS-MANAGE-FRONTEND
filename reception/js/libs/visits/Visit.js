import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import {fields} from './VisitRepository';
import {_} from 'vue-underscore';

export default class Visit extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.selectedVisit = null;

        this.capitationStatus = null;

        this.lastTscNumberVisit = null;

        this.checkingTscNumber = false;
        this.wallet_message = null;
        this.show_wallet_message =false;
        this.finsprint_wallet_number = null;
    }

    /*
     * Returns a single visit from the database
     */
    find(visitId) {
        this.form.submit('get', `/api/reception/visit/${visitId}`).then(({ visit }) => {
            this.selectedVisit = visit;
        });
    }

    async fetchExcludedSchemeProcedures(data){

        return await this.form.submit('post', route('api.inventory.products.excluded-insurance-procedures', data));
    }

    fetchVisit(visitId){
        this.form.submit('get', `/api/reception/visit/${visitId}`).then(({ visit }) => {
            return  visit;
        });
    }

    metaData(patientId) {
        this.form.submit('get', route('api.reception.visits.last-visit-meta', patientId))
            .then((response) => {
                this.lastVisitMeta = response.data;
                return response;
            })
            .catch((error) => {
                console.error('Error fetching last visit meta:', error);
            });
    }


    /*
    * Returns a single visit from the database
    */
    fetch(visitId) {
        this.form.submit('get', `/api/reception/visit/${visitId}`).then(({ visit }) => {
            this.selectedVisit = visit;
        });
    }
    async fetchPatientWalletNumber(patientId) {
        try {
            const existing_patient_account = await this.form.submit('get', route('api.reception.patients.fetch_existing_wallet_record', patientId));


            if (existing_patient_account.message === 'Wallet exists') {
                const response = await this.form.submit('get', route('api.reception.patients.show_wallet_acc', patientId));
                this.finsprint_wallet_number = response;
                return response;
            } else {
                // No wallet exists, return null
                return null;
            }
        } catch (error) {
            throw error; // Propagate the error if needed
        }
    }

    updatePrescriptionInstruction(prescription) {
        const data = {
            'prescription_id': prescription.id,
            'description': prescription.description
        };

        return this.form.submit('post', route('api.inventory.products.update-prescription-description'), data)
            .then(function(response) {
                if (response) {
                    flash(response);
                }
            })
            .catch(function(error) {
                console.error('Error:', error);
            });
    }

    async fetchDrugDetails(prescription) {
        try {
            const data = {
                'prescription_id' : prescription.id,
            };
            return this.form.submit('post', route('api.inventory.products.get-prescription-details'), data)
            .then(function(response) {
                if (response) {
                    return response;
                }
            })
            .catch(function(error) {
                console.error('Error:', error);
            });
            // return await this.form.submit('get', route('', prescription.id));
        } catch (error) {
            throw error; // Propagate the error if needed
        }
    }
    async fetchDrugFromSaleDetails(sale) {
        try {
            const response = await axios.post(route('api.inventory.products.get-prescription-details'), {
                sale_id: sale
            });
            return response;
        } catch (error) {
            throw error;
        }
    }
    
    markColorCode(visit_id, color_code) {
        const data ={
            'visit_id': visit_id,
            'color_code': color_code,
        };
        return this.form.submit('post', route('api.reception.visits.mark-color-codes', visit_id), data)
            .then(function(response) {
                if (response) {
                    flash(response);
                }
            })
            .catch(function(error) {
                console.error('Error:', error);
            });
    }

    // send a payment request to the patient's phone
    async requestClientPayment(visit) {
        let data = {};
        data = {
            amount: visit.amount,
            patient_id: visit.visit.patient,
            mobile_number: visit.mobile_number,
            account_number: this.finsprint_wallet_number,
        };


        const response = await this.form.submit('post', route('api.finance.request.client-payment', 'finsprint'), data);

        if (response) {
            flash(response);
            this.processing_payment = false;
            return response;
        }
    }
    async fetchTransaction(transaction_id = null, phoneNumber = null) {
        const data = {
            transaction_id: transaction_id,
            number: phoneNumber,
            used: false,
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

            return response;
        }
    }

    fetchPatientWalletBalance(patientId) {
        const existing_patient_account = this.form.submit('get', route('api.reception.patients.fetch_existing_wallet_record', patientId));
    
        if (existing_patient_account === 'Wallet exists') {
            return this.form.submit('get', route('api.reception.patients.show_wallet_balance', patientId))
                .then((response) => {
                    // You can perform additional processing on the response if needed
                    return response;
                })
                .catch((error) => {
                    console.error('Error fetching patient wallet balance:', error);
                    throw error; // Propagate the error if needed
                });
        } else {
            // Always return a promise
            return Promise.resolve(0);
        }
    }
    

    async cancelCheckin(visitId) {
        const response = await this.form.submit('post', `/api/reception/visits/${visitId}/cancel`);

        flash(response);

        return response;
    }

    /*
     * Create a visit and essentially have the checkin process executed
     * 0 visits
     * 1 departments
     * 2 admit
     */
    async save(redirect = 1) {
        const data = this.getFieldsExcept(['selectedVisit']);

        const response = await this.form.submit('post', '/api/reception/visits', data);

        if (response['is_wallet_transaction']) {
            this.wallet_message = response['message'];
            this.show_wallet_message = true;
        }
        flash(response);

        let redirection = '';
        if (redirect === 1) {
            redirection = `/reception/visits/${response.visit.id}/${response.redirect_to}`;
        } else if (redirect === 2) {
            redirection = `/inpatient/admission-requests/create?visit_id=${response.visit.id}`;
        } else {
            redirection = '/reception/visits';
        }

        if (response['message']=== 'Patient listed successfully') {
            location.href= redirection;
        }
        return redirection;
    }

    /*
     * update  visit details
     */
    async update() {
        const data = this.getFieldsExcept(['selectedVisit']);

        const response = await this.form.submit('post', `/api/reception/visits/${this.visit_id}/update`, data);


        flash(response);

        return response;
    }

    /*
     * Remove a destination that has already been selected
     */
    removeDestination(item) {
        const index = this.destinations.indexOf(item.slug);

        if (index >= 0) {
            this.destinations.splice(index, 1);
        }
    }

    /**
     * check for the capitation status for the visit
     */
    checkCapitation(visitId) {
        this.form.submit('get', route('api.reception.visits.check-capitation', visitId).relative()).then((response) => {
            this.capitationStatus = response;
        });
    }

    /**
     * check the last visit when a TSC number was used
     *
     * @param tscNumber
     */
    checkLastVisitForTscNumber(tscNumber) {
        this.checkingTscNumber = true;

        this.form.submit('get', route('api.reception.visits.check-tsc-number-last-visit', tscNumber).relative()).then((response) => {
            this.checkingTscNumber = false;

            this.lastTscNumberVisit = response.visit;
        });
    }

    /*
    * change payment mode
    * */
    changeMode(data) {
        this.form.submit('post', route('api.reception.visits.change-mode', data.visit_id), data).then((response) => {
            flash(response);
        });
    }

    async checkoutPatient() {
        const response = await this.form.submit('post', route('api.evaluation.checkout_patient'), this.checkoutData);

        if (response) {
            return response;
        }
    }


    /*
    * re-assemble visit details
    * */
    assemble(visitData) {
        const self = this;

        this.visit_id = visitData.id;

        _.each(visitData.destinations, function(destination) {
            if (destination.destination) {
                self.destinations.push(destination.destination.slug);
            }
        });

        this.visit.payment_mode = visitData.payment_mode;

        visitData.consultants.forEach((consultant) => {
            this.consultants.push({
                name: consultant.consultant_name,
                id: consultant.consultant_id,
                specialty:consultant.specialty
            });
        });

        if (visitData.payment_mode === 'insurance') {
            this.visit.scheme = visitData.scheme_id;
        }

        if (visitData.referring_doctor) {
            this.external_doctor = true;
        }

        if (visitData.visit_pre_charges) {
            this.allowPrePaidProcedures = true;
            this.precharges = visitData.visit_pre_charges;
        }
    }
}
