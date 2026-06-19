# Reception Module Documentation

## Overview

The Reception module handles patient registration, appointments, visits, and front-desk operations. It serves as the entry point for patients into the healthcare system.

## Module Structure

```
reception/js/
├── paths.js            # Route path constants
├── routes.js           # Route definitions
├── views.js            # Main view components
├── components/         # Vue components
│   ├── patients/       # Patient management
│   ├── appointments/   # Appointment scheduling
│   ├── visits/         # Visit management
│   ├── contact-tracing/# Contact tracing
│   └── widgets/        # Dashboard widgets
└── libs/               # Business logic classes
    ├── patients/       # Patient-related classes
    ├── appointments/   # Appointment classes
    └── visits/         # Visit classes
```

## Key Features

### 1. Patient Management
- Patient registration (new and returning)
- Patient profile management
- Patient search and lookup
- Demographics and personal information
- Next of kin management
- Insurance/scheme management
- Patient documents
- Patient portal access
- Unknown patient handling

### 2. Appointment Management
- Appointment scheduling
- Calendar view
- Appointment reminders
- Rescheduling
- Cancellations
- Doctor availability

### 3. Visit Management
- Visit creation and check-in
- Visit types (consultation, emergency, follow-up)
- Department routing
- Visit status tracking
- Visit history

### 4. Contact Tracing
- Contact information collection
- Exposure tracking
- Contact history
- Screening questionnaires

### 5. Patient Portal
- Patient details view
- Visit history
- Medical records access
- Financial overview
- Document management

## Component Documentation

### Patient Management Components

#### [PatientSearch.vue](./components/patients.md#patientsearch)
Provides patient search functionality with autocomplete.

**Features**:
- Real-time search
- Multiple search criteria (name, ID, phone)
- Result selection
- Patient creation shortcut

#### [Create.vue](./components/patients.md#create)
Patient registration form for new patients.

**Features**:
- Personal information capture
- Demographics
- Contact details
- Next of kin information
- Insurance/scheme details
- Photo upload
- Validation

#### [Update.vue](./components/patients.md#update)
Edit existing patient information.

**Features**:
- Pre-populated form
- All patient details editable
- Change tracking
- Validation

#### [Portal/Index.vue](./components/patients.md#portal)
Comprehensive patient information dashboard.

**Features**:
- Patient demographics
- Visit history
- Financial summary
- Medical records
- Documents
- Vitals
- Investigations
- Prescriptions

### Appointment Components

#### [Calendar.vue](./components/appointments.md#calendar)
Visual calendar for appointment scheduling.

**Features**:
- Month/week/day views
- Drag-and-drop scheduling
- Color-coded appointments
- Quick appointment creation

#### [Create.vue](./components/appointments.md#create)
Create new appointments.

**Features**:
- Patient selection
- Doctor selection
- Date/time selection
- Appointment type
- Notes

#### [Index.vue](./components/appointments.md#index)
List view of all appointments.

**Features**:
- Filtering by date, doctor, status
- Search functionality
- Bulk actions
- Status updates

### Visit Components

#### [Create.vue](./components/visits.md#create)
Create new patient visits.

**Features**:
- Patient selection
- Visit type selection
- Department routing
- Payment mode
- Scheme selection
- Emergency handling

#### [Index.vue](./components/visits.md#index)
List all visits with filtering.

**Features**:
- Status filtering
- Date range filtering
- Department filtering
- Search
- Quick actions

## Business Logic Classes

### Patient.js

**Location**: `reception/js/libs/patients/Patient.js`

**Purpose**: Manages all patient-related operations including registration, updates, and data retrieval.

**Key Properties**:
```javascript
{
    patient_id: null,
    profile: {
        first_name: '',
        middle_name: '',
        last_name: '',
        dob: null,
        sex: '',
        mobile: '',
        email: '',
        id_number: '',
        kra_pin_number: '',
        resident_county: '',
        resident_sub_county: '',
        resident_village: '',
        image: null
    },
    noks: [],           // Next of kin
    schemes: [],        // Insurance schemes
    dependants: [],     // Dependants
    allergies: null,
    hasInsurance: false
}
```

**Key Methods**:

#### save()
Creates a new patient record.

