# CollabMed Frontend Documentation

## Overview

CollabMed is a comprehensive medical management system built with Vue.js 2.x and Laravel. This documentation covers the frontend architecture, components, and business logic for all modules in the system.

## System Architecture

- **Frontend Framework**: Vue.js 2.x with Vuetify
- **State Management**: Vuex
- **Routing**: Vue Router
- **HTTP Client**: Axios
- **Backend**: Laravel API
- **Real-time Communication**: Socket.io

## Project Structure

The frontend is organized into modular components, each representing a different department or functionality within the medical system:

```
frontend/
├── platform/          # Core application framework
├── inventory/         # Stock and inventory management
├── reception/         # Patient registration and appointments
├── settings/          # System configuration
├── evaluation/        # Medical evaluations and prescriptions
├── finance/           # Financial management
├── inpatient/         # Inpatient management
├── dialysis/          # Dialysis department
├── theatre/           # Operating theatre
├── hr/                # Human resources
├── reports/           # Reporting module
├── users/             # User management
├── morgue/            # Morgue management
├── olds/              # Legacy components
├── sync/              # Data synchronization
└── websockets/        # Real-time communication
```

## Module Documentation

### Core Modules

1. **[Platform](./platform/README.md)** - Core application framework, shared components, and utilities
2. **[Inventory](./inventory/README.md)** - Complete inventory management system
3. **[Reception](./reception/README.md)** - Patient registration, appointments, and visits
4. **[Settings](./settings/README.md)** - System configuration and setup

### Department Modules

5. **[Evaluation](./evaluation/README.md)** - Medical evaluations and prescriptions
6. **[Finance](./finance/README.md)** - Financial management and vouchers
7. **[Inpatient](./inpatient/README.md)** - Inpatient ward management
8. **[Dialysis](./dialysis/README.md)** - Dialysis department operations
9. **[Theatre](./theatre/README.md)** - Operating theatre management
10. **[HR](./hr/README.md)** - Human resources management
11. **[Morgue](./morgue/README.md)** - Morgue management

### Support Modules

12. **[Reports](./reports/README.md)** - Reporting and analytics
13. **[Users](./users/README.md)** - User management and authentication
14. **[Sync](./sync/README.md)** - Data synchronization
15. **[Websockets](./websockets/README.md)** - Real-time communication
16. **[Olds](./olds/README.md)** - Legacy system components

## Common Patterns

### Repository Pattern

Each entity in the system follows a repository pattern:

```javascript
// Repository file defines the data structure
export const fields = {
    id: null,
    name: '',
    // ... other fields
};
```

### Base Class Pattern

All business logic classes extend the Base class:

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

### Component Structure

Vue components typically include:

```vue
<template>
    <!-- UI markup -->
</template>

<script>
export default {
    name: 'component-name',
    props: [],
    data() {
        return {};
    },
    computed: {},
    methods: {},
    mounted() {}
}
</script>
```

## Key Concepts

### Form Handling

The system uses a custom Form class for API interactions:
- Automatic error handling
- Loading states
- Success/failure callbacks
- Validation error display

### State Management

Vuex is used for global state management:
- Module-based store organization
- Actions for async operations
- Getters for computed state
- Mutations for state changes

### Routing

Vue Router handles navigation:
- Module-based route definitions
- Route guards for authentication
- Dynamic route parameters
- Nested routes for complex views

## Development Guidelines

### File Organization

Each module follows this structure:
```
module/
├── js/
│   ├── components/     # Vue components
│   ├── libs/           # Business logic classes
│   ├── paths.js        # Route path constants
│   ├── routes.js       # Route definitions
│   ├── views.js        # Main view components
│   └── module.js       # Module initialization
```

### Naming Conventions

- **Components**: PascalCase (e.g., `PatientSearch.vue`)
- **Classes**: PascalCase (e.g., `Patient.js`)
- **Methods**: camelCase (e.g., `savePatient()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### Import Aliases

The system uses webpack aliases for cleaner imports:
- `@app` → `platform/js`
- `@inventory` → `inventory/js`
- `@reception` → `reception/js`
- `@evaluation` → `evaluation/js`
- etc.

## API Integration

### Endpoint Structure

API endpoints follow RESTful conventions:
```
GET    /api/module/entity          # List
POST   /api/module/entity          # Create
GET    /api/module/entity/{id}     # Show
PUT    /api/module/entity/{id}     # Update
DELETE /api/module/entity/{id}     # Delete
```

### Authentication

The system uses Laravel Passport for API authentication:
- Token-based authentication
- OAuth2 implementation
- Personal access tokens
- Client credentials

## Getting Started

1. **Read the Architecture Overview**: [architecture.md](./architecture.md)
2. **Explore Platform Module**: Start with [platform/README.md](./platform/README.md)
3. **Choose Your Module**: Navigate to the specific module documentation
4. **Review Components**: Each module has detailed component documentation
5. **Understand Business Logic**: Check the libs documentation for each module

## Contributing

When adding new features:
1. Follow the established patterns
2. Document new components and classes
3. Update relevant module documentation
4. Add usage examples
5. Test thoroughly

## Support

For questions or issues:
- Review the relevant module documentation
- Check the architecture guide
- Consult the code examples
- Contact the development team

---

**Last Updated**: December 2025  
**Version**: 1.0.0
