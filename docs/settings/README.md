# Settings Module Documentation

## Overview

The Settings module manages system-wide configurations, insurance schemes, departments, regions, and other administrative settings for the CollabMed system.

## Module Structure

```
settings/js/
├── paths.js            # Route path constants
├── views.js            # Main view components
├── components/         # Vue components
│   ├── schemes/        # Insurance scheme management
│   ├── departments/    # Department management
│   ├── regions/        # Region management
│   ├── organization/   # Organization settings
│   ├── registration/   # Registration settings
│   ├── rebates/        # Rebate management
│   ├── pos/            # POS settings
│   └── partner_institutions/ # Partner institutions
└── libs/               # Business logic classes
    ├── schemes/        # Scheme-related classes
    ├── departments/    # Department classes
    ├── regions/        # Region classes
    └── ...
```

## Key Features

### 1. Insurance Scheme Management
- Scheme creation and configuration
- Exclusions management (procedures and products)
- Pricing configuration
- Scheme types and categories
- Company/payer management
- Policy settings
- Excel import/export for exclusions

### 2. Department Management
- Department creation
- Department hierarchy
- Service configuration
- Staff assignment

### 3. Organization Settings
- Facility information
- Contact details
- Branding
- System preferences

### 4. Region Management
- County management
- Sub-county management
- Location hierarchy

### 5. Registration Settings
- Patient registration configuration
- ID number formats
- Required fields
- Validation rules

### 6. Rebate Management
- Rebate schemes
- Percentage configuration
- Applicability rules

### 7. Partner Institutions
- Partner facility management
- Staff management
- Integration settings

## Component Documentation

### Scheme Management Components

#### [Index.vue](./components/schemes.md#index)
Lists all insurance schemes with management options.

**Features**:
- Scheme listing
- Search and filter
- Status management
- Quick actions
- Scheme details view

#### [Exclusions.vue](./components/schemes.md#exclusions)
Manages scheme exclusions for procedures and products.

**Features**:
- Procedure exclusions
- Product exclusions
- Pricing overrides
- Bulk operations
- Excel import/export

#### [UploadExcelForExclusionsAndPricing.vue](./components/schemes.md#upload-excel)
Handles Excel file uploads for exclusions and pricing.

**Features**:
- File upload
- Format validation
- Preview before import
- Error handling
- Bulk import

**File Format**:
```
Product/Procedure Name | Price | Exclusion Status
Paracetamol 500mg     | 50.00 | No
X-Ray Chest           | 1500  | Yes
```

#### [SchemesSearch.vue](./components/schemes.md#search)
Provides scheme search functionality.

**Features**:
- Real-time search
- Autocomplete
- Result selection
- Quick view

### Department Components

#### [Index.vue](./components/departments.md#index)
Manages hospital departments.

**Features**:
- Department listing
- Create/edit departments
- Department hierarchy
- Service assignment

### Organization Components

#### [Index.vue](./components/organization.md#index)
Manages organization-wide settings.

**Features**:
- Facility information
- Contact details
- Logo upload
- System preferences
- Branding settings

### Region Components

#### [Index.vue](./components/regions.md#index)
Manages geographical regions.

**Features**:
- County management
- Sub-county management
- Location hierarchy
- Region assignment

## Business Logic Classes

### Scheme.js

**Location**: `settings/js/libs/schemes/Scheme.js`

**Purpose**: Manages insurance scheme operations including creation, updates, exclusions, and pricing.

**Key Properties**:
```javascript
{
    scheme_id: null,
    exclusions: {},
    editedExclusion: {
        id: null,
        scheme_id: null,
        price: 0,
        facility_id: null,
        friendly_name: null
    },
    duplicatedSchemeExclusions: {
        scheme_id: null,
        exclusions: []
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
        procuring_officer_name: ''
    },
    excel: '',
    saved: false,
    schemes: null,
    selected: null,
    duplicated: false
}
```

**Key Methods**:

#### saveScheme()
Creates a new insurance scheme.

```javascript
saveScheme() {
    const data = this.getFields(["scheme_data"]);
    
    return this.form.submit(
        "post", 
        route("api.settings.schemes.store").relative(), 
        data
    ).then((response) => {
        flash(response);
        this.resetSchemeInfo();
    });
}
```

**Actions**:
- Validates scheme data
- Submits to API
- Shows success message
- Resets form

#### updateScheme()
Updates existing scheme information.

