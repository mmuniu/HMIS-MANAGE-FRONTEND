export const fields = {
    cash: {
        amount: 0
    },
    mpesa: {
        code: null,
        amount: 0,
        mobile_number: null, // using this for stk push
        amount_to_pay: null,
        msisdn: null, // use this to search for already made payments
        transactions: []
    },
    pesa_pal_mpesa: {
        code: null,
        amount: 0,
        mobile_number: null, // using this for stk push
        amount_to_pay: null,
        msisdn: null, // use this to search for already made payments
        transactions: []
    },
    wallet: {
        code: null,
        amount: 0,
        mobile_number: null, // using this for stk push
        amount_to_pay: null,
        msisdn: null, // use this to search for already made payments
        transactions: [],
        wallet_account_amount: null,
        wallet_number:null
    },
    cheque: {
        name: null,
        amount: 0,
        bank_id: null,
        bank_branch: null,
        date: '',
        number: null,
    },
    card: {
        name: null,
        amount: 0,
        number: null,
        authorisation_code:null,
        receipt_number:null
    },

    pesa_pal_card: {
        name: null,
        amount: 0,
        number: null,
        authorisation_code:null,
        receipt_number:null
    },

    patientAccount: {
        amount: 0,
        balance: 0
    },
    giftCardAccount: {
        amount: 0,
        balance: 0
    },

    giftcard: {
        amount: 0
    },
    insurance: {
        scheme: null,
        amount: null
    },

    jamboPay: {
        amount: null
    },
    selected: [],
    total_amount: 0,
    paid_amount: 0,
    percentage_discount: null,
    total_cost: 0,
    discounted_amount: 0,
    reason_for_discount: null,
    discount_reason: null,
    patient_id: null,
    internal_payment: true,
    forInpatient: false,
    verification_code: null,
    loading: false,
    processing_payment: false
};
