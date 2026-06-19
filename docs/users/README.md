# Users Module Documentation

## Overview

The Users module is the core authentication, authorization, and user management system for the entire healthcare application. It handles user registration, role-based access control, permission management, user profiles, and authentication workflows. This module integrates with Sentinel authentication library and provides comprehensive role-permission management.

## Module Structure

```
users/js/
├── [`users/js/paths.js`](users/js/paths.js )            # Route path constants
├── [`users/js/routes.js`](users/js/routes.js )           # Route definitions
├── [`users/js/views.js`](users/js/views.js )            # Main view components
├── components/         # Vue components
│   ├── Customs.vue              # Custom passport setup
│   ├── CustomsClear.vue          # Clear customs/passport
│   ├── customs_mixin.js          # Customs shared mixin
│   ├── users/                    # User management
│   │   ├── Index.vue             # Users listing
│   │   ├── UsersSearch.vue       # User search component
│   │   ├── Filters.vue           # User filtering
│   │   ├── CheckedInBy.vue       # Check-in tracking
│   │   ├── SeenByUsers.vue       # Visit tracking
│   │   ├── Signature.vue         # User signature capture
│   │   └── CompanySearch.vue     # Company/department search
│   └── widgets/                  # Dashboard widgets
└── libs/               # Business logic classes
    └── users/
        ├── User.js               # User class
        └── UserRepository.js     # User repository
```

## Key Features

### 1. User Management
- User registration and account creation
- User profile management (first name, last name, title, job description)
- User information updates
- User status management (active/inactive)
- User deactivation and deletion
- Password management and reset
- Email verification

### 2. Authentication
- User login with username/email
- Password hashing and security
- Session management
- Passport token generation
- Automatic session timeout
- Login attempt tracking
- Remember me functionality

### 3. Role-Based Access Control (RBAC)
- Multiple role assignment per user
- Role creation and management
- Predefined system roles:
  - **Superadministrator** - Full system access
  - **Administrator** - Administrative access
  - **User** - Standard user access
  - **Custom Roles** - Department/module specific roles

### 4. Permission Management
- Fine-grained permission control
- Permission assignment to roles
- Resource-based permissions (create, read, update, delete)
- Module-specific permissions
- Dynamic permission checking
- Permission caching

### 5. User Profiles
- Profile information:
  - Title (Dr., Nurse, etc.)
  - First and last names
  - Job description
  - Phone number
  - Department assignment
- Profile photo/avatar upload
- Contact information management

### 6. User Search and Filtering
- Search by username, email, name
- Filter by role/department
- Filter by status (active/inactive)
- Filter by date range
- Autocomplete search
- Multiple search criteria

### 7. User Activities Tracking
- Check-in tracking (who checked in patient)
- Visit tracking (which users saw patient)
- Action logging
- User activity history
- Audit trail

### 8. Signature Capture
- Digital signature capture
- Signature verification
- Signature storage
- Clinical signature for documents

## Component Documentation

### Customs.vue

Manages passport initialization and user authentication setup.

**Features**:
- Passport token setup
- User session initialization
- Permission loading
- Settings initialization
- Local storage management

**Props**:
- `passport` - Authentication token data
- `clinicId` - Current facility/clinic ID
- `permissions` - User permissions object

**Key Methods**:
```javascript
setUser()                           // Store user in localStorage
setUserPermissionsToLocalStorage()  // Store permissions
setSettingsToLocalStorage()         // Store system settings
setClinic()                         // Set current clinic
```

### CustomsClear.vue

Clears cached passport and user data from localStorage.

**Features**:
- Clear authentication token
- Clear user session
- Clear permissions cache
- Clear settings cache
- Logout functionality

### Users/Index.vue

Main users management interface with listing and filtering.

**Features**:
- User list with pagination
- Column display:
  - Username
  - Email
  - Roles
  - Registration date
  - Actions (edit, delete, view profile)
- User filtering by role and status
- User search
- Bulk actions
- User profile access

**Key Methods**:
```javascript
initialize()        // Load users list
reloadData()       // Refresh data
profile(user)      // Open user profile
```

