import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './VisitDestiantionRepository';

export default class Visit extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Facilitate the changing of a destination
     */
    switchDestinations() {
        const data = this.getFields(['visitId', 'change']);

        this.form.submit('post', '/api/reception/change-destination', data).then((response) =>{
            flash(response);
        });
    }

    /**
     * add destination(s) to a visit
     */
    addDestinations() {
        const data = this.getFields(['visitId', 'add', 'consultants']);

        this.form.submit('post', route('api.reception.add-destinations').relative(), data).then((response) =>{
            flash(response);
        });
    }
}
