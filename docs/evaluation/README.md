# Evaluation Module Documentation

## Overview

The Evaluation module handles medical consultations, examinations, prescriptions, and clinical documentation. It's the core clinical workflow module where doctors interact with patients.

## Module Structure

```
evaluation/js/
├── module.js           # Module initialization
├── paths.js            # Route path constants
├── routes.js           # Route definitions
├── views.js            # Main view components
├── components/         # Vue components
│   ├── consultations/  # Consultation management
│   ├── prescriptions/  # Prescription management
│   ├── notes/          # Clinical notes
│   ├── vitals/         # Vital signs
│   └── investigations/ # Lab/imaging orders
├── libs/               # Business logic classes
│   ├── consultations/  # Consultation classes
│   ├── prescriptions/  # Prescription classes
│   └── notes/          # Note classes
├── mixins/             # Vue mixins
└── utils/              # Utility functions
```

## Key Features

### 1. Consultation Management
- Patient queue management
- Consultation documentation
- History taking
- Physical examination
- Diagnosis recording
- Treatment planning

### 2. Prescription Management
- Drug prescription
- Dosage and frequency
- Duration and quantity
- Special instructions
- Prescription printing
- Prescription history

### 3. Clinical Notes
- SOAP notes (Subjective, Objective, Assessment, Plan)
- Progress notes
- Discharge summaries
- Referral letters
- Medical certificates
- Rich text editor support

### 4. Vital Signs
- Blood pressure
- Temperature
- Pulse rate
- Respiratory rate
- Weight and height
- BMI calculation
- Oxygen saturation

### 5. Investigations
- Laboratory test orders
- Imaging orders
- Results viewing
- Report attachments
- Investigation history

### 6. Medical History
- Past medical history
- Surgical history
- Family history
- Social history
- Allergies
- Current medications

## Component Documentation

### Consultation Components
- Queue management
- Patient selection
- Consultation form
- History and examination
- Diagnosis entry
- Treatment planning

### Prescription Components
- Drug search
- Prescription form
- Dosage calculator
- Prescription preview
- Print functionality

### Notes Components
- Note templates
- Rich text editor
- Voice-to-text (if enabled)
- Note history
- Note printing

## Business Logic Classes

### Consultation.js
Manages consultation workflow and documentation.

### Prescription.js
Handles prescription creation and management.

### Note.js
Manages clinical notes and documentation.

## API Endpoints

```
GET    /api/evaluation/consultations           # List consultations
POST   /api/evaluation/consultations           # Create consultation
GET    /api/evaluation/consultations/{id}      # Show consultation
PUT    /api/evaluation/consultations/{id}      # Update consultation

POST   /api/evaluation/prescriptions           # Create prescription
GET    /api/evaluation/prescriptions/{id}      # Show prescription
POST   /api/evaluation/prescriptions/search    # Search prescriptions

POST   /api/evaluation/notes                   # Create note
GET    /api/evaluation/notes/{id}              # Show note
PUT    /api/evaluation/notes/{id}              # Update note
```

## Common Workflows

### 1. Patient Consultation
```
1. Select patient from queue
2. Review patient history
3. Record vital signs
4. Document history and examination
5. Enter diagnosis
6. Create treatment plan
7. Write prescriptions
8. Order investigations
9. Complete consultation
```

### 2. Prescription Writing
```
1. Search for drug
2. Select drug from results
3. Enter dosage and frequency
4. Specify duration
5. Add special instructions
6. Review prescription
7. Save and print
```

## Integration Points

- **Reception Module**: Patient visits and queue
- **Inventory Module**: Prescription fulfillment
- **Finance Module**: Billing for services
- **Laboratory Module**: Investigation orders

## Best Practices

1. Complete all required fields
2. Use standard medical terminology
3. Document thoroughly
4. Review before saving
5. Print prescriptions clearly
6. Follow clinical protocols

---

**Last Updated**: December 2025  
**Version**: 1.0.0
