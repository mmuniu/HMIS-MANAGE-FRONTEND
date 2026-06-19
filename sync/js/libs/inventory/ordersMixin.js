/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-07-15
 * Time: 14:28
 */

import { mapActions, mapGetters } from "vuex";
import Order from "@sync/libs/inventory/Order";
import Facility from "@sync/libs/facilities/Facility";

export const ordersMixin = {
    data() {
        return {
            facilities: null,
            obj: new Order(),
            facilityObj: new Facility(),
            currentFacilityIdentifier: null,
            saveLoader: false,
        };
    },

    computed: {
        ...mapGetters([
            "getSyncFacilities",
        ]),

        initialised() {
            return true;
        },

        submitted() {
            return this.obj.form.submitted;
        },

        errors() {
            return this.obj.form.errors;
        },

        contaminated() {
            return this.obj.form.errorDetected;
        },

        saved() {
            return this.obj.saved;
        },

        actionData() {
            return this.obj.actionData;
        },

        authorizing() {
            return this.facilityObj.authorizing;
        },

        hasAuthorized() {
            return this.facilityObj.hasAuthorized;
        },

        accessToken() {
            return this.facilityObj.accessToken;
        },

    },

    watch: {
        getSyncFacilities(val) {
            if (val) {
                this.setFacilities();
            }
        },

        submitted(val) {
            this.saveLoader = false;
        },

        contaminated(val) {
            if (val) {
                this.saveLoader = false;
                this.obj.form.errorDetected = false;
            }
        },

        saved(val) {
            if (val) {
                this.saveLoader = false;
                this.close();
                this.obj.reset();
                this.obj.saved = false;
                this.initialise();
            }
        },
    },

    methods: {
        ...mapActions([
            "setSyncFacilities",
        ]),

        async getConfig() {
            this.currentFacilityIdentifier = await this.$options.methods.mconfig("sync.config.identifier");

            this.setFacilities();
        },

        setFacilities() {
            if (this.getSyncFacilities && this.getSyncFacilities.data) {
                this.facilities = _.map(this.getSyncFacilities.data, (item) => {
                    const disabled = item.identifier == this.currentFacilityIdentifier;

                    return {
                        name: item.name + " (" + item.identifier + " ~ " + item.url + ")",
                        identifier: item.identifier,
                        id: item.id,
                        url: item.url,
                        token: item.token,
                        disabled: disabled,
                    };
                });
            }
        },

        initialise() {
        },

        close() {
        },
    },

    mounted() {
        this.initialise();
    },
};

