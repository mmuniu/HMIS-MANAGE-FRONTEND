import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { _ } from "vue-underscore";

const fields = {};

export default class Environment extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.configurations = null;

        this.envConfig = null;
    }

    getEnvConfig() {
        this.form.submit("get", route("api.system.environment.env").relative()).then((response) => {
            this.envConfig = response;
        });
    }

    getOauthConfig() {
        this.form.submit("get", route("api.system.environment.oauth").relative()).then((response) => {
            this.envConfig = response;
        });
    }
}
