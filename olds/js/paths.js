export const inpatient = {
    prefix: 'inpatient',

    paths: [
        { url: 'admissionRequests', pagination: true },
        { url: 'admissionTypes', pagination: false },
        { url: 'admissions', pagination: true },
        { url: 'wards', pagination: false },
        { url: 'admissionPerWard', pagination: false },
        { url: 'patientDischarges', pagination: false },
        { url: 'partialBreakdowns', pagination: false },
    ],
};
