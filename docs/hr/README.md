# HR Module Documentation

## Overview

The HR (Human Resources) module manages staff information, employment records, and human resource operations.

## Key Features

- **Staff Management**: Employee records and profiles
- **Department Assignment**: Staff-department relationships
- **Role Management**: Job roles and responsibilities
- **Leave Management**: Leave requests and approvals
- **Attendance**: Time and attendance tracking
- **Payroll Integration**: Staff payment information

## Module Structure

```
hr/js/
├── paths.js
├── views.js
├── components/
│   ├── staff/
│   ├── departments/
│   ├── roles/
│   └── leave/
└── libs/
    ├── staff/
    └── leave/
```

## API Endpoints

```
GET    /api/hr/staff                      # List staff
POST   /api/hr/staff                      # Create staff
GET    /api/hr/staff/{id}                 # Show staff
PUT    /api/hr/staff/{id}                 # Update staff
POST   /api/hr/leave                      # Request leave
```

---

**Last Updated**: December 2025
