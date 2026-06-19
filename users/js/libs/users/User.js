/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-07-15
 * Time: 13:42
 */


import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
// import { fields } from './UserRepository';
const fields = {};

export default class User extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.users = null;

        this.saved = false;

        this.selected = null;
    }

    getLoggedInUser() {
        const url = route("api.users.logged-in-user").relative();

        this.form.submit("get", url).then((response) => {
            this.selected = response.data;
        });
    }

    async updateSignature(user_id) {
        const data = this.getFields("patient_signature");

        const response = await this.form.submit("post", `/api/users/${user_id}/update-signature`, data);

        flash(response);

        return response;
    }
};

