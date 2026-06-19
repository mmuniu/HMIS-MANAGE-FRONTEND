/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-05-31
 * Time: 22:45
 */


/**
 * Get user permissions to be used in front-end. Backend validation must be applied to dissuade abuse
 */

import { settingsKey } from '@app/libs/Util';
import _ from 'lodash';

window.MSettings = new class {
    constructor() {
        this.settings = null;

        if (window.localStorage.hasOwnProperty(settingsKey)) {
            const msets = window.localStorage.getItem(settingsKey);
            this.settings = JSON.parse(msets);
        }
    }

    get() {
        this.form.submit('get', route('api.system.settings').relative()).then((response) => {
            this.settings = response;
        });
    }

    save() {
        window.localStorage.setItem(settingsKey);
    }

    /**
     * define a function to check module settings
     */
    msetting(setting) {
        if (this.settings && this.settings.length > 0) {
            const found = _.find(this.settings, { name: setting });
            return found ? found.value : false;
        }

        return false;
    }

    /**
     *  update settings after an update
     */
    updateSettings() {
        this.settings = JSON.parse(window.localStorage.getItem(settingsKey));
    }

    flushSettings() {
        window.localStorage.removeItem(settingsKey);
        this.settings = null;
    }
}();
