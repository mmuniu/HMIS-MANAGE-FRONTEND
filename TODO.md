# TODO: Modify DirectOrders.vue for Prescription Sending to Suppliers

## Plan
- Add conditional rendering for patient search and prescription selection when `this.msetting('inventory.enable_prescriptions_sending_to_suppliers')` is true.
- Import and use the patient-search component from reception.
- Add data properties for selected patient and prescriptions.
- Implement methods: patientSelected, fetchPrescriptions, prescriptionSelected.
- Add the UI elements: patient search field, prescription select field.

## Steps
1. Import PatientSearch component.
2. Add data properties: selectedPatient, prescriptions, selectedPrescription.
3. Add computed property for the setting check.
4. Add template sections for patient search and prescription select.
5. Implement patientSelected method.
6. Implement fetchPrescriptions method.
7. Implement prescriptionSelected method.
8. Test the functionality.
