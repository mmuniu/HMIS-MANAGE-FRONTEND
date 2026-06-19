# Inventory Module Documentation

## Overview

The Inventory module is a comprehensive stock and inventory management system that handles all aspects of medical supplies, pharmaceuticals, and equipment management within the CollabMed system.

## Module Structure

```
inventory/js/
├── module.js           # Module initialization
├── paths.js            # Route path constants
├── routes.js           # Route definitions
├── views.js            # Main view components
├── components/         # Vue components
│   ├── stores/         # Store management
│   ├── products/       # Product management
│   ├── suppliers/      # Supplier management
│   ├── purchase_orders/# Purchase order management
│   ├── requisitions/   # Requisition management
│   ├── pos/            # Point of Sale
│   ├── invoices/       # Invoice management
│   ├── grns/           # Goods Received Notes
│   └── ...
└── libs/               # Business logic classes
    ├── stores/         # Store-related classes
    ├── products/       # Product-related classes
    ├── suppliers/      # Supplier-related classes
    └── ...
```

## Key Features

### 1. Store Management
- Multiple store/warehouse support
- Store product inventory tracking
- Stock transfers between stores
- Stock adjustments and reconciliation
- Stock take/physical inventory

### 2. Product Management
- Product catalog management
- Product categories and classifications
- Measurement units
- Tax categories
- Product pricing
- Batch and expiry tracking

### 3. Supplier Management
- Supplier database
- Supplier accounts
- Payment terms and modes
- Supplier statements
- Direct orders from suppliers

### 4. Purchase Management
- Purchase requisitions
- Purchase orders (LPO)
- Purchase order approvals
- Goods Received Notes (GRN)
- Invoice matching

### 5. Point of Sale (POS)
- Pharmacy POS
- Sales transactions
- Receipt generation
- Sales reports
- Payment processing

### 6. Inventory Operations
- Stock receiving
- Stock issuing
- Internal orders
- Direct orders
- Dispatch orders
- Stock knock-off

### 7. Reporting
- Stock movement reports
- Stock value reports
- Audit reports
- Expiry reports
- Sales reports

## Component Documentation

### Store Management Components

#### [DirectOrders.vue](./components/stores-management.md#directorders)
Handles receiving goods directly from suppliers without a purchase order.

**Features**:
- Supplier selection
- Product search and addition
- Quantity and pricing management
- Bonus tracking
- Expiry date management
- Tax and discount calculations
- Payment terms and modes

#### [InternalOrders.vue](./components/stores-management.md#internalorders)
Manages orders between internal stores/departments.

#### [StoreProducts.vue](./components/stores-management.md#storeproducts)
Displays and manages products in a specific store.

#### [StockTake.vue](./components/stores-management.md#stocktake)
Handles physical inventory counting and reconciliation.

#### [IssueProducts.vue](./components/stores-management.md#issueproducts)
Issues products from store to departments or patients.

#### [Receive.vue](./components/stores-management.md#receive)
Receives products into store from various sources.

#### [DispatchOrders.vue](./components/stores-management.md#dispatchorders)
Manages outgoing orders to other facilities or departments.

### Product Management Components

#### [Products/Index.vue](./components/products.md#index)
Lists all products with search and filter capabilities.

#### [Products/Create.vue](./components/products.md#create)
Creates new products in the system.

#### [Products/Edit.vue](./components/products.md#edit)
Edits existing product information.

### Supplier Management Components

#### [Suppliers/Index.vue](./components/suppliers.md#index)
Lists all suppliers with management options.

#### [Suppliers/Create.vue](./components/suppliers.md#create)
Adds new suppliers to the system.

#### [Suppliers/ProfileDetails.vue](./components/suppliers.md#profiledetails)
Displays detailed supplier information and account status.

### Purchase Order Components

#### [PurchaseOrders/Index.vue](./components/purchase-orders.md#index)
Lists all purchase orders with filtering.

#### [PurchaseOrders/Create.vue](./components/purchase-orders.md#create)
Creates new purchase orders.