```javascript
async save() {
    const data = this.getFieldsExcept(['form', 'table', 'patient', 'populated']);
    
    _.each(data.schemes, (item) => {
        if (item.company_id.id) {
            item.company_id = item.company_id.id;
        }
    });
    
    const response = await this.form.submit('post', '/api/reception/patients', data);
    
    if (response) {
        this.patient_id = response.patient_id;
        flash(response);
        return response;
    }
}
```

#### update()
Updates existing patient information.

```javascript
async update() {
    const data = this.getFieldsExcept(['form']);
    
    _.each(data.schemes, (item) => {
        if (item.company_id.id) {
            item.company_id = item.company_id.id;
        }
    });
    
    const response = await this.form.submit(
        'patch', 
        `/api/reception/patients/${this.patient_id}`, 
        data
    );
    
    if (response) {
        flash(response);
        return response;
    }
}
```

#### find(id)
Retrieves patient details by ID.

```javascript
find(id) {
    this.form.submit('get', route('api.reception.patients.show', id))
        .then((response) => {
            this.patient = response.patient;
        });
}
```

#### populate(profile)
Populates form with existing patient data for editing.

```javascript
populate(profile) {
    const patient = profile;
    
    this.patient_id = patient.id;
    this.hasInsurance = patient.schemes.length > 0;
    
    // Populate profile fields
    _.each(this.profile, (value, key) => {
        fields.profile[key] = patient[key];
    });
    
    // Populate next of kin
    _.each(patient.nok, (item) => {
        fields.noks.push({
            id: item.id,
            first_name: item.first_name,
            middle_name: item.middle_name,
            last_name: item.last_name,
            mobile: item.mobile,
            email: item.email,
            relationship_id: item.relationship_id,
        });
    });
    
    // Populate schemes
    _.each(patient.schemes, (item) => {
        fields.schemes.push({
            id: item.id,
            scheme_id: item.scheme_id,
            company_id: item.company_id,
            policy_number: item.policy_number,
            principal: item.principal,
            dob: item.dob,
            relationship_id: item.relationship_id,
        });
    });
    
    this.populated = true;
}
```

#### fetchPatientWalletBalance(patientId)
Retrieves patient wallet balance.

```javascript
async fetchPatientWalletBalance(patientId) {
    try {
        const existing_patient_account = await this.form.submit(
            'get', 
            route('api.reception.patients.fetch_existing_wallet_record', patientId)
        );
        
        if (existing_patient_account.message === 'Wallet exists') {
            return await this.form.submit(
                'get', 
                route('api.reception.patients.show_wallet_balance', patientId)
            );
        } else {
            return 0;
        }
    } catch (error) {
        console.error('Error fetching patient wallet balance:', error);
        throw error;
    }
}
```

#### uploadImage(patient_id)
Uploads patient photo.

```javascript
async uploadImage(patient_id = null) {
    const formData = new FormData();
    formData.append('image', this.profile.image);
    
    const response = await this.form.submit(
        'post', 
        route('api.reception.patients.upload-image', patient_id).relative(),
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    
    flash(response);
    window.location.reload();
}
```

#### saveRandomNote(patient_id, data)
Saves a note to patient record.

```javascript
async saveRandomNote(patient_id, data) {
    const response = await this.form.submit(
        'post', 
        `/api/reception/patients/${patient_id}/random-note/store`, 
        data
    );
    
    if (response) {
        flash(response);
        return response;
    }
}
```

#### schemeTemplate()
Returns empty insurance scheme template.

```javascript
schemeTemplate() {
    return {
        scheme_id: null,
        company_id: null,
        menu: false,
        policy_number: null,
        principal: null,
        dob: null,
        relationship_id: null,
    };
}
```

#### nokTemplate()
Returns empty next of kin template.

```javascript
nokTemplate() {
    return {
        first_name: null,
        middle_name: null,
        last_name: null,
        mobile: null,
        relationship_id: null,
    };
}
```

### Appointments.js

**Location**: `reception/js/libs/appointments/Appointments.js`

**Purpose**: Manages appointment scheduling and operations.

