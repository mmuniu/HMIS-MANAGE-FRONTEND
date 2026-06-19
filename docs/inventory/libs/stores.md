# Inventory Store Libraries Documentation

## Overview

This document details all business logic classes related to store management in the inventory module.

---

## DirectOrder.js

**Location**: `inventory/js/libs/stores/DirectOrder.js`

**Purpose**: Manages direct orders from suppliers without a purchase order. Handles cart operations, calculations, and order submission.

### Class Structure

```javascript
import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './DirectOrderRepository';
import { _ } from 'vue-underscore';

export default class DirectOrder extends Base {
    constructor() {
        super(fields);
        this.form = new Form(fields);
        this.record = null;
        this.saved = false;
        this.batch = null;
    }
}
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| invoice_id | Number | Associated invoice ID |
| supplier_id | Number | Supplier ID |
| store_id | Number | Store ID |
| user_id | Number | User creating the order |
| amount | Number | Total order amount |
| payment_term_id | Number | Payment term ID |
| payment_mode_id | Number | Payment mode ID |
| products | Array | Array of products in order |
| form | Form | Form instance for API calls |
| record | Object | Current record data |
| saved | Boolean | Save status flag |
| batch | Object | Generated GRN batch |

### Methods

#### save()
Saves the direct order and creates a Goods Received Note (GRN).

```javascript
async save() {
    this.saved = false;
    
    const response = await this.form.submit(
        'post', 
        `/api/inventory/store/${this.store_id}/direct-order`, 
        this.getFields()
    );
    
    this.saved = true;
    this.batch = response.data;
    this.setFields(fields);
    
    flash({ alert: 'success', message: 'Success' });
    
    window.location.href = '/inventory/goods-received-notes/' + this.batch.id;
}
```

**Returns**: Promise with GRN data

**Actions**:
1. Submits order to API
2. Sets saved flag to true
3. Stores batch/GRN data
4. Resets form fields
5. Shows success message
6. Redirects to GRN page

**API Endpoint**: `POST /api/inventory/store/{storeId}/direct-order`

#### addToCart(product)
Adds a product to the order cart with default values.

```javascript
addToCart(product) {
    this.products.unshift({
        product_id: product.id,
        product: product.id,
        name: product.name,
        package_size: 1,
        quantity: 1,
        bonus: 0,
        expiry_date: null,
        cost: 1,
        unit_cost: 1,
        discount: 0,
        tax: 0,
        total: 1,
    });
}
```

**Parameters**:
- `product` (Object): Product to add to cart

**Product Structure**:
```javascript
{
    product_id: 1,          // Product ID
    product: 1,             // Product reference
    name: "Product Name",   // Product name
    package_size: 1,        // Items per package
    quantity: 1,            // Number of packages
    bonus: 0,               // Bonus quantity
    expiry_date: null,      // Expiry date (YYYY-MM-DD)
    cost: 1,                // Cost per package
    unit_cost: 1,           // Cost per unit item
    discount: 0,            // Discount percentage
    tax: 0,                 // Tax percentage
    total: 1                // Total cost
}
```

**Note**: Uses `unshift()` to add to beginning of array for better UX

#### removeFromCart(product)
Removes a product from the order cart.

```javascript
removeFromCart(product) {
    this.products.splice(this.products.indexOf(product), 1);
}
```

**Parameters**:
- `product` (Object): Product to remove

**Actions**:
- Finds product index in array
- Removes product using splice

#### calculateTotal(item)
Calculates the total cost for a single product line item.

```javascript
calculateTotal(item) {
    const index = this.products.indexOf(item);
    
    if (this.products[index].package_size && 
        this.products[index].quantity && 
        this.products[index].cost) {
        
        // Calculate base total
        const total = (this.products[index].quantity * this.products[index].cost);
        
        // Calculate discount amount
        const discount = (this.products[index].discount / 100) * total;
        
        // Calculate tax amount (after discount)
        const tax = (this.products[index].tax / 100) * (total - discount);
        
        // Calculate final total
        this.products[index].total = total - discount + tax;
        
        // Calculate total quantity including bonus
        const total_quantity = parseInt(this.products[index].quantity) + 
                              parseInt(this.products[index].bonus);
        
        // Calculate unit cost
        this.products[index].unit_cost = this.products[index].total / 
                                         (this.products[index].package_size * total_quantity);
        
        // Update cart total
        this.calculateCartTotal();
    }
}
```

**Parameters**:
- `item` (Object): Product item to calculate

**Calculation Steps**:
1. Calculate base total: `quantity × cost`
2. Calculate discount: `(discount% / 100) × total`
3. Calculate tax: `(tax% / 100) × (total - discount)`
4. Calculate final total: `total - discount + tax`
5. Calculate total quantity: `quantity + bonus`
6. Calculate unit cost: `total / (package_size × total_quantity)`
7. Update cart total

**Formula Summary**:
```
Base Total = Quantity × Cost
Discount Amount = (Discount% ÷ 100) × Base Total
Tax Amount = (Tax% ÷ 100) × (Base Total - Discount Amount)
Final Total = Base Total - Discount Amount + Tax Amount
Total Quantity = Quantity + Bonus
Unit Cost = Final Total ÷ (Package Size × Total Quantity)
```

#### calculateCartTotal()
Calculates the total amount for all products in the cart.

```javascript
calculateCartTotal() {
    this.amount = _.pluck(this.products, 'total').reduce((next, current) => {
        return next + current;
    });
}
```

**Actions**:
1. Extracts all 'total' values from products array
2. Sums all totals using reduce
3. Updates order amount

**Dependencies**: Uses underscore.js `pluck` method

### Usage Example

```javascript
import DirectOrder from '@inventory/libs/stores/DirectOrder';

