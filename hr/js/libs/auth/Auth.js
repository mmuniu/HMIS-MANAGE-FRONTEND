/**
 * Created by PhpStorm.
 * User: Lexx YungCarter
 * Date: 01/11/2018
 * Time: 14:00
 * Project: platform
 */

import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from "./AuthRepository";


export default class Auth extends Base {

    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.clinic = null;

        this.user = null;

        this.passport = null;

        this.checkUser();
    }

    login()
    {
        let data = this.getFieldsExcept(['form']);

        this.form.submit('post', route('api.users.authenticate'), data).then(response => {
            this.passport = response;
            this.user = response.user;
        });
    }

    logout()
    {
        this.form.submit('get', route('public.logout')).then(response => {
            this.user = null;

            flash(response);
        });
    }

    checkUser() {
        let tokenData = JSON.parse(window.localStorage.getItem('immigrant'));

        if(tokenData && tokenData.user)
        {
            this.user = tokenData.user;
        }
    }


}

