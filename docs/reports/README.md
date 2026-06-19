# Reports Module Documentation

## Overview

The Reports module provides comprehensive analytics, reporting, and data visualization capabilities across the entire healthcare system. It aggregates data from all modules to provide insights into operational performance, financial metrics, clinical outcomes, and compliance reporting.

## Module Structure

## Key Features

### 1. Financial Reports
- **Revenue Income**: Total revenue by source with detailed breakdown
- **Revenue Summary**: Period-wise revenue summaries
- **Cash Summary**: Daily/weekly/monthly cash collections
- **Cashier Collections**: Individual cashier performance
- **Invoice Report**: Invoice tracking and analytics
- **Insurance Status**: Insurance claim tracking
- **Exemption Report**: Patient exemptions tracking
- **Credit Note Report**: Credit notes issued
- **Clinician Summary**: Revenue by clinician/doctor
- **Department Revenue**: Revenue by department
- **Ward Revenue**: Inpatient ward revenue analysis
- **Lab Performance**: Laboratory procedure revenue
- **Radiology Performance**: Radiology procedure revenue
- **Drugs Dispensed**: Medication dispensing analysis
- **Shop Report**: Retail sales reporting
- **Lost Sales**: Uncollected invoices

### 2. Clinical Reports
- **Patient Diagnoses**: Diagnosis distribution and trends
- **Patients Seen**: Patient volume by clinician/department
- **Clinician Performance**: Doctor consultation metrics
- **Result Analytics**: Laboratory/imaging results analysis
- **Collected Samples**: Sample collection tracking
- **Radiology Reports**: Imaging procedure analysis
- **Lab-Malaria Test**: Specific disease testing
- **Pharmacy Prescriptions**: Prescription analysis
- **Lab TAT Report**: Turnaround time analysis
- **Outpatient Evaluation**: OPD consultation data
- **Inpatient Performance**: Inpatient admission metrics
- **Theatre Performance**: Surgical procedure metrics

### 3. Reception Reports
- **Patients List**: Patient registry listing
- **Patient Contacts**: Patient contact information
- **Chits Report**: Patient visit notes tracking

### 4. Inpatient Reports
- **Patient Admissions**: Admission tracking and statistics
- **Ward Admissions**: Ward occupancy and statistics

### 5. Inventory Reports
- **Stock Movement**: Stock movement tracking
- **Purchase Report**: Purchase order analytics
- **Stock Expiry**: Expiring inventory tracking
- **Store Reports**: Store-wise inventory
- **Supplier Report**: Supplier performance
- **Stock Value**: Inventory value analysis

### 6. Government Compliance Reports
- **MOH-204A/B**: Health facility reporting
- **MOH-705A**: Facility capacity reports
- **MOH-717**: Disease surveillance reports
- **MOH-2025 Physio**: Physiotherapy reporting

### 7. Data Export Capabilities
- **Excel Export**: Download reports as Excel files
- **PDF Export**: Generate PDF reports
- **CSV Export**: Export as CSV files

## Report Categories

### Financial Analytics
Revenue Reports:
├── Revenues Income
├── Revenue Summary Income
├── Cash Summary
├── Cashier Collections
├── Cashier Summary
└── Shop Report

Collections Reports:
├── Cash Receipts
├── Invoice Report
├── Waiver Report
└── Credit Note Report

Performance Reports:
├── Clinician Summary
├── Department Revenue
├── Ward Revenue
├── Inpatient Revenue
├── Lab Performance
├── Radiology Performance
└── Lost Sales

Insurance Reports:
├── Insurance Status
├── Insurance Summary
└── Drugs Dispensed

### Clinical Analytics

Patient Reports:
├── Patient Diagnoses
├── Patients Seen
├── Patient Medications
└── Patient Contacts

Performance Reports:
├── Clinician Performance
├── Inpatient Performance
├── Theatre Performance
├── Lab TAT Report
└── Radiology and Lab Performance

Procedure Reports:
├── Result Analytics
├── Collected Samples
├── Lab-Malaria Test
├── Pharmacy Prescriptions
└── Visit Investigations

### Operational Reports

Inpatient:
├── Patient Admissions
└── Ward Admissions

Inventory:
├── Stock Movement
├── Purchase Report
├── Stock Expiry
├── Store Reports
├── Supplier Report
└── Stock Value

Reception:
├── Patients List
├── Patient Contacts
└── Chits Report

## Component Documentation

### Report Components Structure

Each report typically has:
- **Index.vue** - Main report display
- **Filters.vue** - Filter criteria interface
- **DownloadToXxx.vue** - Export functionality
- **Graph.vue** (optional) - Visual representation

### Common Report Features

