# Inventory Store Management Components

## Overview

This document details all components related to store management in the inventory module, including receiving goods, issuing products, internal transfers, and stock management.

---

## DirectOrders.vue

**Location**: `inventory/js/components/stores/management/DirectOrders.vue`

**Purpose**: Handles receiving goods directly from suppliers without a purchase order. This is used for immediate purchases and emergency stock replenishment.

### Component Structure

```vue
<template>
    <!-- Supplier selection -->
    <!-- Payment terms and modes -->
    <!-- Product search and addition -->
    <!-- Data table with product details -->
    <!-- Total calculation and submission -->
</template>

<script>
export default {
    name: "direct-orders",
    props: ["userId"],
    components: {
        "products-search": ProductsSearch,
        "suppliers-search": SupplierSearch,
        "patient-search": PatientSearch
    }
}
</script>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| userId | Number/String | Yes | ID of the user creating the order |

### Data Properties

```javascript
data() {
    return {
        order: new DirectOrder(),        // Order instance
        loading: false,                  // Loading state
        datetime: "",                    // Date/time picker value
        date: "",                        // Date value
        selectedPatient: null,           // Selected patient (if prescription enabled)
        prescriptions: [],               // Patient prescriptions
        selectedPrescription: null,      // Selected prescription
        headers: [...]                   // Table headers
    }
}
```

### Computed Properties

#### initialised
Checks if required data (payment modes and terms) is loaded.

```javascript
initialised() {
    return this.getPaymentModes && this.getPaymentTerms;
}
```

#### enablePrescriptionsSending
Checks if prescription sending to suppliers is enabled.

```javascript
enablePrescriptionsSending() {
    return this.msetting('inventory.enable_prescriptions_sending_to_suppliers');
}
```

#### errors
Returns form errors.

```javascript
errors() {
    return this.order.form.errors;
}
```

#### submitted
Returns form submission status.

```javascript
submitted() {
    return this.order.form.submitted;
}
```

#### saved
Returns order save status.

```javascript
saved() {
    return this.order.saved;
}
```

### Methods

#### initialisePage()
Initializes the component with required data.

```javascript
initialisePage() {
    this.order.store_id = this.$route.params.storeId;
    this.setPaymentModes();
    this.setPaymentTerms();
    this.order.user_id = this.userId;
}
```

**Actions**:
- Sets store ID from route parameter
- Loads payment modes from API
- Loads payment terms from API
- Sets user ID on order

#### addItemToCart(product)
Adds a product to the order cart.

```javascript
addItemToCart(product) {
    this.order.addToCart(product);
    this.order.calculateTotal(this.order.products[0]);
}
```

**Parameters**:
- `product` (Object): Product to add

**Actions**:
- Adds product to order
- Calculates initial total

#### setSupplier(supplier)
Sets the supplier for the order.

```javascript
setSupplier(supplier) {
    this.order.supplier_id = supplier.id;
}
```

**Parameters**:
- `supplier` (Object): Selected supplier

#### save()
Submits the order to the API.

```javascript
save() {
    if (!this.loading) {
        this.loading = true;
        this.order.save();
    }
}
```

**Actions**:
- Prevents duplicate submissions
- Calls order save method
- Redirects to GRN page on success

#### patientSelected(patient)
Handles patient selection for prescription orders.

```javascript
patientSelected(patient) {
    this.selectedPatient = patient;
    this.prescriptions = [];
    this.selectedPrescription = null;
    this.fetchPrescriptions();
}
```

**Parameters**:
- `patient` (Object): Selected patient

#### fetchPrescriptions()
Fetches prescriptions for selected patient.

```javascript
async fetchPrescriptions() {
    if (this.selectedPatient) {
        try {
            const prescriptionLib = new Prescription();
            const response = await prescriptionLib.form.submit(
                "post", 
                "/api/evaluation/prescriptions/search", 
                { patient_id: this.selectedPatient.id }
            );
            if (response && response.data) {
                this.prescriptions = response.data;
            }
        } catch (error) {
            console.error("Error fetching prescriptions:", error);
        }
    }
}
```

#### prescriptionSelected(prescriptionId)
Handles prescription selection.

```javascript
prescriptionSelected(prescriptionId) {
    console.log("Selected prescription:", prescriptionId);
    // Additional logic for prescription handling
}
```

### Table Headers

```javascript
headers: [
    { text: "Product name", value: "name" },
    { text: "Packaging", value: "size" },
    { text: "Quantity", value: "quantity" },
    { text: "Bonus", value: "bonus" },
    { text: "Expiry Date", value: "expiry_date" },
    { text: "Unit Cost", value: "unit_cost" },
    { text: "Cost", value: "cost" },
    { text: "Discount", value: "discount" },
    { text: "Tax %", value: "tax" },
    { text: "Total", value: "total" },
    { text: "", value: "actions" }
]
```

### Watchers

#### saved
Redirects to GRN page when order is saved.

```javascript
watch: {
    saved(val) {
        if (val) {
            this.order.saved = false;
            // Redirect to GRN page
        }
    }
}
```

### Template Features

#### Supplier Selection
```vue
<suppliers-search @results="setSupplier"></suppliers-search>
```

#### Payment Configuration
```vue
<v-autocomplete 
    label="Select a payment mode" 
    :items="getPaymentModes" 
    v-model="order.payment_mode_id">
