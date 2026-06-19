# CollabMed System Architecture

## Overview

CollabMed is a modular medical management system designed to handle various hospital operations including patient management, inventory control, financial operations, and clinical workflows.

## Technology Stack

### Frontend
- **Framework**: Vue.js 2.x
- **UI Library**: Vuetify 2.x (Material Design)
- **State Management**: Vuex
- **Routing**: Vue Router
- **HTTP Client**: Axios
- **Build Tool**: Webpack
- **Language**: JavaScript (ES6+)

### Backend
- **Framework**: Laravel (PHP)
- **API**: RESTful API
- **Authentication**: Laravel Passport (OAuth2)
- **Database**: MySQL/PostgreSQL

### Real-time Communication
- **WebSockets**: Socket.io
- **Event Broadcasting**: Laravel Echo

## Architecture Patterns

### 1. Modular Architecture

The application is divided into independent modules, each representing a hospital department or functional area:

```
┌─────────────────────────────────────────────────────────┐
│                    Platform (Core)                       │
│  - Base Classes                                          │
│  - Shared Components                                     │
│  - Utilities & Helpers                                   │
│  - Global State Management                               │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│   Inventory    │  │  Reception  │  │   Evaluation    │
│   Module       │  │   Module    │  │    Module       │
└────────────────┘  └─────────────┘  └─────────────────┘
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│    Finance     │  │  Inpatient  │  │    Theatre      │
│    Module      │  │   Module    │  │    Module       │
└────────────────┘  └─────────────┘  └─────────────────┘
```

### 2. Repository Pattern

Each entity uses a repository pattern to define its data structure:

**Repository File** (`EntityRepository.js`):
```javascript
export const fields = {
    id: null,
    name: '',
    description: '',
    created_at: null,
    updated_at: null
};
```

**Benefits**:
- Centralized data structure definition
- Easy to maintain and update
- Type safety through consistent structure
- Reusable across components

### 3. Base Class Pattern

All business logic classes extend a common Base class:

```javascript
import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './EntityRepository';

export default class Entity extends Base {
    constructor() {
        super(fields);
        this.form = new Form(fields);
        this.saved = false;
    }

    async save() {
        const response = await this.form.submit(
            'post', 
            '/api/entity', 
            this.getFields()
        );
        this.saved = true;
        return response;
    }
}
```

**Base Class Responsibilities**:
- Field initialization
- Field manipulation (get, set, reset)
- Common utility methods
- Error handling

### 4. Form Handling Pattern

The Form class handles all API interactions:

```javascript
class Form {
    constructor(fields) {
        this.errors = new Errors(fields);
        this.submitted = false;
        this.errorDetected = false;
        this.loading = false;
    }

    submit(method, url, data, headers) {
        // Handles API calls
        // Manages loading states
        // Processes errors
        // Returns promises
    }
}
```

**Features**:
- Automatic error handling
- Loading state management
- Success/failure callbacks
- Validation error display
- Request/response interceptors

## Component Architecture

### Component Hierarchy

```
App.vue
│
├── Platform Components (Global)
│   ├── Navigation
│   ├── Flash Messages
│   ├── Loading Indicators
│   └── Error Handlers
│
└── Module Components
    ├── Index (List View)
    │   ├── Filters
    │   ├── Data Table
    │   └── Pagination
    │
    ├── Create (Form View)
    │   └── Form Components
    │
    ├── Edit (Form View)
    │   └── Form Components
    │
    └── Show (Detail View)
        └── Detail Components
```

### Component Types

#### 1. Page Components
- Top-level route components
- Handle data fetching
- Manage page state
- Located in `components/` directory

#### 2. Partial Components
- Reusable sub-components
- Receive data via props
- Emit events to parent
- Located in `components/*/partials/` directories

#### 3. Search Components
- Autocomplete/search functionality
- API integration
- Result handling
- Located in `components/searches/` directories

#### 4. Widget Components
- Dashboard widgets
- Summary displays
- Quick actions
- Located in `components/widgets/` directories

## State Management

### Vuex Store Structure

```javascript
store/
├── index.js              # Root store
├── modules/
│   ├── inventory.js      # Inventory state
│   ├── reception.js      # Reception state
│   ├── settings.js       # Settings state
│   └── ...
```

### Store Module Pattern

```javascript
export default {
    state: {
        items: [],
        loading: false,
        filters: {}
    },
    
    getters: {
        getItems: state => state.items,
        isLoading: state => state.loading
    },
    
    mutations: {
        SET_ITEMS(state, items) {
            state.items = items;
        },
        SET_LOADING(state, loading) {
            state.loading = loading;
        }
    },
    
    actions: {
        async fetchItems({ commit }) {
            commit('SET_LOADING', true);
            const response = await axios.get('/api/items');
            commit('SET_ITEMS', response.data);
            commit('SET_LOADING', false);
        }
    }
};
```

## Routing Architecture

### Route Structure

```javascript
// Module routes.js
export default [
    {
        path: '/module',
        component: Layout,
        children: [
            {
                path: '',
                name: 'module.index',
                component: Index
            },
            {
                path: 'create',
                name: 'module.create',
                component: Create
            },
            {
                path: ':id',
                name: 'module.show',
                component: Show
            },
            {
                path: ':id/edit',
                name: 'module.edit',
                component: Edit
            }
        ]
    }
];
```

### Route Guards

