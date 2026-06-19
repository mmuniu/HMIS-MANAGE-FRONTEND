# Theatre Module Documentation

## Overview

The Theatre module manages the complete surgical workflow from booking through post-operative care. It handles theatre scheduling, surgical procedures, pre-operative and post-operative documentation, consumables management, and clinical evaluations for all surgical operations.

## Module Structure


theatre/js/
├── paths.js # Route path constants
├── routes.js # Route definitions
├── views.js # Main view components
├── components/ # Vue components
│ ├── bookings/ # Surgery booking management
│ ├── schedules/ # Theatre scheduling
│ ├── wardcheck/ # Pre-operative checks
│ ├── evaluate/ # Operative documentation
│ └── PatientInformation.vue # Patient info display
└── libs/ # Business logic classes
└── wardcheck/ # Ward check classes
├── Nurse.js
├── Doctor.js
└── Anaesthetist.js

## Key Features

### 1. Theatre Booking Management
- Surgery request creation
- Theatre booking and confirmation
- Surgeon/specialist assignment
- Surgery date and time scheduling
- Consumable requirements specification
- Booking approval workflow
- Cancellation and rescheduling

### 2. Theatre Scheduling
- Theatre availability management
- Multiple theatre support
- Time slot allocation
- Schedule view (daily/weekly)
- Conflict detection
- Staff assignment
- Emergency procedure accommodation

### 3. Pre-operative Preparations
- **Nurse Ward Check**
  - Patient preparation checklist
  - Personal items removal
  - Pre-medication administration
  - Lab results verification
  - Vital signs recording
  - Urinalysis and blood availability
  
- **Doctor Ward Check**
  - Medical evaluation
  - Fitness for surgery assessment
  - Medical history review
  - Hydration assessment
  - Consent form verification
  - Blood type verification
  
- **Anaesthetist Ward Check**
  - Anaesthetic assessment
  - Vital signs (BP, pulse, temperature)
  - Lab values (Hb, PVC, electrolytes)
  - Airway assessment
  - Medication history
  - Fitness for anaesthesia
  - Premedication planning

### 4. Operative Documentation
- Pre-operative notes
- Surgical procedure documentation
- Operative time tracking
- Consumables used recording
- Anaesthetic record
- Intra-operative complications
- Blood and products used
- Implants/devices inserted

### 5. Post-operative Care
- Post-operative notes
- Recovery assessment
- Complications documentation
- Pain management
- Discharge planning
- Follow-up scheduling

### 6. Consumables Management
- Consumable requirement specification
- Stock allocation
- Usage tracking
- Cost allocation
- Inventory adjustment

### 7. Billing and Charges
- Theatre room charges
- Surgeon fees
- Anaesthetist fees
- Nursing fees
- Consumable costs
- Equipment usage fees
- Insurance/cash pricing

### 8. Theatre Personnel Management
- Surgeon assignment
- Anaesthetist assignment
- Nursing staff allocation
- Scrub nurse assignment
- Availability scheduling

## Component Documentation

### Booking Components

#### Create.vue
Creates new theatre bookings.

**Features**:
- Patient selection
- Procedure selection
- Surgeon selection
- Date/time selection
- Theatre selection
- Consumable specifications
- Priority assignment
- Insurance/payment mode

#### Index.vue
Lists all theatre bookings with filtering.

**Features**:
- Status filtering (pending, approved, completed, cancelled)
- Date range filtering
- Surgeon filtering
- Procedure filtering
- Search functionality
- Bulk actions
- Approval workflow

#### ConsumableRequirements.vue
Manages consumables needed for procedures.

**Features**:
- Consumable item selection
- Quantity specification
- Cost tracking
- Pre-configured templates
- Custom item addition

### Schedule Components

#### Index.vue
Theatre scheduling and management.

**Features**:
- Calendar view (daily/weekly/monthly)
- Theatre availability display
- Scheduled procedures list
- Time slot management
- Staff roster view
- Emergency scheduling
- Schedule modifications

#### Create.vue
Create and manage theatre schedules.

**Features**:
- Date/time selection
- Theatre selection
- Staff assignment
- Procedure assignment
- Duration specification
- Notes/comments

### Ward Check Components

#### NurseCheck.vue
Pre-operative nursing checklist.

**Features**:
- Gown and preparation
- Jewellery and valuables
- Dentures and prosthetics
- Urinalysis results
- Blood availability
- Premedication verification
- Vital signs recording
- Safety verification

#### DoctorCheck.vue
Pre-operative medical assessment.

**Features**:
- Hydration status
- Lab values review
- Vital signs
- Chest assessment
- Medical fitness confirmation
- Blood availability
- Temperature recording
- Consent verification

#### AnaesthetistCheck.vue
Anaesthetic pre-operative assessment.

**Features**:
- Haemoglobin level
- PVC recording
- Electrolyte assessment
- Temperature
- Blood pressure (systolic/diastolic)
- Pulse rate
- Glucose level
- Albumin level
- Patient fitness assessment
- Consent verification
- Premedication plan

