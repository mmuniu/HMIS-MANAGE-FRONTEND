/**
 * base class
 */
export default class Base {
    /**
     *
     * @param fields
     */
    constructor(fields) {
        this.setFields(fields);
    }

    /**
     * Polish the field values so that they are referenced using the this keyword
     * @param fields
     * @param except
     */
    setFields(fields, except = []) {
        for (const field in fields) {
            if (except.indexOf(field) === -1) {
                this[field] = fields[field];
            }
        }
    }

    /**
     * After submitting the form refresh the fields
     * @param fields
     */
    resetFields(fields) {
        for (const field in fields) {
            if (fields[field] instanceof Array) {
                fields[field].splice(0, fields[field].length);
            } else {
                this[field] = fields[field];
            }
        }
    }


    /**
     * Get the data from the fields. This method accepts an entire class' scope and removes any unwanted values
     * @param items
     * @returns {({} & Base)|*}
     */
    getFields(items = []) {
        const data = { ...this };

        delete data.form;
        delete data.search;
        delete data.meta;

        if (items.length > 0) {
            for (const field in data) {
                if (items.indexOf(field) === -1) {
                    delete data[field];
                }
            }
        }

        if (items.length === 1) {
            return data[items[0]];
        }

        return data;
    }

    /**
     * Get the data from the fields. This method accepts an entire class' scope and removes any unwanted values
     * @param trash
     * @returns {{} & Base}
     */
    getFieldsExcept(trash = []) {
        trash.push('form', 'meta');

        const data = { ...this };

        trash.forEach((item) => {
            delete data[item];
        });

        return data;
    }

    /*
    * get the following fields only
    * */
    onlyGet(items = []) {

        const data = { ...this };

        if (items.length > 0) {
            for (const field in data) {
                if (items.indexOf(field) === -1) {
                    delete data[field];
                }
            }
        }

        return data;
    }
    /**
     * Remove errors that were loaded 0 useful when working with vuetify
     * @param errors
     */
    correct(errors) {
        setTimeout(() => {
            errors.clear();
        }, 100);
    }
}