```javascript
updateScheme() {
    const data = this.getFields(["scheme_data"]);
    
    return this.form.submit(
        "post", 
        route("api.settings.schemes.update", this.scheme_data.scheme_id).relative(), 
        data
    ).then((response) => {
        flash(response);
        this.resetSchemeInfo();
    });
}
```

#### changeStatus(scheme_id)
Changes scheme active/inactive status.

```javascript
changeStatus(scheme_id) {
    this.form.submit(
        "post", 
        route("api.settings.schemes.changeStatus", scheme_id).relative()
    ).then((response) => {
        flash(response);
        this.resetSchemeInfo();
        window.location.reload();
    });
}
```

#### requiresPreauth(scheme_id, type, item)
Checks if an item requires pre-authorization.

```javascript
async requiresPreauth(scheme_id, type, item) {
    const response = await this.form.submit(
        "post", 
        route("api.settings.schemes.requires_preauth", [scheme_id, type]), 
        item
    );
    
    if (response) {
        flash(response);
        return response;
    }
}
```

**Parameters**:
- `scheme_id` (Number): Scheme ID
- `type` (String): Item type ('procedure' or 'product')
- `item` (Object): Item details

#### find(id)
Retrieves scheme details by ID.

```javascript
find(id) {
    this.form.submit(
        "get", 
        route("api.settings.schemes.show", id).relative()
    ).then((response) => {
        this.selected = response.data;
        this.scheme_id = response.data.id;
    });
}
```

#### saveExclusion()
Saves an exclusion for a scheme.

```javascript
saveExclusion() {
    const data = this.getFields(["exclusions", "scheme_id"]);
    
    this.saved = false;
    
    this.form.submit(
        "post", 
        route("api.settings.schemes.store.exclusions").relative(), 
        data
    ).then((response) => {
        this.selected = response.data;
        this.saved = true;
        flash({ message: "Exclusion saved!", alert: "success" });
    });
}
```

#### updateExclusion()
Updates an existing exclusion.

```javascript
updateExclusion() {
    const data = this.editedExclusion;
    
    this.saved = false;
    
    this.form.submit(
        "put", 
        route("api.settings.schemes.update.exclusion", data.id).relative(), 
        data
    ).then((response) => {
        this.selected = response.data;
        this.saved = true;
        flash({ message: "Exclusion updated!", alert: "success" });
    });
}
```

#### saveDuplicateSchemeExclusions()
Duplicates exclusions from one scheme to another.

```javascript
saveDuplicateSchemeExclusions() {
    const data = this.duplicatedSchemeExclusions;
    
    this.duplicated = false;
    
    this.form.submit(
        "post", 
        route("api.settings.schemes.store.duplicate-scheme-exclusions").relative(), 
        data
    ).then((response) => {
        this.duplicated = true;
        flash({ message: "Scheme Exclusion Duplication Success!", alert: "success" });
        flash({ message: "Redirecting ...", alert: "info" });
    });
}
```

#### uploadExcel(type)
Uploads Excel file for exclusions or pricing.

```javascript
uploadExcel(type) {
    const formData = this.prepareDataFormData(type);
    
    return this.form.submit(
        "post", 
        route("api.settings.upload-excel-exclusions").relative(),
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    ).then((response) => {
        flash(response);
    });
}
```

**Parameters**:
- `type` (String): Upload type ('exclusions' or 'pricing')

#### prepareDataFormData(type)
Prepares FormData for Excel upload.

```javascript
prepareDataFormData(type) {
    const formData = new FormData();
    
    formData.append("excel_doc", this.excel);
    formData.append("scheme_id", this.scheme_id);
    formData.append("type", type);
    
    return formData;
}
```

#### recordExclusionAndPricing(data)
Records exclusion and pricing information.

```javascript
recordExclusionAndPricing(data) {
    this.form.submit(
        "post", 
        route("api.settings.schemes.record-exclusion").relative(), 
        data
    ).then((response) => {
        flash(response);
    });
}
```

#### resetSchemeInfo()
Resets scheme form to default values.

```javascript
resetSchemeInfo() {
    this.scheme_data.company = null;
    this.scheme_data.name = null;
    this.scheme_data.type_id = null;
    this.scheme_data.amount = null;
    this.scheme_data.attention = null;
    this.scheme_data.smart_enabled = false;
    this.scheme_data.age_range = null;
    this.scheme_data.age_restricted = false;
    this.scheme_data.gender_restricted = false;
    this.scheme_data.gender = null;
    this.scheme_data.policy_number_compulsory = null;
}
```

#### resetEditedExclusionData()
Resets edited exclusion data.

