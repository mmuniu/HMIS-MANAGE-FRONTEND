export const fields = {
    ordered_by: null,
    dispatching_store: null,
    requesting_store: null,
    delivery_date: null,
    items: [],

    meta: {
        headers: [
            { text: 'Product name', value: 'name', sortable: false },
            { text: 'Quantity', value: 'quantity', sortable: false },
            { text: 'Actions', value: 'actions', sortable: false },
        ],

        delivery_date: false,
        in_cart: { alert: 'info', message: 'Item already exists in list' },
        selectedProduct: null,
    },
};
