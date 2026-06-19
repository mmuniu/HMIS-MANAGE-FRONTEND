
export const fields = {
    suffered_from: [],
    suffered_info: null,
    vaccinations_against: [],
    been_admitted_before: false,
    admission_duration: null,
    admission_reason: null,
    been_operated_on: false,
    operation_details: null,
    smoker_or_alcoholic: false,
    family_history: {
        father: {
            living: true,
            cause_of_death: null,
        },
        mother: {
            living: true,
            cause_of_death: null,
        },
        spouse: {
            living: true,
            cause_of_death: null,
        },
        siblings: {
            living: true,
            cause_of_death: null,
        },
        children: {
            living: true,
            cause_of_death: null,
        },
    },
    occupation_history: [{
            place_of_work: null,
            job: null,
            start_year: null,
            end_year: null,
    }],
    appearance: null,
    hearing: null,
    intelligence: null,
    visual_acuity: {
        rt: null,
        lt: null
    },
    color_visio: {
        rt: null,
        lt: null,
    },
    anaemia: null,
    skin: null,
    glands: null,
    ent: null,
    other_details: null,
    cardiovascular: {
        pulse: null,
        bp: null,
        other: null,
    },
    respiratory: {
        rate: null,
        other: null,
    },
    reflexes: null,
    gutms: null,
    investigations: null,
    recommendations: {
        fit_for_all: false,
        fit_but_subject_to: {
            conditions: null,
            fit: false
        },
        fit_for_specific: {
            conditions: null,
            fit: false
        },
        unfit: false
    }
}
