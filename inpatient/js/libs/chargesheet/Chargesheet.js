/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-04-14
 * Time: 06:10
 * Project: platform
 */

import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './ChargesheetRepository';


export default class Chargesheet extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.chargesheetData = null;

        this.saved = false;
    }

    /**
     * get chargesheet particulars
     *
     * @param visitId
     */
    get(visitId) {
        this.form.submit('get', route('api.inpatient.chargesheet.edit', visitId).relative()).then((response) => {
            this.chargesheetData = response.data;

            this.visit = response.data.visit;

            this.patient = response.data.visit.patient;
        });
    }

    /**
     * update price for the selected investigation/procedure/consumable/prescription/daily-charge/ward
     */
    update() {
        const data = this.getFieldsExcept(['visit', 'saved', 'form', 'chargesheetData', 'patient']);
        data.visit_id = this.visit.id;
        this.saved = false;

        this.form.submit('post', route('api.inpatient.chargesheet.update', this.visit.id).relative(), data).then((response) => {
            this.saved = true;

            flash(response);
        });
    }

    /**
     * cancel the selected investigation/procedure/consumable/prescription/daily-charge/ward
     */
    cancel() {
        const data = this.getFieldsExcept(['visit', 'saved', 'form', 'chargesheetData', 'patient']);
        data.visit_id = this.visit.id;
        this.saved = false;

        this.form.submit('post', route('api.inpatient.chargesheet.cancel', this.visit.id).relative(), data).then((response) => {
            this.saved = true;

            flash(response);
        });
    }

    addVisitRebate() {
        const data = this.getFields(['rebateItem']);

        data.visit_id = this.patientVisitId ? this.patientVisitId : this.visit.id;

        data.added_from_chargesheet = true;

        this.saved = false;

        this.form.submit('post', route('api.inpatient.chargesheet.add-rebate', data.visit_id).relative(), data).then((response) => {
            this.saved = true;

            flash(response);
        });
    }

    /*
    * reduce prescribed quantities for drugs for discharge
    * */
    updatePrescription(item) {
        this.form.submit('post', route('api.inpatient.chargesheet.reduce-prescriptions', this.visit.id).relative(), item).then((response) => {
            this.saved = true;

            flash(response);
        });
    }

    /*
    * update daily charge from the daily chargesheet
    * */
    async updateDaysCharge(charge, date, visit_id) {
        const data ={
            charge: charge,
            date: date,
        };

        const response = await this.form.submit('post', `/api/inpatient/chargesheet/visit/${visit_id}/update-days-charges`, data);

        if (response) {
            flash(response);

            return response;
        }
    }

    /*
    * update daily charge from the daily chargesheet
    * */
    async removeFromChargeSheet(charge, date, visit_id) {
        const data ={
            charge: charge,
            date: date,
        };

        const response = await this.form.submit('post', `/api/inpatient/chargesheet/visit/${visit_id}/remove-from-chargesheet`, data);

        if (response) {
            flash(response);

            return response;
        }
    }


    async finalizeChargesheet(visit_id) {
        const response = await this.form.submit('post', `/api/inpatient/chargesheet/visit/${visit_id}/finalize-chargesheet`);

        if (response) {
            flash(response);

            return response;
        }
    }

    async verifyDaysCharges(visitId, day) {
        const data = {
            day: day,
        };
        const response = await this.form.submit('post', `/api/inpatient/chargesheet/visit/${visitId}/verify-bills`, data);

        if (response) {
            flash(response);

            return response;
        }
    }

    /*
    * make changes to rebates
    * */
    async rebateChangesMade(rebate) {
        const response = await this.form.submit('post', '/api/inpatient/chargesheet/edit-rebate', rebate);

        if (response) {
            flash(response);

            return response;
        }
    }


    // record bill breakdown
    async recordBreakDowns(breakdowns, visit_id, invoice) {
        const data = {
            breakdowns: _.map(breakdowns, function(breakdown) {
                return {
                    company_id: breakdown.company_id,
                    scheme_id: breakdown.scheme_id,
                    amount: breakdown.amount,
                    by_patient: breakdown.by_patient,
                };
            }),
            invoice: invoice,
        }

        const response = await this.form.submit('post', `/api/inpatient/chargesheet/visit/${visit_id}/bill-breakdown`, data);

        if (response) {
            flash(response);

            return response;
        }
    }


    // record bill breakdown
    async deleteBreakdown(id) {
        const response = await this.form.submit('post', `/api/inpatient/chargesheet/bill-breakdown/${id}/delete`);

        if (response) {
            flash(response);

            return response;
        }
    }


    // delete rebate
    async deleteRebate(rebate) {
        const response = await this.form.submit('post', '/api/inpatient/chargesheet/delete-rebate', rebate);

        if (response) {
            flash(response);

            return response;
        }
    }

    /**
     * reset selected entity
     */
    reset() {
        this.item.name = null;
        this.item.id = null;
        this.item.new_price = null;
        this.item.new_quantity = null;
        this.item.new_discount = null;
        this.item.new_amount = null;

        this.rebateItem.rebate_id = null;
        this.rebateItem.quantity = 1;
    }
}


