import moment from "moment";

export const fields = {
    id: null,
    name: null,
    description: null,
    department_id: null,
    facility_id: null,
    parent_store_id: null,
    can_order_from_suppliers: null,
    can_update_product_prices: null,
    open_only_between: false,
    open_time: moment(new Date()).format("HH:MM"),
    close_time: moment(new Date()).format("HH:MM"),
};
