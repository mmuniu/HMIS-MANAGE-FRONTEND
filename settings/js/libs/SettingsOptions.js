import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { _ } from "vue-underscore";

const fields = {};

export default class Patient extends Base {
    
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.configurations = null;

        this.envConfig = null;
    }

    /*
     * Get a configuration from the database
     */
    config(configs) {
        this.configurations = null;

        let url = "/api/settings/options?configs=";

        configs.forEach((config) => {
            url = `${url}${config},`;
        });

        this.form.submit("get", url).then((response) => {
            this.configurations = response;
        });
    }
}