```javascript
resetEditedExclusionData() {
    this.editedExclusion.facility_id = null;
    this.editedExclusion.scheme_id = null;
    this.editedExclusion.id = null;
    this.editedExclusion.price = 0;
    this.editedExclusion.friendly_name = null;
}
```

### SchemeRepository.js

**Location**: `settings/js/libs/schemes/SchemeRepository.js`

**Purpose**: Defines the data structure for insurance schemes.

**Fields Definition**:
```javascript
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
        procuring_officer_name: ''
    },
    excel: '',
};
```

## API Endpoints

### Scheme Endpoints

```
GET    /api/settings/schemes                          # List schemes
POST   /api/settings/schemes                          # Create scheme
GET    /api/settings/schemes/{id}                     # Show scheme
POST   /api/settings/schemes/{id}                     # Update scheme
POST   /api/settings/schemes/{id}/status              # Change status
POST   /api/settings/schemes/exclusions               # Save exclusion
PUT    /api/settings/schemes/exclusions/{id}          # Update exclusion
POST   /api/settings/schemes/duplicate-exclusions     # Duplicate exclusions
POST   /api/settings/upload-excel-exclusions          # Upload Excel
POST   /api/settings/schemes/requires-preauth         # Check preauth
```

### Department Endpoints

```
GET    /api/settings/departments                      # List departments
POST   /api/settings/departments                      # Create department
GET    /api/settings/departments/{id}                 # Show department
PUT    /api/settings/departments/{id}                 # Update department
DELETE /api/settings/departments/{id}                 # Delete department
```

### Organization Endpoints

```
GET    /api/settings/organization                     # Get settings
POST   /api/settings/organization                     # Update settings
POST   /api/settings/organization/logo                # Upload logo
```

## Common Workflows

### 1. Create Insurance Scheme

```
1. Navigate to Schemes
2. Click "New Scheme"
3. Enter scheme details:
   - Company/Payer name
   - Scheme name
   - Scheme type
   - Coverage amount
   - Effective dates
4. Configure restrictions:
   - Age restrictions
   - Gender restrictions
   - Policy number requirements
5. Save scheme
6. Add exclusions (optional)
7. Configure pricing (optional)
```

### 2. Manage Exclusions

```
1. Select scheme
2. Navigate to Exclusions tab
3. Choose exclusion type:
   - Procedure exclusions
   - Product exclusions
4. Add exclusions:
   - Manual entry
   - Excel upload
5. Set pricing overrides
6. Save changes
```

### 3. Excel Import for Exclusions

```
1. Prepare Excel file with format:
   - Column A: Item name
   - Column B: Price
   - Column C: Exclusion status
2. Select scheme
3. Click "Upload Excel"
4. Choose file
5. Select import type
6. Preview data
7. Confirm import
8. Review results
```

## Integration Points

### With Other Modules

1. **Reception Module**: Scheme selection during registration
2. **Finance Module**: Billing and claims processing
3. **Evaluation Module**: Procedure authorization
4. **Inventory Module**: Product pricing and exclusions

## Security & Permissions

### Required Permissions

- `settings.view` - View settings
- `settings.edit` - Edit settings
- `settings.schemes` - Manage schemes
- `settings.departments` - Manage departments
- `settings.organization` - Manage organization settings

## Best Practices

### 1. Scheme Configuration

- Use clear, descriptive scheme names
- Set appropriate effective dates
- Configure restrictions carefully
- Document exclusions thoroughly
- Test scheme before activation

### 2. Exclusion Management

- Review exclusions regularly
- Keep pricing up to date
- Document reasons for exclusions
- Use Excel import for bulk operations
- Maintain audit trail

### 3. Excel Imports

- Use provided templates
- Validate data before import
- Preview before confirming
- Keep backup of original data
- Review import results

### 4. Department Setup

- Create logical hierarchy
- Assign appropriate services
- Configure routing rules
- Update regularly
- Document changes

## Troubleshooting

### Common Issues

1. **Excel Import Fails**: Check file format and column headers
2. **Exclusion Not Applied**: Verify scheme is active and dates are valid
3. **Pricing Override**: Ensure exclusion is properly configured
4. **Permission Denied**: Check user permissions

## Related Documentation

- [Scheme Components](./components/schemes.md)
- [Department Management](./components/departments.md)
- [Organization Settings](./components/organization.md)
- [Business Logic Classes](./libs/schemes.md)

---

**Last Updated**: December 2025  
**Version**: 1.0.0
