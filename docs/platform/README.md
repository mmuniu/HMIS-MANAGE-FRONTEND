# Platform Module Documentation

## Overview

The Platform module serves as the core foundation of the CollabMed application. It provides shared components, base classes, utilities, and common functionality used across all other modules.

## Module Structure

```
platform/js/
├── app.js              # Main application entry point
├── bootstrap.js        # Application bootstrapping
├── routes.js           # Core route definitions
├── views.js            # Main view components
├── components/         # Shared Vue components
├── libs/               # Core business logic classes
├── mixins/             # Vue mixins
├── modules/            # Vuex modules
├── plugins/            # Vue plugins
└── store/              # Vuex store configuration
```

## Key Components

### Core Components

1. **[Loading.vue](./components.md#loading)** - Loading indicator component
2. **[Flash.vue](./components.md#flash)** - Flash message notifications
3. **[Paginator.vue](./components.md#paginator)** - Pagination component
4. **[DateTimePicker.vue](./components.md#datetimepicker)** - Date/time selection
5. **[TinyMce.vue](./components.md#tinymce)** - Rich text editor
6. **[FloatingLoader.vue](./components.md#floatingloader)** - Floating loading overlay
7. **[Disconnected.vue](./components.md#disconnected)** - Connection status indicator

### Error Components

1. **[403.vue](./components.md#error-403)** - Forbidden access page

### Passport Components

1. **[Clients.vue](./components.md#passport-clients)** - OAuth clients management
2. **[AuthorizedClients.vue](./components.md#authorized-clients)** - Authorized clients list
3. **[PersonalAccessTokens.vue](./components.md#personal-access-tokens)** - Token management

## Core Libraries

### Base Classes

1. **[Base.js](./libs.md#base)** - Base class for all business logic classes
2. **[Form.js](./libs.md#form)** - Form handling and API submission
3. **[Errors.js](./libs.md#errors)** - Error handling and validation
4. **[Search.js](./libs.md#search)** - Search functionality base class

### Utilities

1. **[Util.js](./libs.md#util)** - Common utility functions
2. **[Customs.js](./libs.md#customs)** - Custom helper functions
3. **[Filters.js](./libs.md#filters)** - Vue filters
4. **[Permissions.js](./libs.md#permissions)** - Permission checking
5. **[MSettings.js](./libs.md#msettings)** - Module settings management

### Mixins

1. **[form_mixin.js](./libs.md#form-mixin)** - Form handling mixin
2. **[initMixin.js](./libs.md#init-mixin)** - Initialization mixin
3. **[titleMixin.js](./libs.md#title-mixin)** - Page title management
4. **[inactivityGuard.js](./libs.md#inactivity-guard)** - Session timeout handling

## Plugins

### Core Plugins

1. **[http.js](./libs.md#http-plugin)** - Axios HTTP client configuration
2. **[vue-router.js](./libs.md#router-plugin)** - Vue Router setup
3. **[vuetify.js](./libs.md#vuetify-plugin)** - Vuetify configuration
4. **[plugins.js](./libs.md#plugins)** - Plugin registration
5. **[tinymce-editor.js](./libs.md#tinymce-plugin)** - TinyMCE editor setup

### Google Maps

1. **[google_maps.js](./libs.md#google-maps)** - Google Maps integration
2. **[google_maps_color_palette.js](./libs.md#google-maps-colors)** - Map styling

## Store Management

### Store Structure

```javascript
store/
├── store.js              # Root store configuration
├── StoreGenerator.js     # Dynamic store generation
├── StoreActionUrl.js     # API URL management
└── paths.js              # Store path constants
```

### Vuex Modules

1. **[users.js](./store.md#users-module)** - User state management
2. **[passport.js](./store.md#passport-module)** - Authentication state

## Application Bootstrap

### app.js

The main application entry point that:
- Initializes Vue instance
- Registers global components
- Sets up plugins
- Configures router
- Initializes Vuex store
- Mounts the application

```javascript
import Vue from 'vue';
import router from './routes';
import store from './store/store';
import './bootstrap';

new Vue({
    el: '#app',
    router,
    store
});
```

### bootstrap.js

Handles application bootstrapping:
- Axios configuration
- Global error handlers
- Authentication setup
- Request/response interceptors

## Common Patterns

### Using Base Class

```javascript
import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './EntityRepository';

export default class Entity extends Base {
    constructor() {
        super(fields);
        this.form = new Form(fields);
    }

    async save() {
        const data = this.getFields();
        return await this.form.submit('post', '/api/entity', data);
    }
}
```

### Using Form Class

```javascript
import Form from '@app/libs/Form';

const form = new Form({
    name: '',
    email: ''
});

// Submit form
form.submit('post', '/api/users', {
    name: 'John Doe',
    email: 'john@example.com'
}).then(response => {
    console.log('Success:', response);
}).catch(error => {
    console.log('Errors:', form.errors);
});
```

### Using Search Class

```javascript
import Search from '@app/libs/Search';

export default class EntitySearch extends Search {
    constructor() {
        super();
        this.url = '/api/entity/search';
    }
}
```

## Global Mixins

### Form Mixin

Provides common form functionality:
- Error handling
- Validation
- Submission states

```javascript
export default {
    mixins: [formMixin],
    // Component code
}
```

### Title Mixin

Manages page titles:

```javascript
export default {
    mixins: [titleMixin],
    title() {
        return 'Page Title';
    }
}
```

## Permissions System

### Checking Permissions

```javascript
import { can } from '@app/libs/Permissions';

// In component
if (can('create-users')) {
    // User has permission
}

// In template
<v-btn v-if="can('edit-users')">Edit</v-btn>
```

### Permission Directives

```vue
<template>
    <div v-permission="'view-reports'">
        <!-- Content visible only with permission -->
    </div>
</template>
```

## Module Settings

### Accessing Settings

```javascript
// In component
export default {
    computed: {
        enableFeature() {
            return this.msetting('module.feature_enabled');
        }
    }
}
```

## Error Handling

### Global Error Handler

```javascript
// Automatic error handling
form.submit('post', '/api/endpoint', data)
    .catch(error => {
        // Errors automatically displayed
        // Available in form.errors
    });
```

### Custom Error Handling

```javascript
try {
    await form.submit('post', '/api/endpoint', data);
} catch (error) {
    if (error.status === 422) {
        // Validation errors
        console.log(form.errors.get('field'));
    }
}
```

## Flash Messages

### Displaying Messages

```javascript
// Success message
flash({
    alert: 'success',
    message: 'Operation completed successfully'
});

// Error message
flash({
    alert: 'error',
    message: 'An error occurred'
});

// Info message
flash({
    alert: 'info',
    message: 'Information message'
});

// Warning message
flash({
    alert: 'warning',
    message: 'Warning message'
});
```

## HTTP Client Configuration

### Axios Setup

```javascript
// Request interceptor
axios.interceptors.request.use(config => {
    // Add authentication token
    config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Response interceptor
axios.interceptors.response.use(
    response => response,
    error => {
        // Handle errors globally
        return Promise.reject(error);
    }
);
```

## Router Configuration

### Route Guards

```javascript
router.beforeEach((to, from, next) => {
    // Authentication check
    if (to.meta.requiresAuth && !isAuthenticated()) {
        next('/login');
    } else {
        next();
    }
});
```

## Best Practices

### 1. Component Development

- Use single-file components (.vue)
- Keep components focused and reusable
- Use props for data input
- Emit events for data output
- Document component props and events

### 2. State Management

- Use Vuex for shared state
- Keep component state local when possible
- Use getters for computed state
- Use actions for async operations
- Use mutations for state changes

### 3. API Integration

- Use Form class for API calls
- Handle errors gracefully
- Show loading states
- Validate data before submission
- Use proper HTTP methods

### 4. Code Organization

- Follow module structure
- Use consistent naming conventions
- Keep files focused and small
- Document complex logic
- Write reusable code

### 5. Performance

- Lazy load routes
- Use computed properties
- Avoid unnecessary watchers
- Optimize component rendering
- Use virtual scrolling for large lists

## Testing

### Unit Tests

```javascript
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

describe('Component', () => {
    it('renders correctly', () => {
        const wrapper = mount(Component);
        expect(wrapper.exists()).toBe(true);
    });
});
```

## Related Documentation

- [Components Documentation](./components.md)
- [Libraries Documentation](./libs.md)
- [Store Documentation](./store.md)
- [Architecture Overview](../architecture.md)

---

**Last Updated**: December 2025  
**Version**: 1.0.0
