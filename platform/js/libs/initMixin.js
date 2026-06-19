/*
* Checks if a user has permissions to perform an action
* Permissions are stored in the vuex store upon logging in
*/
import { mapGetters } from 'vuex';
import Config from '@core/libs/Config';

export const initMixin = {
    data() {
        return {
            configuration: new Config(),
        };
    },

    computed: {
        ...mapGetters([
            'getUserPermissions', 'getSettings',
        ]),
    },

    methods: {
        config(config) {
            return this.configuration.find(config);
        },

        loadConfigurations() {
            if (this.configurations) {
                this.configuration.fetch(this.configurations);
            }
        },

        can(permission) {
            return Permissions.can(permission);
        },

        msetting(setting) {
            return MSettings.msetting(setting);
        },

        mconfig(config) {
            const configuration = new Config();
            return configuration.find(config);
        },

        route,
    },

    mounted() {
        this.loadConfigurations();
    },
};
