export const fields = {
    pos_data: {
        total_cost: 0,
        internal: null,
        customer_data: {
            type: null,
            staff_id: null,
            patient_id: null,
            visit_id: null,
            use_insurance: null,
            scheme: null,
            customer_identifier: null,
            mobile: null,
            email: null,
            insurance_provider: null,
            insurance_company:null,
            corporate_id:null,
            has_insurance: null,
            patient_data: {
                first_name: null,
                middle_name: null,
                last_name: null,
                age: null,
                age_in: null,
                mobile: null,
                gender:null
            },
        },
        services: [
            {
                id: null,
                name: null,
                category: null,
                initial_price: null,
                units: 1,
                price: null,
                comments: null,
                on_credit: false,
            },
            {
                id: null,
                name: null,
                category: null,
                initial_price: null,
                units: 1,
                price: null,
                comments: null,
                on_credit: false,
            },
        ],
        drugs: [
            {
                id: null,
                name: null,
                route: null,
                frequency: 1,
                dosage: 1,
                duration: null,
                measure: null,
                quantity: null,
                orderable_quantity: null,
                selling_price: null,
                amount: null,
                total: null,
                product_id: null,
                product_type: null,
                on_credit: false,
                dispensable_amount:null,
                unit_of_measurement:null,
                store_id:null
            }

        ],
        items: [
            {
                id: null,
                name: null,
                quantity: null,
                orderable_quantity: null,
                product_id: null,
                selling_price: null,
                amount: null,
                total: null,
                on_credit: false,
                store_id:null
            },

        ],
        nextItemIndex: 0

    },
    customer_types: [
        {
            name: 'Walkin customer',
            value: 'walkin'
        },
        {
            name: 'Identifiable customer (by mobile, name or email)',
            value: 'identied_walkin'
        },
        {
            name: 'Customer is an employee',
            value: 'staff'
        },
        {
            name: 'Customer is insurance/corporate',
            value: 'corporate'
        },
        {
            name: 'Customer is an existing patient',
            value: 'existing_patient'
        },
        {
            name: 'Customer is a new patient',
            value: 'new_patient'
        },
    ]
}
