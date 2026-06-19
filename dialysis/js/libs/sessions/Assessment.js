import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./AssessmentRepository";

export default class Assessment extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Save machine checking details before a dialysis session
     */
    save() {
        const data = this.getFields();

        this.form.submit("post", `/api/dialysis/assess/${this.type}`, data);
    }

    /*
     * Returns a heparinization template
     */
    // heparinizationTemplate(){
    //     let identifier = Math.random().toString(36).substring(10);
    //
    //     return {
    //         heparin: null,
    //         loading_dose: null,
    //         units: null,
    //         identifier
    //     };
    // }
}
