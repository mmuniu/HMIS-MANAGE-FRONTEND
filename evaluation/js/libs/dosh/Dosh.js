import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from './DoshRepository';

export default class Dosh extends Base
{
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
    * save data
    * */
    async saveData(type, visitId) {
        const data = this.onlyGet([type]);

        const response = await this.form.submit('post', route('api.evaluation.dosh13.store', visitId), data);

        if(response) {
            flash(response);

            return response;
        }
    }

    assemble(val) {
        const jsons = [
            'suffered_from', 'vaccinations_against', 'family_history', 'occupation_history', 'visual_acuity',
            'color_visio', 'cardiovascular', 'respiratory', 'recommendations'
        ];

        _.each(val, (value, key) => {
            if(value !== null) {
                if(jsons.includes(String(key)) && value != null) {
                    if((!Array.isArray(val[key]) && val[key] == null)) {
                        this[key] = [];
                    } else {
                        this[key] = val[key];
                    }
                } else {
                    this[key] = val[key];
                }
            }
        });
    }

}
