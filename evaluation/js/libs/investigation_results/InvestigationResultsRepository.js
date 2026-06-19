export const fields = {
    patient_tests: [],
    investigation_id: null,
    visit: null,
    user: null,
    procedure_info: null,

    retract_results_dialog: false,
    rejection_reason: null,

    edit_result_dialog: false,
    resultBeingEdited: null,

    email: {
        send_to_patient: false,
        recipients: [],
        visit_id: null,
        investigation_id: null,
        withoutLetterHead: false,
    },
    email_result_dialog: false,
    review_investigation_modal:false,
    review_comments: null,
    loading: false,
    emailing_partial: {
        selected_institution: null,
        emailToDoctorInInstitution: false,
        institution_staff: [],
        selected_doctor: null,
        extra_personnel: null,
    },

    lessGreater: [
        { text: "Less than", value: "<" },
        { text: "Greater than", value: ">" },
        { text: "Less than/Equal to", value: "<=" },
        { text: "Greater than/Equal to", value: ">=" },
    ],
};
