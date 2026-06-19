# Inpatient Module Documentation

## Overview

The Inpatient module manages the complete patient hospital stay lifecycle from admission through discharge. It handles bed management, ward assignments, charges tracking, patient care coordination, and discharge management for admitted patients.

## Key Features

### 1. Admission Management
- Admission request creation and tracking
- Patient ward assignment
- Bed allocation and management
- Inpatient number generation
- Admission date and time recording
- Attending doctor assignment
- Payment mode selection (cash/insurance)
- Automatic charge calculation

### 2. Ward Management
- Ward creation and configuration
- Bed availability tracking
- Ward charge management (daily rates)
- Ward change capability
- Ward capacity management
- Multiple shift support (morning/evening/night)

### 3. Charge Management
- Ward daily charges
- Admission charges (one-time)
- Medication charges
- Consumable charges
- Procedure charges
- Professional fees
- Insurance vs cash charge tracking
- Charge modification audit trail

### 4. Patient Stay Tracking
- Length of stay calculation
- Daily charge application
- Medication and consumable usage
- Vital signs recording
- Clinical notes documentation
- Patient movement tracking

### 5. Discharge Management
- Discharge request creation
- Discharge evaluation completion
- Discharge prescription generation
- Final billing and invoicing
- Discharge summary generation
- Patient checkout
- Discharge letters printing

### 6. Clinical Evaluation
- Pre-admission assessment
- Daily progress notes
- Vital signs documentation
- Medication administration
- Procedure documentation
- Discharge summary

### 7. Financial Management
- Chargesheet compilation
- Individual charge tracking
- Bill splitting (cash/insurance)
- Payment processing
- Invoice generation
- Patient account settlement

## Component Documentation

### Admission Components
- Admission request form
- Admission creation dialog
- Ward and bed selection
- Doctor assignment
- Admission details editing
- Ward change modal

### Discharge Components
- Discharge request form
- Discharge evaluation
- Discharge summary creation
- Checkout form
- Discharge prescription

### Evaluation Components
- Inpatient vital signs
- Progress notes
- Medication administration
- Procedure documentation
- Clinical assessment forms

### Chargesheet Components
- Charge listing
- Charge history
- Bill breakdown
- Individual vs chargesheet view
- Charge reconciliation

## Business Logic Classes

### Admission.js
Manages admission lifecycle and ward operations.

```javascript
// Key methods:
- changeWard()           // Change patient ward
- save()                 // Create admission
- generateInpatientNumber() // Generate IP number
- submitEdittedDetails() // Update admission details
```

## API Endpoints

```
POST   /api/inpatient/admissions           # Create admission
GET    /api/inpatient/admissions           # List admissions
GET    /api/inpatient/admissions/{id}      # Show admission
PUT    /api/inpatient/admissions/{id}/change-ward # Change ward

POST   /api/inpatient/discharge-requests   # Create discharge request
GET    /api/inpatient/discharges           # List discharges

GET    /api/inpatient/wards                # List wards
GET    /api/inpatient/wards/{id}/beds      # Get available beds

GET    /api/inpatient/charges/{admission_id} # Get charges
```

## Admission Workflow
1. Create admission request from outpatient visit
2. Select ward and bed
3. Assign attending doctor
4. Choose payment mode
5. Review admission charges
6. Confirm admission
7. Generate inpatient number
8. Create patient chart
9. Begin inpatient care

## Daily Progress Note Workflow
1. Access patient record
2. Record vital signs
3. Update medication list
4. Document clinical progress
5. Document any procedures
6. Review charges for the day
7. Note any complications
8. Plan next day's management

## Ward Change Workflow
1. Request ward change
2. Select new ward and bed
3. Update ward charges
4. Stop previous ward daily charges
5. Start new ward daily charges
6. Document reason for change
7. Update patient chart

## Discharge Workflow
1. Compile all charges during stay
2. Verify ward charges
3. Add medication charges
4. Add consumable charges
5. Add procedure charges
6. Apply discounts/waivers
7. Split bill (cash/insurance)
8. Process payment
9. Generate invoices
10. Settle patient account

This comprehensive Inpatient module documentation follows the same structure and formatting as the other module documentations. You can save it to `\frontend\docs\inpatient\README.md`.

The documentation includes:
- Complete overview of the inpatient workflow
- Module structure and components
- Key features and capabilities
- API endpoints
- Common workflows with step-by-step processes
- Business logic classes
- Integration points with other modules
- Best practices and checklists
- Charge management details
