/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-04-29
 * Time: 15:01
 */

export const wardChangeMixin = {
    methods: {
        getChargesheetChangesForWard(id) {
            return _.filter(this.chargesheetChanges, { visit_ward_id: id });
        },

        updateWard(item) {
            this.obj.item.name = item.ward ? item.ward.name : item.ward_id;
            this.obj.item.type = "ward";

            this.update(item);
        },

        cancelWard(item) {
            flash({ alert: "info", message: "Not Permitted" });
        },

        getChargesheetChangesForRebate(id) {
            return _.filter(this.chargesheetChanges, { visit_rebate_id: id });
        },

        updateRebate(item) {
            this.obj.item.name = "Rebate";
            this.obj.item.type = "rebate";

            this.update(item);
        },

        cancelRebate(item) {
            flash({ alert: "info", message: "Not Permitted" });
        },
    },
};