#### [PurchaseOrders/Show.vue](./components/purchase-orders.md#show)
Displays purchase order details.

#### [PurchaseOrders/ApproveLpo.vue](./components/purchase-orders.md#approvelpo)
Handles purchase order approval workflow.

### Requisition Components

#### [Requisitions/Index.vue](./components/requisitions.md#index)
Lists all requisitions.

#### [Requisitions/Create.vue](./components/requisitions.md#create)
Creates new requisitions.

#### [Requisitions/RaiseLpo.vue](./components/requisitions.md#raiselpo)
Converts requisitions to purchase orders.

### POS Components

#### [POS/Index.vue](./components/pos.md#index)
Main point of sale interface.

#### [POS/Show.vue](./components/pos.md#show)
Displays POS transaction details.

## Business Logic Classes

### Store Classes

#### [Store.js](./libs/stores.md#store)
Main store entity class.

**Key Methods**:
- `save()` - Creates/updates store
- `find(id)` - Retrieves store details
- `delete(id)` - Deletes store

#### [DirectOrder.js](./libs/stores.md#directorder)
Handles direct orders from suppliers.

**Key Methods**:
- `save()` - Saves direct order
- `addToCart(product)` - Adds product to order
- `removeFromCart(product)` - Removes product from order
- `calculateTotal(item)` - Calculates item total
- `calculateCartTotal()` - Calculates order total

#### [InternalOrder.js](./libs/stores.md#internalorder)
Manages internal store transfers.

#### [StockTake.js](./libs/stores.md#stocktake)
Handles stock counting and reconciliation.

#### [Adjustment.js](./libs/stores.md#adjustment)
Manages stock adjustments.

### Product Classes

#### [Product.js](./libs/products.md#product)
Main product entity class.

**Key Methods**:
- `save()` - Creates/updates product
- `find(id)` - Retrieves product details
- `delete(id)` - Deletes product

#### [StoreProduct.js](./libs/products.md#storeproduct)
Manages products within specific stores.

#### [ProductCategory.js](./libs/products.md#productcategory)
Handles product categorization.

### Supplier Classes

#### [Supplier.js](./libs/suppliers.md#supplier)
Main supplier entity class.

**Key Methods**:
- `save()` - Creates/updates supplier
- `find(id)` - Retrieves supplier details
- `getAccount()` - Gets supplier account information

### Purchase Order Classes

#### [PurchaseOrder.js](./libs/purchase-orders.md#purchaseorder)
Manages purchase orders.

**Key Methods**:
- `save()` - Creates purchase order
- `approve()` - Approves purchase order
- `addProduct()` - Adds product to order
- `calculateTotal()` - Calculates order total

### Requisition Classes

#### [Requisition.js](./libs/requisitions.md#requisition)
Handles requisition management.

**Key Methods**:
- `save()` - Creates requisition
- `approve()` - Approves requisition
- `convertToLpo()` - Converts to purchase order

## API Endpoints

### Store Endpoints

```
GET    /api/inventory/stores                    # List stores
POST   /api/inventory/stores                    # Create store
GET    /api/inventory/stores/{id}               # Show store
PUT    /api/inventory/stores/{id}               # Update store
DELETE /api/inventory/stores/{id}               # Delete store
GET    /api/inventory/stores/{id}/products      # Store products
POST   /api/inventory/store/{id}/direct-order   # Create direct order
```

### Product Endpoints

```
GET    /api/inventory/products                  # List products
POST   /api/inventory/products                  # Create product
GET    /api/inventory/products/{id}             # Show product
PUT    /api/inventory/products/{id}             # Update product
DELETE /api/inventory/products/{id}             # Delete product
POST   /api/inventory/products/search           # Search products
```

### Supplier Endpoints

```
GET    /api/inventory/suppliers                 # List suppliers
POST   /api/inventory/suppliers                 # Create supplier
GET    /api/inventory/suppliers/{id}            # Show supplier
PUT    /api/inventory/suppliers/{id}            # Update supplier
DELETE /api/inventory/suppliers/{id}            # Delete supplier
GET    /api/inventory/suppliers/{id}/account    # Supplier account
```

