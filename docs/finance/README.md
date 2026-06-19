# Finance Module Documentation

## Overview

The Finance module manages all financial operations including billing, payments, invoicing, receipts, and financial reporting.

## Key Features

- **Billing Management**: Invoice generation and management
- **Payment Processing**: Cash, card, mobile money, insurance
- **Receipt Generation**: Automated receipt printing
- **Deposits**: Patient deposit management
- **Waivers**: Discount and waiver processing
- **Statements**: Patient and insurance statements
- **Voucher Management**: Payment vouchers and approvals
- **Financial Reports**: Revenue, collections, outstanding balances

## Module Structure

```
finance/js/
├── paths.js
├── routes.js
├── views.js
├── components/
│   ├── billing/
│   ├── payments/
│   ├── invoices/
│   ├── receipts/
│   └── reports/
└── libs/
    ├── billing/
    ├── payments/
    └── invoices/
```

## API Endpoints

```
POST   /api/finance/invoices              # Create invoice
GET    /api/finance/invoices/{id}         # Show invoice
POST   /api/finance/payments              # Process payment
GET    /api/finance/statements/{id}       # Generate statement
POST   /api/finance/waivers               # Apply waiver
```

## Common Workflows

### Payment Processing
1. Select patient/invoice
2. Enter payment amount
3. Choose payment method
4. Process payment
5. Generate receipt

### Invoice Generation
1. Select services/items
2. Apply scheme pricing
3. Calculate totals
4. Generate invoice
5. Send to patient

---

**Last Updated**: December 2025


## Key Features

### 1. Invoice Management
- Create invoices for services rendered
- Track invoice status (pending, paid, partial)
- Support for cash and insurance invoicing
- Invoice printing and dispatch
- Invoice cancellation and reversals

### 2. Cash Payments
- Receive cash payments from patients
- Multiple payment mode support (cash, M-Pesa, Pesapal, cards)
- Payment receipt generation
- Payment history tracking
- Change calculation for cash transactions

### 3. Patient Accounts
- Patient account balance tracking
- Deposits and withdrawals
- Account statement generation
- Patient account reconciliation
- Credit limit management

### 4. Insurance Management
- Insurance company account management
- Insurance claim tracking
- Payment settlement
- Insurance coverage validation
- Insurance discount application

### 5. Payment Modes
- **Cash**: Direct cash payments
- **M-Pesa**: Mobile money integration
- **Pesapal**: Payment gateway integration
- **Card**: Credit/debit card payments
- **Cheque**: Cheque payment tracking
- **Vouchers**: Voucher redemption
- **Gift Cards**: Gift card management
- **Loyalty Points**: Points-based redemption

### 6. Financial Reporting
- Revenue reports
- Payment collection reports
- Outstanding invoices report
- Insurance settlement reports
- Cash flow analysis

## Component Documentation

### Invoice Components
- Invoice creation and editing
- Invoice preview and printing
- Invoice dispatch to insurance
- Invoice cancellation

### Payment Components
- Cash payment reception
- Payment verification
- Receipt generation
- Payment confirmation

### Patient Account Components
- Account statement view
- Deposit and withdrawal forms
- Account history
- Balance summary

### Insurance Components
- Insurance company management
- Policy validation
- Coverage checking
- Settlement processing

## Business Logic Classes

### Invoice.php
Manages invoice creation, tracking, and payment processing.

### Payment.php
Handles all payment-related operations and validations.

### PatientAccount.php
Manages patient financial accounts and balances.

## API Endpoints

```
POST   /api/finance/invoices              # Create invoice
GET    /api/finance/invoices/{id}         # Show invoice
POST   /api/finance/payments              # Process payment
GET    /api/finance/statements/{id}       # Generate statement
POST   /api/finance/waivers               # Apply waiver
```

## Common Workflows

### Payment Processing
1. Select patient/invoice
2. Enter payment amount
3. Choose payment method
4. Process payment
5. Generate receipt

### Invoice Generation
1. Select services/items
2. Apply scheme pricing
3. Calculate totals
4. Generate invoice
5. Send to patient

---

**Last Updated**: December 2025