</v-autocomplete>

<v-autocomplete 
    label="Select a payment term" 
    :items="getPaymentTerms" 
    v-model="order.payment_term_id">
</v-autocomplete>
```

#### Product Search
```vue
<products-search @results="addItemToCart"></products-search>
```

#### Product Table
```vue
<v-data-table 
    :headers="headers" 
    :items="order.products">
    <!-- Editable fields for each product -->
    <template v-slot:item.quantity="{ item }">
        <v-text-field 
            v-model="item.quantity" 
            @input="order.calculateTotal(item)">
        </v-text-field>
    </template>
    <!-- More slots for other fields -->
</v-data-table>
```

### Usage Example

```vue
<template>
    <direct-orders :user-id="currentUser.id"></direct-orders>
</template>

<script>
import DirectOrders from '@inventory/components/stores/management/DirectOrders';

export default {
    components: {
        DirectOrders
    },
    computed: {
        currentUser() {
            return this.$store.getters.getCurrentUser;
        }
    }
}
</script>
```

### API Integration

**Endpoint**: `POST /api/inventory/store/{storeId}/direct-order`

**Request Payload**:
```javascript
{
    supplier_id: 1,
    store_id: 1,
    user_id: 1,
    payment_mode_id: 1,
    payment_term_id: 1,
    amount: 10000,
    products: [
        {
            product_id: 1,
            package_size: 10,
            quantity: 5,
            bonus: 2,
            expiry_date: "2025-12-31",
            cost: 1000,
            unit_cost: 20,
            discount: 5,
            tax: 16,
            total: 5800
        }
    ]
}
```

**Success Response**:
```javascript
{
    data: {
        id: 1,
        batch_number: "GRN-2025-001",
        // ... other GRN details
    },
    message: "Success",
    alert: "success"
}
```

### Calculations

#### Item Total Calculation
```javascript
// Formula
total = (quantity * cost) - discount + tax

