export const evaluation = {
    prefix: 'evaluation',

    paths: [
        { url: 'treatmentActions', pagination: false },

        { url: 'vitals', pagination: false },
        { url: 'procedures', pagination: false, alias: 'Procedures'},
        { url: 'parent-procedures', pagination: false, alias: 'ParentProcedures'},

        { url: 'investigations', pagination: false },
        { url: 'prescriptions', pagination: false },
        { url: 'procedureCategories', pagination: false },
        { url: 'icd10/note', pagination: false },
        { url: 'variation705/noteMoh', pagination: false },
        { url: 'investigationApprovals', pagination: true },
        { url: 'investigationApprovalStatuses', pagination: false },
        { url: 'investigationResults', pagination: false },
        { url: 'machineResults', pagination: false },
        { url: 'serviceSales', pagination: false },
        { url: 'visitTrends', pagination: false },
        { url: 'facilityVisits', pagination: false },
        { url: 'dailyVisitsTrend', pagination: false },
        { url: 'oldSysData', pagination: false },

        // Setup paths on lab tests
        { url: 'labTestCategories', pagination: false },
        { url: 'labTestUnits', pagination: false },
        { url: 'labTestAdditives', pagination: false },
        { url: 'labTestSampleTypes', pagination: false },
        { url: 'ageGroups', pagination: false },
        { url: 'referenceRanges', pagination: false },
        { url: 'labTestTitles', pagination: false },
        { url: 'testRemarks', pagination: false },
        { url: 'resultDeliveries', pagination: false },
        { url: 'samples', pagination: false },
        { url: 'collectionMethods', pagination: false },
        { url: 'machines', pagination: false },
        { url: 'machine/mappedProcedures', pagination: false },
        { url: 'consumables', pagination: false },

        // Setup paths on graphs
        { url: 'departmentalVisits', pagination: false },
        { url: 'invoice', pagination: false },
        { url: 'revenueDepartments', pagination: false },
        { url: 'resultAnalyticsGroups', pagination: false },

        // sample collections
        { url: 'monthlyCollections', pagination: false },
        { url: 'dailyCollections', pagination: false },
        { url: 'regionalCollections', pagination: false },

        { url: 'sampleCollectionRequests', pagination: false },
        { url: 'selfQuarantinePatients', pagination: false },

        // dosh 13 form
        { url: 'dosh13', pagination: false },

        // systems review
        { url: 'systemsReview', pagination: false},
        // exam review
        { url: 'examinationReview', pagination: false},
        // doc notes
        { url: 'doctorsNotes', pagination: false},
    ],
};