import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./EmailRepository";

export default class Email extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }
}