// Create new order
const order = new DirectOrder();

// Set order details
order.store_id = 1;
order.supplier_id = 5;
order.user_id = 10;
order.payment_mode_id = 1;
order.payment_term_id = 2;

// Add products
const product = {
    id: 100,
    name: "Paracetamol 500mg"
};
order.addToCart(product);

// Update product details
order.products[0].package_size = 10;
order.products[0].quantity = 5;
order.products[0].cost = 1000;
order.products[0].discount = 5;
order.products[0].tax = 16;
order.products[0].bonus = 2;
order.products[0].expiry_date = "2025-12-31";

// Calculate totals
order.calculateTotal(order.products[0]);

// Save order
await order.save();
```

### Validation

The order should validate:
1. **Supplier ID**: Required
2. **Store ID**: Required
3. **User ID**: Required
4. **Payment Mode**: Required
5. **Payment Term**: Required
6. **Products**: At least one product
7. **Quantities**: Greater than 0
8. **Costs**: Greater than 0
9. **Expiry Dates**: Valid date format

### Error Handling

```javascript
try {
    await order.save();
    console.log('Order saved successfully');
} catch (error) {
    if (order.form.errors.any()) {
        console.log('Validation errors:', order.form.errors.display());
    }
}
```

---

## DirectOrderRepository.js

**Location**: `inventory/js/libs/stores/DirectOrderRepository.js`

**Purpose**: Defines the data structure for direct orders.

### Fields Definition

```javascript
export const fields = {
    invoice_id: 0,              // Associated invoice ID
    supplier_id: null,          // Supplier ID
    store_id: null,             // Store ID
    user_id: null,              // User ID
    amount: 0,                  // Total amount
    payment_term_id: null,      // Payment term ID
    payment_mode_id: null,      // Payment mode ID
    products: [],               // Products array
};
```

### Field Descriptions

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| invoice_id | Number | 0 | Associated invoice identifier |
| supplier_id | Number | null | ID of the supplier |
| store_id | Number | null | ID of the receiving store |
| user_id | Number | null | ID of user creating order |
| amount | Number | 0 | Total order amount |
| payment_term_id | Number | null | Payment terms (e.g., Net 30) |
| payment_mode_id | Number | null | Payment method (e.g., Cash, Credit) |
| products | Array | [] | Array of product objects |

---

## InternalOrder.js

**Location**: `inventory/js/libs/stores/InternalOrder.js`

**Purpose**: Manages internal transfers between stores within the facility.

### Class Structure

```javascript
export default class InternalOrder extends Base {
    constructor() {
        super(fields);
        this.form = new Form(fields);
    }
    
