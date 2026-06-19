/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-04-29
 * Time: 15:03
 */

export const investigationChangeMixin = {
    methods: {
        getChargesheetChangesForInvestigation(id) {
            return _.filter(this.chargesheetChanges, { investigation_id: id });
        },

        updateProcedure(item) {
            this.obj.item.name = item.procedures ? item.procedures.name : item.procedure;
            this.obj.item.type = "investigation";

            this.update(item);

            this.dialog = true;
        },
    },
};