**Key Methods**:
- `save()` - Create appointment
- `update()` - Update appointment
- `cancel()` - Cancel appointment
- `reschedule()` - Reschedule appointment
- `find(id)` - Get appointment details

### Visit.js

**Location**: `reception/js/libs/visits/Visit.js`

**Purpose**: Manages patient visits and check-ins.

**Key Methods**:
- `save()` - Create visit
- `update()` - Update visit
- `changeDestination()` - Change department
- `changeMode()` - Change payment mode
- `complete()` - Complete visit

## API Endpoints

### Patient Endpoints

```
GET    /api/reception/patients                    # List patients
POST   /api/reception/patients                    # Create patient
GET    /api/reception/patients/{id}               # Show patient
PATCH  /api/reception/patients/{id}               # Update patient
DELETE /api/reception/patients/{id}               # Delete patient
POST   /api/reception/patients/search             # Search patients
POST   /api/reception/patients/unknown/patient    # Create unknown patient
POST   /api/reception/patients/{id}/upload-image  # Upload photo
GET    /api/reception/patients/{id}/wallet        # Get wallet balance
POST   /api/reception/patients/{id}/random-note   # Add note
```

### Appointment Endpoints

```
GET    /api/reception/appointments                # List appointments
POST   /api/reception/appointments                # Create appointment
GET    /api/reception/appointments/{id}           # Show appointment
PUT    /api/reception/appointments/{id}           # Update appointment
DELETE /api/reception/appointments/{id}           # Cancel appointment
```

### Visit Endpoints

```
GET    /api/reception/visits                      # List visits
POST   /api/reception/visits                      # Create visit
GET    /api/reception/visits/{id}                 # Show visit
PUT    /api/reception/visits/{id}                 # Update visit
POST   /api/reception/visits/{id}/destination     # Change destination
POST   /api/reception/visits/{id}/mode            # Change payment mode
```

## Common Workflows

### 1. New Patient Registration

```
1. Search for existing patient
2. If not found, click "New Patient"
3. Fill personal information
4. Add next of kin details
5. Add insurance schemes (if applicable)
6. Upload photo (optional)
7. Submit registration
8. Generate patient ID
```

### 2. Patient Check-in

```
1. Search for patient
2. Select patient from results
3. Create new visit
4. Select visit type
5. Choose department
6. Select payment mode/scheme
7. Submit visit
8. Print visit card
```

### 3. Appointment Scheduling

```
1. Search for patient
2. Select doctor
3. Choose date and time
4. Select appointment type
5. Add notes
6. Confirm appointment
7. Send reminder (optional)
```

## Integration Points

### With Other Modules

1. **Evaluation Module**: Patient visits route to doctors
2. **Finance Module**: Payment processing and billing
3. **Inventory Module**: Pharmacy prescriptions
4. **Settings Module**: Schemes and configurations

## Security & Permissions

### Required Permissions

- `reception.view` - View reception data
- `reception.create` - Register patients
- `reception.edit` - Edit patient information
- `reception.delete` - Delete records
- `reception.appointments` - Manage appointments
- `reception.visits` - Manage visits

## Best Practices

### 1. Patient Registration

- Verify patient doesn't exist before creating
- Collect complete and accurate information
- Validate ID numbers and contact details
- Capture insurance information correctly
- Take clear patient photos

### 2. Data Entry

- Use consistent naming conventions
- Validate phone numbers and emails
- Check for duplicate records
- Save frequently
- Review before submission

### 3. Appointment Management

- Confirm patient availability
- Check doctor schedules
- Send appointment reminders
- Handle cancellations promptly
- Maintain appointment history

### 4. Visit Management

- Verify patient identity
- Confirm insurance coverage
- Route to correct department
- Track visit status
- Complete visits properly

## Troubleshooting

### Common Issues

1. **Duplicate Patients**: Use search before creating new records
2. **Insurance Validation**: Verify scheme details with provider
3. **Photo Upload**: Check file size and format
4. **Appointment Conflicts**: Check calendar before scheduling

## Related Documentation

- [Patient Components](./components/patients.md)
- [Appointment Components](./components/appointments.md)
- [Visit Components](./components/visits.md)
- [Business Logic Classes](./libs/patients.md)

---

**Last Updated**: December 2025  
**Version**: 1.0.0
