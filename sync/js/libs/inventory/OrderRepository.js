/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-07-08
 * Time: 17:50
 */

export const fields = {
    orderRequest: {
        user_id: null,
        user_name: null,
        delivery_date: null,
        requesting_facility_identifier: null,
        requesting_facility_name: null,
        items: [],
    },

    dispatch: {
        order_id: null,
        store_id: null,
        user_id: null,
        user_name: null,
        items: [],
    },

    receiveOrders: {
        order_id: null,
        store_id: null,
        items: [], // {remote_product_id: null, quantity: null,}
    },
};

