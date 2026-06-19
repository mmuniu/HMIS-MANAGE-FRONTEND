export const fields = {
    type: "",

    session_id: null,
    nurses:[],
    machine: {
        staff_setting_machine: null,
        temperature: null,
        conductivity: null,
        dialysis_pressure: null,
        rejection_rate: null,
        no_blood_leak: false,
        no_air_detection: false,
        is_tmp_on: false,
    },

    vascular: {
        membrane_type: null,
        access_id: null,
        position: null,
        bruit: null,
        bruising: null,
        aneurysm: null,
        swelling: null,
        redness: null,
        clotted: null,
        heparin: null,
        is_temporary: null,
        dressing_done: null,
        primer: null,
        solution: null,
        dialyzer: null,
        bath_salts: null,
    },

    patient: {
        pre_dialysis_weight: null,
        dry_weight: null,
        has_chest_pains: null,
        high_blood_pressure: null,
        dyspnoea: null,
        coughing: null,
        fluid_overload: null,
        dry_mouth: null,
        nausea: null,
        vomiting: null,
        ascites: null,
        muscle_weakness: null,
        cramps: null,
        headache: null,
        insomnia: null,
    },
    //
    // heparinization: {
    //     coagulation_options: [],
    //     doses: [],
    // }
};