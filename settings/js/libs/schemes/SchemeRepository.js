/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-05-19
 * Time: 11:29
 */

export const fields = {
    exclusions: {},
    scheme_id: null,
    editedExclusion: {
        id: null,
        scheme_id: null,
        price: 0,
        facility_id: null,
        friendly_name: null,
    },

    duplicatedSchemeExclusions: {
        scheme_id: null,
        exclusions: [],
    },

    scheme_data: {
        company: null,
        scheme_id: null,
        name: null,
        type_id: null,
        amount: null,
        capitation_copay_amount: null,
        attention: null,
        effective_date: '',
        expiry_date: '',
        smart_enabled: false,
        compulsory: false,
        gender_restricted: false,
        gender: '',
        age_restricted: false,
        policy_number_compulsory: false,
        age_range: '',
        procuring_officer_name:''
    },

    excel: '',
};