1. **Filtering**
   - Date range selection
   - Department/facility selection
   - User/clinician selection
   - Payment mode filtering
   - Status filtering

2. **Sorting**
   - Sortable columns
   - Multiple sort criteria
   - Ascending/descending options

3. **Pagination**
   - Page navigation
   - Results per page selection
   - Total record count

4. **Export**
   - Excel download
   - PDF generation
   - CSV export
   - Print functionality

5. **Visualization**
   - Bar charts
   - Line charts
   - Pie charts
   - Data tables

## Business Logic

### reportsMixin.js

Common mixin for all reports:

```javascript
export default {
    data() {
        return {
            module: 'finance',
            decoratorKey: 'report-key',
            obj: new ReportObject(),
            list: [],
            meta: null,
            loading: false
        };
    },

    methods: {
        // Perform filtered report
        performFilter(module, key, page = 1) {},
        
        // Get report data
        get(page, filters) {},
        
        // Export functionality
        exportExcel() {},
        exportPdf() {},
        exportCsv() {}
    }
};
```

## API Endpoints

- `GET    /api/reports/module/{module}/{report}`      # Get report data
- `GET    /api/reports/module/{module}/{report}/export` # Export report
- `GET    /api/reports/charts/{report}`               # Get chart data
- `GET    /api/reports/summary/{module}`              # Module summary

## Usage Instructions
1. Navigate to Reports section
2. Select Finance → Desired Report
3. Set filter criteria (date range, facility, etc.)
4. Click Filter/Analyze
5. Review results in table/chart
6. (Optional) Export to Excel/PDF/CSV
7. Print or save report
8. Run report with desired filters
9. Click Download to Excel/PDF/CSV button
10. Select export format
11. Customize columns (if available)
12. Download file
13. Open in appropriate application
14. Select performance report (Clinician, Department, etc.)
15. Set date range for comparison
16. Apply filters
17. View chart visualization
18. Sort by metric of interest
19. Drill down into specific records
20. Export for further analysis
21. Select MOH report (204A, 705, 717, etc.)
22. Verify data accuracy
23. Generate report for period
24. Review against MOH guidelines
25. Export for submission
26. Print formatted report

// In Filters.vue
data() {
    return {
        filters: {
            start_date: '',
            end_date: '',
            facility_id: null,
            custom_field: null  // Add custom filter
        }
    };
},

methods: {
    filter() {
        this.obj.performFilter(
            this.module,
            this.decoratorKey,
            1,
            this.filters  // Pass filters to report
        );
    }
}

// In Graph.vue
computed: {
    chartData() {
        return {
            labels: this.list.map(item => item.name),
            datasets: [{
                label: 'Revenue',
                data: this.list.map(item => item.amount),
                backgroundColor: '#3498db'
            }]
        };
    }
}


Best Practices
Performance Optimization

Limit date ranges for large reports
Use specific filters to reduce data
Paginate large result sets
Cache frequently accessed reports
Data Accuracy

Verify filter selections before running
Validate date ranges
Cross-check totals
Document report methodology
Security

Respect user permissions
Filter data by facility access
Audit report access
Protect sensitive information
Usability

Use clear column headers
Format currency values consistently
Provide total rows for key metrics
Allow multiple export formats
Maintenance

Document report calculations
Version control complex formulas
Test reports after data updates
Monitor report performance
Report Key Metrics
Financial Metrics
Total revenue
Cash vs insurance split
Revenue by payment mode
Revenue by department
Outstanding invoices
Exemptions issued
Credit notes
Clinical Metrics
Patients seen
Diagnoses frequency
Procedures performed
Lab/imaging volume
Results turnaround time
Prescription volume
Operational Metrics
Bed occupancy
Average length of stay
Staff productivity
Inventory turnover
Stock levels
Supplier performance
Troubleshooting Reports
No Data Returned
Verify filter date range
Check user permissions
Confirm data exists for period
Check facility selection
Incorrect Totals
Verify calculation logic
Check for data duplication
Validate filter criteria
Review audit trail
Slow Performance
Reduce date range
Apply more specific filters
Check database indexes
Consider report scheduling
Report Scheduling
Scheduled Report Generation
Daily operational reports
Weekly performance summaries
Monthly compliance reports
Quarterly analysis reports
Email Distribution
Automatic report delivery
Scheduled distribution times
Recipient management
Format selection

This comprehensive Reports module documentation covers:
- Complete report categorization (40+ report types)
- Module structure and components
- Key features and capabilities
- Common workflows for running reports
- Export and visualization options
- Integration points with all modules
- Customization approaches
- Best practices for report usage
- Performance optimization
- Troubleshooting guide
- Key metrics and calculations