### Users/UsersSearch.vue

User selection component with autocomplete search.

**Features**:
- Real-time user search
- Autocomplete results
- Filter by roles
- Filter by role-like pattern
- User selection callback
- Custom label support

**Props**:
- `roles` - Exact role match filter
- `rolesLike` - LIKE pattern role filter
- `label` - Component label
- `outlined` - Outlined style
- `required` - Required field
- `userList` - Show full user list

**Example Usage**:
```vue
<users-search 
  :roles="['doctor', 'nurse']"
  label="Select attending physician"
  @selected="onUserSelected"
/>
```

### Users/Filters.vue

User listing filters and search criteria.

**Features**:
- Role-based filtering
- Status filtering (active/inactive)
- Date range filtering (start_date)
- Real-time filter application
- Filter clearing

**Filter Fields**:
```javascript
filters: {
  role: null,
  status: null,
  start_date: null
}
```

### Users/CheckedInBy.vue

Displays which user checked in the current patient/visit.

**Features**:
- Check-in user display
- Check-in timestamp
- Check-in location/station
- Check-in details

### Users/SeenByUsers.vue

Shows all users who have interacted with or seen a patient.

**Features**:
- Visit user list
- Timeline of interactions
- Department/specialty view
- Date/time of interaction

### Users/Signature.vue

Captures and displays user digital signatures.

**Features**:
- Signature pad integration
- Clear signature
- Save signature
- Verify signature
- Signature display

## Business Logic Classes

### User.js

Core user class for user operations.

```javascript
export default class User extends Base {
    constructor() {
        super(fields);
        this.form = new Form(fields);
    }

    // User fields
    username;
    email;
    password;
    first_name;
    last_name;
    active;

    // Methods
    save() {
        return this.form.submit('post', '/api/users', this.getFieldsExcept(['form']));
    }

    update() {
        return this.form.submit('put', `/api/users/${this.id}`, this.getFieldsExcept(['form']));
    }

    delete() {
        return this.form.submit('delete', `/api/users/${this.id}`);
    }

    assignRole(roleId) {
        return this.form.submit('post', `/api/users/${this.id}/roles`, { role_id: roleId });
    }

    attachPermission(permissionId) {
        return this.form.submit('post', `/api/users/${this.id}/permissions`, { permission_id: permissionId });
    }
}
```

**Fields**:
- `id` - User ID
- `username` - Unique username
- `email` - User email
- `password` - Encrypted password
- `first_name` - First name
- `last_name` - Last name
- `active` - Status flag
- `created_at` - Registration date
- `updated_at` - Last update date

### UserRepository.js

User data repository and API communication.

```javascript
export default class UserRepository {
    // Get all users
    static getAllUsers(page = 1, params = {}) {
        return window.axios.get(`/api/users?page=${page}`, { params });
    }

    // Get single user
    static getUser(userId) {
        return window.axios.get(`/api/users/${userId}`);
    }

    // Search users
    static searchUsers(query, filters = {}) {
        return window.axios.post('/api/users/search', { 
            query, 
            filters 
        });
    }

    // Get user by role
    static getUsersByRole(role) {
        return window.axios.get(`/api/users/role/${role}`);
    }
}
```

## API Endpoints

### User Management

```
GET    /api/users                          # List all users
POST   /api/users                          # Create new user
GET    /api/users/{id}                     # Get specific user
PUT    /api/users/{id}                     # Update user
DELETE /api/users/{id}                     # Delete user
POST   /api/users/search                   # Search users
GET    /api/users/role/{role}              # Get users by role
```

### Authentication

```
POST   /api/users/authenticate             # User login
GET    /api/users/logout                   # User logout
POST   /api/users/password-reset           # Reset password
POST   /api/users/verify-email             # Email verification
```

### Roles & Permissions

```
POST   /api/users/{id}/roles               # Assign role to user
DELETE /api/users/{id}/roles/{roleId}      # Remove role from user
GET    /api/users/{id}/roles               # Get user roles
POST   /api/users/{id}/permissions         # Assign permission to user
DELETE /api/users/{id}/permissions/{permissionId} # Remove permission
GET    /api/users/{id}/permissions         # Get user permissions
```

