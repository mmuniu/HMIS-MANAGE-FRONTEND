export default class Errors {
    constructor(fields) {
        this.errors = this.setErrors(fields);
    }

    /*
        * Set the errors variable and initialise it to have the fields required
        * This is done because of Vue's reactivity issues when finding uninitialised data
        */
    setErrors(fields) {
        const errors = {};

        for (const field in fields) {
            errors[field] = '';
        }

        return errors;
    }

    any() {
        for (const field in this.errors) {
            if (this.errors[field]) {
                return true;
            }
        }

        return false;
    }

    /*
    * Checks if the errors object has a certain field
    */
    has(field) {
        if (this.errors[field]) {
            return true;
        }

        return false;
    }

    /*
    * Return an errors property if it exists within the errors object
    */
    get(field) {
        return this.has(field) ? this.errors[field] : '';
    }

    /**
     * manually set an error
     * error: {field: '', message: ''}
     */
    add(error) {
        const vueEnabled = window.Vue;

        if (vueEnabled) {
            window.Vue.set(this.errors, error.field, error.message);
        } else {
            this.errors[error.field] = error.message;
        }
    }

    /*
    * clear the field from errors
    */
    clear(field) {
        if (field) {
            this.errors[field] = '';
        } else {
            this.errors = {};
        }
    }

    /*
    * Record the errors into the errors object
    */
    record(errors) {
        errors = errors.errors;
        const vueEnabled = window.Vue;

        for (const error in errors) {
            if (vueEnabled) {
                window.Vue.set(this.errors, error, errors[error][0]);
            } else {
                this.errors[error] = errors[error][0];
            }
        }
    }

    /**
     * display all errors in a <ul>
     */
    display() {
        let str = '';

        if (this.any()) {
            str += '<ul>';

            for (const field in this.errors) {
                if (this.errors[field]) {
                    str += `<li>${this.errors[field]}</li>`;
                }
            }

            str += '</ul>';
        }

        return str;
    }
}
