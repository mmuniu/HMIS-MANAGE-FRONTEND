/**
 * Created by: jjoek
 * On:  07 Oct, 2021
 */
import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from './SpineRepository';

export default class Spine extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    async save () {
        const data =  this.getFieldsExcept(["form"]);

        const response = await this.form.submit('post', `/api/evaluation/spine-screening-form`, data)

        if(response) {
            flash(response);

            return response;
        }
    }

    assemble(previous) {
       if(Object.keys(previous).length > 0) {
           this.suffer_headaches = previous.suffer_headaches
           this.suffer_backaches = previous.suffer_backaches
           this.suffer_stiffness = previous.suffer_stiffness
           this.painful_joints = previous.painful_joints
           this.any_surgeries = previous.any_surgeries
           this.does_exercises = previous.does_exercises
           this.which_exercises = previous.which_exercises
       }
    }
}