### Profile

```
GET    /api/users/{id}/profile             # Get user profile
PUT    /api/users/{id}/profile             # Update user profile
POST   /api/users/{id}/signature           # Save user signature
GET    /api/users/{id}/signature           # Get user signature
```

## Role and Permission Structure

### System Roles

**Superadministrator**
- Full system access
- All resource operations (CRUD)
- User management
- Role and permission management

**Administrator**
- Administrative access
- User management
- ACL management
- Profile management

**User**
- Profile access
- Basic operations

### Permission Types

**Resource Permissions**
```
create  # Can create resource
read    # Can view resource
update  # Can update resource
delete  # Can delete resource
```

**Module Permissions**
- `users.index` - View users list
- `users.create` - Create new user
- `users.read` - View user details
- `users.update` - Update user
- `users.delete` - Delete user
- `users.profile-info` - View profile info
- `users.profile-credentials` - Manage credentials

### Permission Structure Example

```php
'role_structure' => [
    'superadministrator' => [
        'users' => 'c,r,u,d',    // All CRUD operations
        'acl' => 'c,r,u,d',
        'profile' => 'r,u'
    ],
    'administrator' => [
        'users' => 'c,r,u,d',
        'profile' => 'r,u'
    ],
    'user' => [
        'profile' => 'r,u'       // Can only read and update profile
    ],
]
```

## Common Workflows

### 1. User Registration

```
1. Administrator navigates to Users → Create
2. Fill user details:
   - Username
   - Email
   - Password
   - First name
   - Last name
3. Assign roles
4. Assign permissions
5. Save user
6. System sends activation email
7. User activates account
8. User logs in
```

### 2. User Login

```
1. User visits login page
2. Enter username/email
3. Enter password
4. System verifies credentials
5. Generate passport token
6. Store token in localStorage
7. Load user permissions
8. Load system settings
9. Redirect to dashboard
```

### 3. Role Assignment

```
1. Navigate to user profile
2. Go to Roles section
3. Select role from dropdown
4. Assign role
5. Confirm assignment
6. Permissions are updated
```

### 4. Permission Management

```
1. Navigate to user/role
2. Go to Permissions section
3. Select permission
4. Assign to user/role
5. Check permission takes effect
6. User can now perform action
```

### 5. User Search for Selection

```
1. Click on user selection field
2. Type user name/username/email
3. System filters and shows matching users
4. Select desired user
5. User is populated in field
```

## Authentication Flow

### Login Process

```
Client                          Server
  |                               |
  |--- POST /api/users/authenticate ---|
  |    (username, password)      |
  |                               |
  |<---- Validate credentials ----|
  |                               |
  |<---- Generate token ----------|
  |    (passport + user data)    |
  |                               |
  |--- Store in localStorage ---|
  |                               |
  |--- Load permissions --------|
  |    GET /api/users/{id}/permissions
  |                               |
  |<---- Store permissions ------|
  |                               |
  |--- Redirect to dashboard ---|
```

### Permission Check Flow

```
Client Request
    ↓
Check localStorage for token
    ↓
Extract permissions from token
    ↓
Check if user.can(permission)
    ↓
Permission granted? Show/Allow
Permission denied? Hide/Deny
```

## Storage and Caching

### LocalStorage Keys

```javascript
'immigrant'           // Passport token (user + auth data)
'permissionsKey'      // User permissions JSON
'clinic_id'           // Current clinic/facility ID
'settingsKey'         // System settings JSON
```

### Data Structure

**Immigrant (Passport Token)**
```javascript
{
    user: {
        id: 1,
        username: 'john_doe',
        email: 'john@hospital.com',
        first_name: 'John',
        last_name: 'Doe',
        roles: ['doctor']
    },
    token: 'eyJ0eXAi...',
    expires_at: '2025-12-31 23:59:59'
}
```