// With percentages
discount_amount = (discount / 100) * (quantity * cost)
tax_amount = (tax / 100) * ((quantity * cost) - discount_amount)
total = (quantity * cost) - discount_amount + tax_amount
```

#### Unit Cost Calculation
```javascript
// Formula
total_quantity = quantity + bonus
unit_cost = total / (package_size * total_quantity)
```

### Validation Rules

1. **Supplier**: Required
2. **Payment Mode**: Required
3. **Payment Term**: Required
4. **Products**: At least one product required
5. **Quantity**: Must be greater than 0
6. **Package Size**: Must be greater than 0
7. **Cost**: Must be greater than 0
8. **Expiry Date**: Must be in YYYY-MM-DD format

### Best Practices

1. **Always verify supplier information** before submitting
2. **Double-check quantities and pricing** to avoid errors
3. **Enter expiry dates accurately** for proper stock management
4. **Review total calculations** before submission
5. **Save frequently** to avoid data loss

---

## InternalOrders.vue

**Location**: `inventory/js/components/stores/management/InternalOrders.vue`

**Purpose**: Manages orders between internal stores or departments within the facility.

### Key Features

- Source and destination store selection
- Product transfer management
- Approval workflow
- Order tracking
- Dispatch and receiving

### Component Structure

```javascript
export default {
    name: "internal-orders",
    data() {
        return {
            order: new InternalOrder(),
            sourceStore: null,
            destinationStore: null,
            products: []
        }
    }
}
```

### Workflow

1. Select source store
2. Select destination store
3. Add products to transfer
4. Submit order for approval
5. Approve order
6. Dispatch from source
7. Receive at destination

---

## StoreProducts.vue

**Location**: `inventory/js/components/stores/management/StoreProducts.vue`

**Purpose**: Displays and manages all products in a specific store with stock levels and details.

### Key Features

- Product listing with stock levels
- Search and filter capabilities
- Stock adjustment
- Product details view
- Batch and expiry tracking

### Data Display

```javascript
{
    product_name: "Paracetamol 500mg",
    quantity: 1000,
    unit: "Tablets",
    expiry_date: "2025-12-31",
    batch_number: "BATCH-001",
    unit_cost: 5.00,
    total_value: 5000.00
}
```

---

## StockTake.vue

**Location**: `inventory/js/components/stores/management/StockTake.vue`

**Purpose**: Handles physical inventory counting and reconciliation with system records.

### Key Features

- Physical count entry
- Variance calculation
- Adjustment approval
- Audit trail
- Reporting

### Workflow

1. Initiate stock take
2. Print count sheets
3. Perform physical count
4. Enter counted quantities
5. System calculates variances
6. Review and approve adjustments
7. Update system stock

### Variance Calculation

```javascript
variance = physical_count - system_count
variance_value = variance * unit_cost
```

---

## IssueProducts.vue

**Location**: `inventory/js/components/stores/management/IssueProducts.vue`

**Purpose**: Issues products from store to departments, patients, or other destinations.

### Key Features

- Destination selection
- Product selection
- Quantity management
- Issue documentation
- Stock deduction

### Issue Types

1. **Department Issue**: To hospital departments
2. **Patient Issue**: Direct to patients
3. **Consumption**: Internal consumption
4. **Wastage**: Damaged or expired items

---

## Receive.vue

**Location**: `inventory/js/components/stores/management/Receive.vue`

**Purpose**: Receives products into store from various sources.

### Key Features

- Source identification
- Product verification
- Quantity confirmation
- Quality check
- Stock addition

### Receiving Sources

1. **Purchase Orders**: From suppliers
2. **Internal Transfers**: From other stores
3. **Returns**: From departments
4. **Donations**: External donations

---

## DispatchOrders.vue

**Location**: `inventory/js/components/stores/management/DispatchOrders.vue`

**Purpose**: Manages outgoing orders to other facilities or external destinations.

### Key Features

- Order preparation
- Packing list generation
- Dispatch documentation
- Tracking
- Delivery confirmation

---

## KnockOff.vue

**Location**: `inventory/js/components/stores/management/KnockOff.vue`

**Purpose**: Handles stock write-offs for expired, damaged, or obsolete items.

### Key Features

- Item selection
- Reason documentation
- Approval workflow
- Stock adjustment
- Audit trail

### Knock-off Reasons

1. **Expired**: Past expiry date
2. **Damaged**: Physical damage
3. **Obsolete**: No longer used
4. **Lost**: Missing items
5. **Quality Issues**: Failed quality checks

---

## ReceivedOrders.vue

**Location**: `inventory/js/components/stores/management/ReceivedOrders.vue`

**Purpose**: Lists and manages all received orders with status tracking.

### Key Features

- Order listing
- Status filtering
- Details view
- Document access
- History tracking

---

## OrderTrail.vue

**Location**: `inventory/js/components/stores/management/OrderTrail.vue`

**Purpose**: Provides complete audit trail for order movements and changes.

### Key Features

- Timeline view
- Status changes
- User actions
- Document links
- Comments and notes

---

## Best Practices for Store Management

### 1. Receiving Goods

- Verify quantities against delivery note
- Check product quality and condition
- Record batch numbers and expiry dates
- Update system immediately
- Store documents properly

### 2. Issuing Products

- Verify requisition authorization
- Use FIFO (First In, First Out) method
- Check expiry dates before issuing
- Document all issues
- Update stock levels

### 3. Stock Takes

- Schedule regular stock takes
- Use two-person verification
- Count during low activity periods
- Investigate significant variances
- Document all adjustments

### 4. Internal Transfers

- Obtain proper authorization
- Verify destination requirements
- Use appropriate packaging
- Track transfers in real-time
- Confirm receipt at destination

### 5. Stock Adjustments

- Document reasons clearly
- Obtain necessary approvals
- Maintain audit trail
- Review regularly
- Investigate patterns

---

**Last Updated**: December 2025  
**Version**: 1.0.0
