/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-04-08
 * Time: 11:55
 * Project: platform
 */

/**
 * Get user permissions to be used in front-end. Backend validation must be applied to dissuade abuse
 */

import { permissionsKey } from '@app/libs/Util';

window.Permissions = new class {
    constructor() {
        this.userPermissions = null;

        if (window.localStorage.hasOwnProperty(permissionsKey)) {
            const perms = window.localStorage.getItem(permissionsKey);
            this.userPermissions = JSON.parse(JSON.parse(perms));
        }
    }

    /**
     * define a function to check user permissions
     */
    can(permission) {
        if (this.userPermissions && this.userPermissions.length > 0) {
            return this.userPermissions.indexOf(permission) > -1;
        }

        return false;
    }

    /**
     *  update user permissions after an update
     */
    updatePermissions() {
        this.userPermissions = JSON.parse(JSON.parse(window.localStorage.getItem(permissionsKey)));
    }

    flushPermissions() {
        window.localStorage.removeItem(permissionsKey);
        this.userPermissions = null;
    }
}();
