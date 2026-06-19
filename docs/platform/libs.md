# Platform Libraries Documentation

## Overview

This document details all the core libraries and classes in the Platform module that provide foundational functionality for the entire CollabMed application.

## Core Classes

### Base.js

The Base class is the foundation for all business logic classes in the application.

**Location**: `platform/js/libs/Base.js`

**Purpose**: Provides common functionality for field management, data manipulation, and object initialization.

**Key Methods**:

#### constructor(fields)
Initializes the class with the provided fields structure.

```javascript
constructor(fields) {
    this.setFields(fields);
}
```

#### setFields(fields, except = [])
Sets all fields as properties of the class instance.

```javascript
setFields(fields, except = []) {
    for (const field in fields) {
        if (except.indexOf(field) === -1) {
            this[field] = fields[field];
        }
    }
}
```

**Parameters**:
- `fields` (Object): Field definitions from repository
- `except` (Array): Fields to exclude from initialization

#### resetFields(fields)
Resets all fields to their initial values.

```javascript
resetFields(fields) {
    for (const field in fields) {
        if (fields[field] instanceof Array) {
            fields[field].splice(0, fields[field].length);
        } else {
            this[field] = fields[field];
        }
    }
}
```

#### getFields(items = [])
Retrieves field data, optionally filtering to specific fields.

```javascript
getFields(items = []) {
    const data = { ...this };
    
    delete data.form;
    delete data.search;
    delete data.meta;
    
    if (items.length > 0) {
        for (const field in data) {
            if (items.indexOf(field) === -1) {
                delete data[field];
            }
        }
    }
    
    if (items.length === 1) {
        return data[items[0]];
    }
    
    return data;
}
```

**Parameters**:
- `items` (Array): Specific fields to retrieve

**Returns**: Object with requested fields or single value if one field requested

#### getFieldsExcept(trash = [])
Gets all fields except specified ones.

```javascript
getFieldsExcept(trash = []) {
    trash.push('form', 'meta');
    const data = { ...this };
    
    trash.forEach((item) => {
        delete data[item];
    });
    
    return data;
}
```

#### onlyGet(items = [])
Gets only the specified fields.

```javascript
onlyGet(items = []) {
    const data = { ...this };
    
    if (items.length > 0) {
        for (const field in data) {
            if (items.indexOf(field) === -1) {
                delete data[field];
            }
        }
    }
    
    return data;
}
```

#### correct(errors)
Clears errors after a short delay (useful with Vuetify).

```javascript
correct(errors) {
    setTimeout(() => {
        errors.clear();
    }, 100);
}
```

**Usage Example**:

```javascript
import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './PatientRepository';

export default class Patient extends Base {
    constructor() {
        super(fields);
        this.form = new Form(fields);
    }
    
    async save() {
        const data = this.getFields(['name', 'email', 'phone']);
        return await this.form.submit('post', '/api/patients', data);
    }
}
```

---

### Form.js

Handles all form submissions and API interactions with automatic error handling.

**Location**: `platform/js/libs/Form.js`

**Purpose**: Manages form state, API submissions, loading states, and error handling.

**Properties**:
- `errors` (Errors): Error handling instance
- `submitted` (Boolean): Form submission status
- `errorDetected` (Boolean): Error detection flag
- `loading` (Boolean): Loading state

**Key Methods**:

#### constructor(fields)
Initializes the form with error handling.

```javascript
constructor(fields) {
    this.errors = new Errors(fields);
    this.submitted = false;
    this.errorDetected = false;
    this.loading = false;
}
```

#### submit(request, url, record, headers = null)
Submits form data to the API.

```javascript
submit(request, url, record, headers = null) {
    this.loading = true;
    this.errors.clear();
    this.submitted = false;
    this.errorDetected = false;
    
    return new Promise((resolve, reject) => {
        let call;
        if (!headers) {
            headers = visa();
        }
        
        if (request === 'get' || request === 'delete') {
            call = axios[request](url, headers);
        } else {
            call = axios[request](url, record, headers);
        }
        
        call.then(({ data }) => {
            resolve(data);
            this.submitted = true;
            this.loading = false;
        }).catch(({ response }) => {
            this.errors.record(response.data);
            
            if (response.data.hasOwnProperty('exception') || 
                response.data.hasOwnProperty('message')) {
                flash({ alert: 'error', message: response.data.message });
            }
            
            reject(response.data);
            this.errorDetected = true;
            this.loading = false;
        });
    });
}
```

**Parameters**:
- `request` (String): HTTP method ('get', 'post', 'put', 'delete')
- `url` (String): API endpoint URL
- `record` (Object): Data to submit
- `headers` (Object): Optional custom headers

**Returns**: Promise with response data

**Usage Example**:

