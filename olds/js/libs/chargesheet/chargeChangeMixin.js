/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-04-29
 * Time: 15:01
 */

export const chargeChangeMixin = {
    methods: {
        getChargesheetChangesForCharge(id) {
            return _.filter(this.chargesheetChanges, { visit_charge_id: id });
        },

        updateCharge(item) {
            this.obj.item.name = "";

            if (item.charge && item.charge.type === "recurring") {
                this.obj.item.name += "[RECURRING] ";
            }

            this.obj.item.name += item.charge ? item.charge.name : item.charge_id;
            this.obj.item.type = "charge";

            this.update(item);
        },

        cancelCharge(item) {
            this.obj.item.name = item.charge ? item.charge.name : item.charge_id;
            this.obj.item.type = "charge";

            this.cancel(item);
        },
    },
};

