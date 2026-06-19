import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './AppointmentsRepository';

export default class Visit extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Store the data into persistence
     */
    async save() {
        const data = this.getFields();

        const response = await this.form.submit('post', route('api.reception.appointments.store'), data);

        if (response) {
            flash(response);

            return response;
        }
    }

    async destroyAppointment(appointment) {
        const response = await this.form.submit('delete', route('api.reception.appointments.destroy', appointment.id));

        if (response) {
            flash(response);

            return response;
        }
    }

    /*
     * Store the data into persistence
     */
    async updateAppointment(id) {
        const data = this.getFields();

        const response = await this.form.submit('post', route('api.reception.appointments.update', id), data);

        if(response) {
            flash(response);

            return response;
        }
    }

    destroy(remark_id) {
        this.form.submit('delete', route('api.evaluation.test-remarks.destroy', remark_id))
            .then((response) => {
                flash(response);
            });
    }

    editAppointment(appointment) {
        if (appointment) {
            this.ext_patient = appointment.ext_patient;
            this.patient_id = appointment.patient_id;
            this.doctor_id = appointment.doctor_id;
            this.category_id = appointment.category_id;
            this.clinic = appointment.clinic;
            this.schedule_date = appointment.scheduled_date;
            this.instructions = appointment.instructions;
        }
    }
}