```javascript
import Form from '@app/libs/Form';

const form = new Form({
    name: '',
    email: '',
    phone: ''
});

// Submit form
form.submit('post', '/api/patients', {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890'
}).then(response => {
    console.log('Success:', response);
    flash({ alert: 'success', message: 'Patient created successfully' });
}).catch(error => {
    console.log('Errors:', form.errors);
});

// Check loading state
if (form.loading) {
    // Show loading indicator
}

// Check for errors
if (form.errors.has('email')) {
    console.log(form.errors.get('email'));
}
```

---

### Errors.js

Manages validation errors and error display.

**Location**: `platform/js/libs/Errors.js`

**Purpose**: Handles error storage, retrieval, and display for form validation.

**Key Methods**:

#### constructor(fields)
Initializes error storage for all fields.

```javascript
constructor(fields) {
    this.errors = this.setErrors(fields);
}
```

#### setErrors(fields)
Creates error object with all fields initialized to empty strings.

```javascript
setErrors(fields) {
    const errors = {};
    for (const field in fields) {
        errors[field] = '';
    }
    return errors;
}
```

#### any()
Checks if any errors exist.

```javascript
any() {
    for (const field in this.errors) {
        if (this.errors[field]) {
            return true;
        }
    }
    return false;
}
```

**Returns**: Boolean indicating if errors exist

#### has(field)
Checks if a specific field has an error.

```javascript
has(field) {
    if (this.errors[field]) {
        return true;
    }
    return false;
}
```

**Parameters**:
- `field` (String): Field name to check

**Returns**: Boolean

#### get(field)
Retrieves error message for a field.

```javascript
get(field) {
    return this.has(field) ? this.errors[field] : '';
}
```

**Parameters**:
- `field` (String): Field name

**Returns**: Error message string or empty string

#### add(error)
Manually adds an error.

```javascript
add(error) {
    const vueEnabled = window.Vue;
    
    if (vueEnabled) {
        window.Vue.set(this.errors, error.field, error.message);
    } else {
        this.errors[error.field] = error.message;
    }
}
```

**Parameters**:
- `error` (Object): `{ field: 'fieldName', message: 'Error message' }`

#### clear(field)
Clears errors for a specific field or all fields.

```javascript
clear(field) {
    if (field) {
        this.errors[field] = '';
    } else {
        this.errors = {};
    }
}
```

**Parameters**:
- `field` (String, optional): Field to clear, or all if not provided

#### record(errors)
Records errors from API response.

```javascript
record(errors) {
    errors = errors.errors;
    const vueEnabled = window.Vue;
    
    for (const error in errors) {
        if (vueEnabled) {
            window.Vue.set(this.errors, error, errors[error][0]);
        } else {
            this.errors[error] = errors[error][0];
        }
    }
}
```

**Parameters**:
- `errors` (Object): Error response from API

#### display()
Generates HTML list of all errors.

```javascript
display() {
    let str = '';
    
    if (this.any()) {
        str += '<ul>';
        
        for (const field in this.errors) {
            if (this.errors[field]) {
                str += `<li>${this.errors[field]}</li>`;
            }
        }
        
        str += '</ul>';
    }
    
    return str;
}
```

**Returns**: HTML string with error list

**Usage Example**:

```javascript
import Errors from '@app/libs/Errors';

const errors = new Errors({
    name: '',
    email: '',
    phone: ''
});

// Check for errors
if (errors.has('email')) {
    console.log(errors.get('email')); // "Email is required"
}

// Add manual error
errors.add({
    field: 'phone',
    message: 'Phone number is invalid'
});

// Clear specific error
errors.clear('email');

// Clear all errors
errors.clear();

// Display all errors
const errorHtml = errors.display();
```

---

### Search.js

Base class for search functionality.

**Location**: `platform/js/libs/Search.js`

**Purpose**: Provides common search functionality with loading states and result management.

**Properties**:
- `term` (String): Search term
- `field` (String): Field to search
- `results` (Array): Search results
- `loading` (Boolean): Loading state
- `noData` (String): No data message
- `own_term` (String): Alternative search term
- `own_field` (String): Alternative field
- `own_results` (Array): Alternative results
- `own_loading` (Boolean): Alternative loading state

**Key Methods**:

#### constructor(field)
Initializes search with field name.

```javascript
constructor(field) {
    this.term = null;
    this.field = field;
    this.results = [];
    this.loading = false;
    this.noData = '';
    this.own_term = null;
    this.own_field = field;
    this.own_results = [];
    this.own_loading = false;
}
```

#### reset()
Resets search state to defaults.

```javascript
reset() {
    this.results = [];
    this.loading = false;
    this.noData = '';
}
```

#### own_reset()
Resets alternative search state.

```javascript
own_reset() {
    this.own_results = [];
    this.own_loading = false;
    this.noData = '';
}
```

