import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './ConfigRepository';
import { visa } from '@app/libs/Customs';

export default class Config extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.configs = null;
    }

    /*
     * Get the configuration from fetched dataset - convert to array
     */
    async find(config) {
        if (! this.configs) {
            await this.fetch(config);
        }

        if (this.configs && this.configs.hasOwnProperty(config)) {
            return this.configs[config];
        }

        return null;
    }

    /*
     * fetch a config
     */
    async fetch(config) {
        if (! Array.isArray(config)) {
            config = [config];
        }

        await this.form.submit('post', '/api/system/configs', { config }).then(({ config }) => {
            this.configs = config;
        });

        return this.configs;
    }

    /*
     * get a config
     */
    async get(config) {
        let resp;

        await this.form.submit('get', route('api.system.configurations.show', config).relative()).then((response) => {
            resp = response;
        });

        return resp;
    }
}
