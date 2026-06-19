export const fields = {
    signature: null,
    employer: {
        name: null,
        mobile: null,
        contact: null,
    },
    symptoms: {
        fever: false,
        cough: false,
        sore_throat: false,
        shortness_of_breath: false,
        chills: false,
        diarrhoea: false,
        nausea: false,
        others: null,
    },
    travel: {
        country: null,
        date: null,
        time: null,
    },
    testing_reason: {
        general_screening: false,
        recent_travel: false,
        outbound_passenger: false,
        hospitality_staff: false,
        health_care_worker: false,
        truck_driver: false,
        quarantined: false,
        contact_with_positive: false,
    }
}