```javascript
router.beforeEach((to, from, next) => {
    // Authentication check
    if (to.meta.requiresAuth && !isAuthenticated()) {
        next('/login');
    }
    
    // Permission check
    if (to.meta.permission && !hasPermission(to.meta.permission)) {
        next('/403');
    }
    
    next();
});
```

## API Integration

### Request Flow

```
Component
    │
    ├─> Business Logic Class
    │       │
    │       ├─> Form.submit()
    │       │       │
    │       │       ├─> Axios Request
    │       │       │       │
    │       │       │       ├─> Laravel API
    │       │       │       │       │
    │       │       │       │       └─> Database
    │       │       │       │
    │       │       │       └─> Response
    │       │       │
    │       │       └─> Error Handling
    │       │
    │       └─> State Update
    │
    └─> UI Update
```

### API Endpoint Conventions

```
GET    /api/module/entity              # List all
POST   /api/module/entity              # Create new
GET    /api/module/entity/{id}         # Show one
PUT    /api/module/entity/{id}         # Update
DELETE /api/module/entity/{id}         # Delete
POST   /api/module/entity/search       # Search
GET    /api/module/entity/{id}/related # Related data
```

### Request/Response Format

**Request**:
```javascript
{
    headers: {
        'Authorization': 'Bearer {token}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    data: {
        // Request payload
    }
}
```

**Success Response**:
```javascript
{
    data: {
        // Response data
    },
    message: 'Success message',
    alert: 'success'
}
```

**Error Response**:
```javascript
{
    message: 'Error message',
    errors: {
        field: ['Validation error']
    },
    alert: 'error'
}
```

## Real-time Communication

### WebSocket Architecture

```
Client (Vue.js)
    │
    ├─> Socket.io Client
    │       │
    │       ├─> Connect to WebSocket Server
    │       │       │
    │       │       └─> Node.js Socket Server
    │       │               │
    │       │               └─> Laravel Broadcasting
    │       │
    │       ├─> Listen to Events
    │       │   - notifications
    │       │   - updates
    │       │   - alerts
    │       │
    │       └─> Emit Events
    │           - user actions
    │           - status changes
    │
    └─> Update UI
```

### Event Broadcasting

```javascript
// Client-side subscription
Echo.channel('notifications')
    .listen('NewNotification', (e) => {
        // Handle notification
    });

// Server-side broadcast
broadcast(new NewNotification($data));
```

## Security Architecture

### Authentication Flow

```
1. User Login
    ↓
2. Laravel Passport Token Generation
    ↓
3. Token Storage (localStorage/sessionStorage)
    ↓
4. Token Included in API Requests
    ↓
5. Server Validates Token
    ↓
6. Request Processed or Rejected
```

### Authorization

- **Role-Based Access Control (RBAC)**
- **Permission-Based Access**
- **Route Guards**
- **API Middleware**

### Security Measures

1. **CSRF Protection**: Laravel CSRF tokens
2. **XSS Prevention**: Vue.js automatic escaping
3. **SQL Injection**: Laravel Eloquent ORM
4. **Authentication**: OAuth2 via Passport
5. **HTTPS**: Encrypted communication
6. **Input Validation**: Client and server-side

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**: Lazy loading routes
2. **Component Lazy Loading**: Dynamic imports
3. **Asset Optimization**: Minification and compression
4. **Caching**: Browser caching strategies
5. **Virtual Scrolling**: Large lists optimization

### API Optimization

1. **Pagination**: Limit data transfer
2. **Eager Loading**: Reduce N+1 queries
3. **Caching**: Redis/Memcached
4. **Query Optimization**: Database indexing
5. **Response Compression**: Gzip/Brotli

## Error Handling

### Error Hierarchy

```
Global Error Handler
    │
    ├─> Network Errors
    │   └─> Retry logic
    │
    ├─> Validation Errors
    │   └─> Display field errors
    │
    ├─> Authorization Errors
    │   └─> Redirect to login
    │
    └─> Server Errors
        └─> Display error message
```

### Error Display

- **Flash Messages**: Temporary notifications
- **Inline Errors**: Field-level validation
- **Modal Dialogs**: Critical errors
- **Console Logging**: Development debugging

## Testing Strategy

### Unit Tests
- Component logic
- Business logic classes
- Utility functions

### Integration Tests
- API integration
- Component interaction
- State management

### E2E Tests
- User workflows
- Critical paths
- Cross-module functionality

## Deployment Architecture

```
Development → Staging → Production

Build Process:
1. npm run build
2. Asset compilation
3. Code minification
4. Source maps generation
5. Deployment to server
```

## Module Communication

### Inter-Module Communication

1. **Vuex Store**: Shared state
2. **Event Bus**: Global events
3. **Props/Events**: Component communication
4. **API**: Backend coordination

### Module Independence

- Each module can function independently
- Shared dependencies via platform module
- Loose coupling through interfaces
- Clear module boundaries

## Scalability Considerations

1. **Horizontal Scaling**: Load balancing
2. **Vertical Scaling**: Resource optimization
3. **Database Scaling**: Replication and sharding
4. **Caching Layer**: Redis cluster
5. **CDN**: Static asset delivery
6. **Microservices**: Future consideration

## Monitoring and Logging

### Frontend Monitoring
- Error tracking (Sentry)
- Performance monitoring
- User analytics
- Console logging

### Backend Monitoring
- API response times
- Error rates
- Database queries
- Server resources

---

**Last Updated**: December 2025  
**Version**: 1.0.0