**Permissions**
```javascript
{
    'users.index': true,
    'users.create': true,
    'users.update': true,
    'users.delete': false,
    'finance.view-reports': true,
    'evaluation.create-consultation': true,
    // ... more permissions
}
```

## Integration Points

- **Evaluation Module**: Doctor/clinician access and consultations
- **Finance Module**: Financial officer payments and invoicing
- **Reception Module**: Receptionist check-in operations
- **Inventory Module**: Warehouse staff permissions
- **Theatre Module**: Surgical team access
- **Inpatient Module**: Ward staff permissions
- **Reports Module**: Access control for sensitive reports
- **All Modules**: Authentication and authorization

## User Permission Checking

### In Vue Components

```javascript
// Check single permission
if (this.$root.can('users.create')) {
    // Show create button
}

// Check multiple permissions
if (this.$root.can('users.update') && this.$root.can('users.delete')) {
    // Show advanced controls
}

// Check role
if (this.user.hasRole('doctor')) {
    // Show clinical features
}
```

### In API Calls

```javascript
// Permission is checked on backend
// Frontend should only hide UI elements
// Backend enforces security
window.axios.post('/api/evaluation/consultations', data)
    .catch(error => {
        if (error.response.status === 403) {
            // Handle permission denied
        }
    });
```

## Best Practices

### Security

1. **Password Management**
   - Use strong password requirements
   - Hash passwords with bcrypt
   - Implement password expiry
   - Require password change on first login

2. **Session Management**
   - Set appropriate session timeout
   - Invalidate tokens on logout
   - Implement HTTPS only
   - Secure cookie flags

3. **Permission Checking**
   - Always verify on backend
   - Don't trust frontend permission checks
   - Log permission denials
   - Implement rate limiting

4. **User Access**
   - Principle of least privilege
   - Regular audit of permissions
   - Revoke access immediately
   - Maintain audit trail

### User Management

1. **Account Creation**
   - Verify email addresses
   - Require initial password change
   - Set appropriate default role
   - Document account purpose

2. **Account Maintenance**
   - Regular access reviews
   - Deactivate unused accounts
   - Update profile information
   - Track last login

3. **Permission Assignment**
   - Use roles instead of individual permissions
   - Regular permission audits
   - Document permission changes
   - Test permission changes

## Troubleshooting

### Common Issues

**User Cannot Login**
- Verify username/email in database
- Check password reset
- Verify user status (active)
- Check account activation

**Missing Permissions**
- Refresh browser localStorage
- Verify role assignment
- Check permission inheritance
- Clear browser cache

**Search Not Finding Users**
- Verify user exists in database
- Check search filter criteria
- Ensure minimum search length (2+ chars)
- Verify user status (active)

### Debug Information

```javascript
// Check current user
const user = JSON.parse(localStorage.getItem('immigrant'));
console.log(user);

// Check permissions
const permissions = JSON.parse(localStorage.getItem('permissionsKey'));
console.log(permissions);

// Check settings
const settings = JSON.parse(localStorage.getItem('settingsKey'));
console.log(settings);

// Test permission check
console.log(window.Permissions.can('users.create'));
```

## User Profile Information

### Captured Fields

- **Account Info**
  - Username (unique)
  - Email (unique)
  - Password (hashed)
  - Status (active/inactive)

- **Personal Info**
  - First name
  - Last name
  - Title (Dr., Nurse, etc.)
  - Phone number

- **Professional Info**
  - Job description
  - Department assignment
  - Specialization
  - Qualifications

- **System Info**
  - Registration date
  - Last login date
  - Last activity
  - User signature

## Configuration

### Users Configuration

Located in `config/users.php`:

```php
'users' => [
    'titles' => [
        'dr' => 'Dr.',
        'nurse' => 'Nurse',
        'admin' => 'Administrator',
        // ... more titles
    ]
]
```

### Permissions Configuration

Located in `config/laratrust.php`:

```php
'general' => [
    'management',
    'setup',
    'theatre',
    'view-reports',
    // ... more permissions
]
```

---

**Last Updated**: December 2025  
**Version**: 1.0.0