    async save() {
        // Save internal order
    }
    
    async approve() {
        // Approve internal order
    }
    
    async dispatch() {
        // Dispatch from source store
    }
    
    async receive() {
        // Receive at destination store
    }
}
```

### Key Methods

- `save()` - Creates internal order
- `approve()` - Approves order for dispatch
- `dispatch()` - Dispatches from source
- `receive()` - Receives at destination
- `cancel()` - Cancels order

---

## InternalOrderRepository.js

**Location**: `inventory/js/libs/stores/InternalOrderRepository.js`

**Purpose**: Defines internal order data structure.

### Fields

```javascript
export const fields = {
    source_store_id: null,
    destination_store_id: null,
    user_id: null,
    status: 'pending',
    products: [],
    notes: ''
};
```

---

## Store.js

**Location**: `inventory/js/libs/stores/Store.js`

**Purpose**: Main store entity management.

### Class Structure

```javascript
export default class Store extends Base {
    constructor() {
        super(fields);
        this.form = new Form(fields);
    }
    
    async save() {
        // Create or update store
    }
    
    async find(id) {
        // Retrieve store details
    }
    
    async delete(id) {
        // Delete store
    }
    
    async getProducts() {
        // Get store products
    }
}
```

---

## StoreRepository.js

**Location**: `inventory/js/libs/stores/StoreRepository.js`

**Purpose**: Defines store data structure.

### Fields

```javascript
export const fields = {
    id: null,
    name: '',
    code: '',
    type: '',
    location: '',
    manager_id: null,
    active: true
};
```

---

## StockTake.js

**Location**: `inventory/js/libs/stores/StockTake.js`

**Purpose**: Manages physical inventory counting and reconciliation.

### Key Methods

```javascript
async initiate() {
    // Start stock take
}

async recordCount(product, count) {
    // Record physical count
}

async calculateVariances() {
    // Calculate differences
}

async approve() {
    // Approve adjustments
}
```

---

## Adjustment.js

**Location**: `inventory/js/libs/stores/Adjustment.js`

**Purpose**: Handles stock adjustments.

### Adjustment Types

1. **Increase**: Add stock
2. **Decrease**: Remove stock
3. **Correction**: Fix errors
4. **Write-off**: Remove damaged/expired

### Key Methods

```javascript
async save() {
    // Save adjustment
}

async approve() {
    // Approve adjustment
}
```

---

## KnockOff.js

**Location**: `inventory/js/libs/stores/KnockOff.js`

**Purpose**: Manages stock write-offs.

### Write-off Reasons

- Expired
- Damaged
- Obsolete
- Lost
- Quality issues

---

## Dispatch.js

**Location**: `inventory/js/libs/stores/dispatches/Dispatch.js`

**Purpose**: Manages outgoing dispatches.

### Key Methods

```javascript
async create() {
    // Create dispatch
}

async confirm() {
    // Confirm dispatch
}

async track() {
    // Track dispatch status
}
```

---

## Receive.js

**Location**: `inventory/js/libs/stores/receive/Receive.js`

**Purpose**: Handles receiving of goods.

### Key Methods

```javascript
async receive() {
    // Receive goods
}

async verify() {
    // Verify quantities
}

async complete() {
    // Complete receiving
}
```

---

## Best Practices

### 1. Order Creation

```javascript
// Always initialize properly
const order = new DirectOrder();
order.store_id = storeId;
order.user_id = userId;

// Validate before saving
if (order.products.length === 0) {
    throw new Error('No products in order');
}

await order.save();
```

### 2. Calculations

```javascript
// Always recalculate after changes
order.products[0].quantity = 10;
order.calculateTotal(order.products[0]);
```

### 3. Error Handling

```javascript
try {
    await order.save();
} catch (error) {
    if (order.form.errors.has('supplier_id')) {
        console.log('Supplier error:', order.form.errors.get('supplier_id'));
    }
}
```

### 4. State Management

```javascript
// Check states before actions
if (order.form.loading) {
    // Show loading indicator
}

if (order.saved) {
    // Handle success
}
```

---

**Last Updated**: December 2025  
**Version**: 1.0.0
