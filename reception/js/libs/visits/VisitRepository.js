export const fields = {
    external_doctor: null,
    consultants: [],
    allowPrePaidProcedures: true,
    proceduresWithDoctors: [],
    visit: {
        patient: null,
        user: null,
        clinic: null,
        payment_mode: "cash",
        scheme: null,
        referring_doctor: null,
        purpose: null,
        wallet_number: null,
        schemeId:null,
        patient_scheme_id:null
    },
    mpesa: {
        code: null,
        amount: null,
        mobile_number: null, // using this for stk push
        amount_to_pay: null,
        msisdn: null, // use this to search for already made payments
        transactions: [],
        wallet_number: null
    },
    amount:null,
    mobile_number:null,
    precharges: [

    ],

    destinations: [],
    lastVisitMeta:[],
    checkoutData: {
        id: null,
        from: null
    }
};