### Purchase Order Endpoints

```
GET    /api/inventory/purchase-orders           # List purchase orders
POST   /api/inventory/purchase-orders           # Create purchase order
GET    /api/inventory/purchase-orders/{id}      # Show purchase order
PUT    /api/inventory/purchase-orders/{id}      # Update purchase order
POST   /api/inventory/purchase-orders/{id}/approve # Approve purchase order
```

## State Management

### Vuex Store Modules

The inventory module uses Vuex for state management:

```javascript
// Store state
state: {
    stores: [],
    products: [],
    suppliers: [],
    paymentModes: [],
    paymentTerms: [],
    currentStore: null
}

// Getters
getters: {
    getStores: state => state.stores,
    getProducts: state => state.products,
    getPaymentModes: state => state.paymentModes,
    getPaymentTerms: state => state.paymentTerms
}

// Actions
actions: {
    setStores({ commit }),
    setProducts({ commit }),
    setPaymentModes({ commit }),
    setPaymentTerms({ commit })
}
```

## Common Workflows

### 1. Direct Order Workflow

```
1. Select Supplier
2. Choose Payment Mode & Terms
3. Search and Add Products
4. Enter Quantities and Pricing
5. Set Expiry Dates
6. Apply Discounts/Taxes
7. Review Total
8. Submit Order
9. Generate GRN
```

### 2. Purchase Order Workflow

```
1. Create Requisition
2. Approve Requisition
3. Convert to Purchase Order
4. Send to Supplier
5. Receive Goods (GRN)
6. Match Invoice
7. Process Payment
```

### 3. Internal Transfer Workflow

```
1. Create Internal Order
2. Select Source Store
3. Select Destination Store
4. Add Products
5. Approve Order
6. Dispatch from Source
7. Receive at Destination
```

### 4. Stock Take Workflow

```
1. Initiate Stock Take
2. Count Physical Stock
3. Enter Counted Quantities
4. Compare with System Stock
5. Identify Variances
6. Approve Adjustments
7. Update System Stock
```

## Integration Points

### With Other Modules

1. **Reception Module**: Patient prescriptions for POS
2. **Evaluation Module**: Prescription sending to suppliers
3. **Finance Module**: Payment processing and accounting
4. **Settings Module**: System configuration and schemes

## Security & Permissions

### Required Permissions

- `inventory.view` - View inventory data
- `inventory.create` - Create inventory items
- `inventory.edit` - Edit inventory items
- `inventory.delete` - Delete inventory items
- `inventory.approve` - Approve orders/requisitions
- `inventory.receive` - Receive goods
- `inventory.issue` - Issue products
- `inventory.adjust` - Adjust stock levels

## Best Practices

### 1. Stock Management

- Always verify quantities before receiving
- Record expiry dates accurately
- Perform regular stock takes
- Monitor slow-moving items
- Track batch numbers

### 2. Order Processing

- Verify supplier information
- Check pricing against contracts
- Validate quantities
- Document all transactions
- Maintain audit trail

### 3. Data Entry

- Use product search for consistency
- Validate expiry dates
- Double-check calculations
- Save frequently
- Review before submission

### 4. Reporting

- Generate regular reports
- Monitor stock levels
- Track expiring items
- Analyze usage patterns
- Review supplier performance

## Troubleshooting

### Common Issues

1. **Product Not Found**: Ensure product is active and in correct store
2. **Calculation Errors**: Verify tax and discount percentages
3. **Permission Denied**: Check user permissions
4. **Stock Discrepancies**: Perform stock take and reconciliation

## Related Documentation

- [Store Management Components](./components/stores-management.md)
- [Product Management](./components/products.md)
- [Supplier Management](./components/suppliers.md)
- [Purchase Orders](./components/purchase-orders.md)
- [Business Logic Classes](./libs/stores.md)

---

**Last Updated**: December 2025  
**Version**: 1.0.0