**Usage Example**:

```javascript
import Search from '@app/libs/Search';

export default class PatientSearch extends Search {
    constructor() {
        super('name');
    }
    
    async search(term) {
        this.loading = true;
        this.term = term;
        
        try {
            const response = await axios.get('/api/patients/search', {
                params: { term }
            });
            this.results = response.data;
        } catch (error) {
            this.noData = 'No patients found';
        } finally {
            this.loading = false;
        }
    }
}
```

---

### Util.js

Common utility functions used throughout the application.

**Location**: `platform/js/libs/Util.js`

**Purpose**: Provides helper functions for common operations.

**Common Functions**:
- Date formatting
- String manipulation
- Number formatting
- Array operations
- Object utilities

---

### Customs.js

Custom helper functions and utilities.

**Location**: `platform/js/libs/Customs.js`

**Purpose**: Application-specific helper functions.

**Key Functions**:

#### visa()
Returns authorization headers for API requests.

```javascript
export function visa() {
    return {
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Accept': 'application/json'
        }
    };
}
```

---

### Filters.js

Vue filters for data formatting.

**Location**: `platform/js/libs/Filters.js`

**Purpose**: Provides filters for formatting data in templates.

**Common Filters**:
- Date formatting
- Currency formatting
- Number formatting
- Text truncation

**Usage Example**:

```vue
<template>
    <div>
        {{ amount | currency }}
        {{ date | formatDate }}
    </div>
</template>
```

---

### Permissions.js

Permission checking utilities.

**Location**: `platform/js/libs/Permissions.js`

**Purpose**: Handles user permission verification.

**Key Functions**:

#### can(permission)
Checks if user has a specific permission.

```javascript
export function can(permission) {
    const permissions = getUserPermissions();
    return permissions.includes(permission);
}
```

**Usage Example**:

```javascript
import { can } from '@app/libs/Permissions';

if (can('create-patients')) {
    // User can create patients
}
```

```vue
<template>
    <v-btn v-if="can('edit-users')">Edit User</v-btn>
</template>

<script>
import { can } from '@app/libs/Permissions';

export default {
    methods: {
        can
    }
}
</script>
```

---

### MSettings.js

Module settings management.

**Location**: `platform/js/libs/MSettings.js`

**Purpose**: Manages module-specific settings and configurations.

**Key Functions**:

#### msetting(key)
Retrieves a module setting value.

```javascript
export function msetting(key) {
    const settings = getModuleSettings();
    return settings[key];
}
```

**Usage Example**:

```javascript
export default {
    computed: {
        enableFeature() {
            return this.msetting('inventory.enable_prescriptions_sending_to_suppliers');
        }
    }
}
```

---

### TinyMce.js

TinyMCE rich text editor configuration.

**Location**: `platform/js/libs/TinyMce.js`

**Purpose**: Configures and manages TinyMCE editor instances.

---

## Mixins

### form_mixin.js

Provides common form functionality to components.

**Location**: `platform/js/mixins/form_mixin.js`

**Purpose**: Adds form handling capabilities to Vue components.

**Usage Example**:

```javascript
import formMixin from '@app/mixins/form_mixin';

export default {
    mixins: [formMixin],
    // Component code
}
```

---

### initMixin.js

Handles component initialization.

**Location**: `platform/js/mixins/initMixin.js`

**Purpose**: Provides initialization logic for components.

---

### titleMixin.js

Manages page titles.

**Location**: `platform/js/mixins/titleMixin.js`

**Purpose**: Sets and updates page titles dynamically.

**Usage Example**:

```javascript
import titleMixin from '@app/mixins/titleMixin';

export default {
    mixins: [titleMixin],
    title() {
        return 'Patient Management';
    }
}
```

---

### inactivityGuard.js

Handles session timeout due to inactivity.

**Location**: `platform/js/mixins/inactivityGuard.js`

**Purpose**: Monitors user activity and logs out inactive users.

---

## Best Practices

### 1. Using Base Class

Always extend Base class for business logic:

```javascript
import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './EntityRepository';

export default class Entity extends Base {
    constructor() {
        super(fields);
        this.form = new Form(fields);
    }
}
```

### 2. Error Handling

Always handle errors properly:

```javascript
try {
    await form.submit('post', '/api/endpoint', data);
} catch (error) {
    if (form.errors.any()) {
        // Display errors
    }
}
```

### 3. Search Implementation

Extend Search class for search functionality:

```javascript
import Search from '@app/libs/Search';

export default class EntitySearch extends Search {
    constructor() {
        super('name');
    }
}
```

### 4. Permission Checks

Always check permissions before actions:

```javascript
if (can('create-entity')) {
    // Perform action
}
```

---

**Last Updated**: December 2025  
**Version**: 1.0.0