### Evaluate Components

#### PreOpNotes.vue
Pre-operative clinical documentation.

**Features**:
- Clinical findings
- Diagnosis confirmation
- Surgical plan
- Anticipated complications
- Special requirements
- Risk assessment
- Imaging review

#### Drugs.vue
Intra-operative medications administration.

**Features**:
- Medication selection
- Dosage recording
- Time of administration
- Route of administration
- Indication recording
- Allergies verification
- Interaction checking

#### Anaesthetics.vue
Anaesthetic management documentation.

**Features**:
- Induction agent selection
- Maintenance drugs
- Dosages
- Vital signs monitoring
- MAC (Minimum Alveolar Concentration)
- Complications
- Total anaesthetic time

#### Consumables.vue
Intra-operative consumables tracking.

**Features**:
- Item selection and quantity
- Cost tracking
- Stock adjustment
- Waste recording
- Special requirements
- Implant tracking

#### PostOpNotes.vue
Post-operative documentation.

**Features**:
- Operative findings
- Procedures completed
- Specimens collected
- Implants inserted
- Complications
- Estimated blood loss
- Recovery status

#### Chargesheet.vue
Theatre billing and charges.

**Features**:
- Room charges
- Professional fees
- Consumable costs
- Equipment usage
- Insurance vs cash pricing
- Exemptions/waivers
- Final billing

## Business Logic Classes

### NurseCheck.js / Nurse.js

Manages nurse pre-operative checklist.

```javascript
export default class NurseCheck extends Base {
    constructor() {
        super(fields);
        this.form = new Form(fields);
    }

    save() {
        const data = this.getFieldsExcept(["form"]);
        return this.form.submit(
            'post', 
            `/api/theatre/nurse-check/${this.booking_id}`, 
            data
        );
    }
}

Fields:

gown_and_socks
wigs
jewellery
dentures
preparation
urinalysis
sugar
albumim
bladder_check_urinary_catheter
gastric_tube
xrays
blood_available
consent_given
premedication_given
DoctorCheck.js / Doctor.js
Manages doctor pre-operative assessment.

Fields:

hydration_normal
hb (Haemoglobin)
PVC (Packed Cell Volume)
electrolyte_normal
chest_normal
bp_systolic
diastolic
pulse
relevant_medical_preoperative_preparation_completed
patient_fit_operation
blood_available
consent_given
temp (Temperature)
AnaesthetistCheck.js / Anaesthetist.js
Manages anaesthetist pre-operative assessment.

```javascript
export default class AnaesthetistCheck extends Base {
    constructor() {
        super(fields);
        this.form = new Form(fields);
    }

    save() {
        const data = this.getFieldsExcept(["form"]);
        return this.form.submit(
            'post', 
            `/api/theatre/anaesthetist-check/${this.booking_id}`, 
            data
        );
    }

    removeRequirement(type, id) {
        return this.form.submit(
            "delete", 
            
        );
    }
}

Fields:

haemoglobin
pvc
electrolytes
temperature
bp_systolic
bp_diastolic
pulse
glucose
albumin
relevant_anaesthetic_preoperative_preparation_completed
patient_fit_anaesthesia
consent_given
premedication_plan
```

## API Endpoints

```
GET    /api/theatre/bookings                 # List bookings
POST   /api/theatre/bookings                 # Create booking
GET    /api/theatre/bookings/{id}            # Show booking
PUT    /api/theatre/bookings/{id}            # Update booking
PATCH  /api/theatre/bookings/{id}/approve    # Approve booking
DELETE /api/theatre/bookings/{id}            # Cancel booking
POST   /api/theatre/bookings/{id}/consumables # Add consumables
GET    /api/theatre/schedules                # List schedules
POST   /api/theatre/schedules                # Create schedule
GET    /api/theatre/schedules/{id}           # Show schedule
PUT    /api/theatre/schedules/{id}           # Update schedule
DELETE /api/theatre/schedules/{id}           # Delete schedule
POST   /api/theatre/nurse-check/{booking_id}        # Save nurse check
POST   /api/theatre/doctor-check/{booking_id}       # Save doctor check
POST   /api/theatre/anaesthetist-check/{booking_id} # Save anaesthetist check
DELETE /api/theatre/theatre-requirements/{type}/{id} # Remove requirement
GET    /api/theatre/operations/{id}                  # Get operation
POST   /theatre/operation/{id}/procedure             # Order procedures
POST   /theatre/operation/{id}/investigations        # Order investigations
GET    /api/theatre/operations/{id}/chargesheet      # Get charges
```

## Surgical Procedure Workflow

1. Patient referred for surgery from evaluation
2. Create theatre booking
3. Select surgeon and procedure
4. Choose theatre and time slot
5. Specify consumable requirements
6. Set payment mode/insurance
7. Submit for approval
8. Surgeon/manager approves booking
9. Schedule confirmed

