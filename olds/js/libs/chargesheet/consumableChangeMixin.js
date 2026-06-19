/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-04-29
 * Time: 15:01
 */

export const consumableChangeMixin = {
    methods: {
        getChargesheetChangesForConsumable(id) {
            return _.filter(this.chargesheetChanges, { consumable_id: id });
        },

        updateConsumable(item) {
            this.obj.item.name = item.product ? item.product.name : item.product_id;
            this.obj.item.type = "consumable";

            this.update(item);
        },

        cancelConsumable(item) {
            this.obj.item.name = item.product ? item.product.name : item.product_id;
            this.obj.item.type = "consumable";

            this.cancel(item);
        },
    },
};

