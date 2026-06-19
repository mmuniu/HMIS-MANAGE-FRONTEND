/**
 * Created by: jjoek
 * On:  07 Nov, 2020
 */
export const fields = {
    residence:null,

    gastrointestinal: {
        nausea: false, vomiting: false, heartburn: false, food_sticking_in_throat: false,
        pain_swallowing: false, vomiting_blood: false, black_stool: false, red_blod_in_stool: false,
        abdominal_pain: false, constipation: false, diarrhea: false, loss_of_appetite: false,
        early_satiety: false, bloating: false
    },

    heent: {
        sore_throat: false, horseness: false
    },

    cardiovascular: {
        abnormal_heart_rhythm: false, chest_pain: false, palpitations: false
    },

    respiratory: {
        cough: false, shortness_of_breath_at_exertion: false, shortness_of_breath_at_rest: false, wheezing: false
    },

    neurological: {
        seizures: false, headaches: false,
    },

    dermatology: {
        rash: false,
    },

    musculoskeletal: {
        joint_pain: false, arthritis: false
    },

    psychiatric: {
        dementia: false, depression: false, anxiety: false
    },

    constitutional: {
        recent_weight_gain: {
            status: false,
            label: '# of pounds',
            value: null,
        },
        recent_weight_loss: {
            status: false,
            label: '# of pounds',
            value: null,
        },
        fever: false, fatigue: false,
    },

    genitourinary: {
        frequent_urination: false, kidney_failure: false, painful_urination: false,
        date_of_last_menstrual_period: {
            label: '',
            value: null
        }
    },

    blood_thinners: false,

    current_medications:  [],

    medical_history: {
        ascites: false, asthma: false, bleeding_disorder: false,
        cancer: {
            label: 'What type',
            status: false,
            value: null,
        },
        congestive_heart_failure: false, coronary_artery_disease: false, depression: false, diabetes: false,
        copd: false, endometriosis: false, gallstones: false, heart_arrythmia: false, heart_attack: false,
        hepatitis: false, high_blood_pressure: false, kidney_failure: false, kidney_stones: false,
        liver_disease: false, migraine_headaches: false, pancreatitis: false, peripheral_vascular_disease: false,
        rheumatic_fever: false, seizures: false, sleep_apnea: false, stomach_ulcer: false, stroke: false,
        typhoid_disease: false, vascular_heart_disease: false,
    },

    drug_allergies: [],

    surgical_history: {
        abdominal_surgery: {
            status: false,
            label: 'What type',
            value: null,
        },
        appendectomy: false,
        cancer_surgery: {
            status: false,
            label: 'What type',
            value: null,
        },
        coronary_artery_bypass: false, coronary_stent: false,
        cosmetic_surgery: {
            status: false,
            label: 'What type',
            value: null,
        },
        defibrillator: {
            status: false,
            label: 'A copy of the card (required)',
            value: null,
        },
        gallbladder_removal: false, heart_valve_replacement: false, hermohoid_removal: false,
        hip_shoulder_knee_replacement_within_1_year: false,
        hysterectomy: false, laparoscopy: false,  pacemaker: false,
        salpingoophorectomy: false, tonsillectomy: false, vascullar_bypass: false,
    },

    hospitalizations: null,

    family_medical_history: {
        colon_cancer: {
            status: false,
            label: 'If not this patient, please indicate the relative and the age',
            value: null,
        },
        colon_polyps: {
            status: false,
            label: 'If not this patient, please indicate the relative and the age',
            value: null,
        },
        ibd: {
            status: false,
            label: 'If not this patient, please indicate the relative and the age',
            value: null,
        },
        cancer_of_endometrial: {
            status: false,
            label: 'If not this patient, please indicate the relative and the age',
            value: null,
        },
        cancer_of_esophagus: {
            status: false,
            label: 'If not this patient, please indicate the relative and the age',
            value: null,
        },
        cancer_of_kidney: {
            status: false,
            label: 'If not this patient, please indicate the relative and the age',
            value: null,
        },
        cancer_of_ovarian: {
            status: false,
            label: 'If not this patient, please indicate the relative and the age',
            value: null,
        },
        cancer_of_pancreas: {
            status: false,
            label: 'If not this patient, please indicate the relative and the age',
            value: null,
        },
        cancer_of_small_bowel: {
            status: false,
            label: 'If not this patient, please indicate the relative and the age',
            value: null,
        },
        cancer_of_stomach: {
            status: false,
            label: 'If not this patient, please indicate the relative and the age',
            value: null,
        },
    },

    social_history: {
        marital_status: null,
        children: {
            status: false,
            details: null,
        },
        use_of_alcohol: {
            status: false,
            details: null
        },
        use_of_tobacco: {
            status: false,
            details: null
        },
        employer_and_occupation: null,
    }
}
