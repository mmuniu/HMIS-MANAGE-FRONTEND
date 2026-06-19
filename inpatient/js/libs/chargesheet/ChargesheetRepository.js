/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-04-14
 * Time: 06:11
 * Project: platform
 */

export const fields = {
    visit_id: null,
    patient: null,
    item: {
        type: null, // investigation, prescription, consumable, daily_charge
        id: null,
        name: null,
        old_price: null,
        new_price: null,
        old_quantity: null,
        new_quantity: null,
        old_discount: null,
        new_discount: 0,
        old_amount: null,
        new_amount: null,
        notes: null,
    },

    rebateItem: {
        rebate_id: null,
        quantity: 1,
    },

};

