export const fields = {
    patient_id: null,
    starting_on: null,
    days: null,
    place: null,

    assessment: {
        total_score: 0,
        infrastructure: {
            working_phone: {
                condition: false,
                score: 3
            },
            other_means_to_rapid_communicate: {
                condition: false,
                score: 1
            },
            potable_water: {
                condition: false,
                score: 10
            },
            sewerage_system: {
                condition: false,
                score: 1
            },
            cooking_source: {
                condition: false,
                score: 2
            },
            operable_power: {
                condition: false,
                score: 1
            },
            ventilated: {
                condition: false,
                score: 5
            },
            total_score: 0,
        },
        accessibility: {
            adequate_locks: {
                condition: false,
                score: 1
            },
            easy_to_open_accesses: {
                condition: false,
                score: 5
            },
            total_score: 0,
        },
        accommodation: {
            separate_room: {
                condition: false,
                score: 30
            },
            accessible_bathroom: {
                condition: false,
                score: 10
            },
            total_score: 0,
        },
        resources: {
            is_food_available: {
                condition: false,
                score: 5
            },
            medications_available: {
                condition: false,
                score: 5
            },
            surgical_masks_available: {
                condition: false,
                score: 3
            },
            face_masks_contacts: {
                condition: false,
                score: 2
            },
            gloves_for_care_givers: {
                condition: false,
                score: 2
            },
            hand_hygiene_available: {
                condition: false,
                score: 3
            },
            disinfectants_available: {
                condition: false,
                score: 3
            },
            total_score: 0,
        },
        primary_care: {
            designated_care_giver: {
                condition: false,
                score: 5
            },
            access_to_medical_advice: {
                condition: false,
                score: 3
            },
            any_other_persons_at_risk: {
                condition: false,
                score: -10
            },
            total_score: 0,
        },
        lab_confirmations: {
            is_positive: true,
            asymptomative: false,
            absence_comorbidities: true,
            acsess_to_suitable_hbc_home: true
        }
    },

    as_health_worker: {
        status: false,
        comments: null,
        approve_msg: null,
    },
    as_public_health_dir: {
        status: false,
        comments: null,
        approve_msg: null,
    }
};
