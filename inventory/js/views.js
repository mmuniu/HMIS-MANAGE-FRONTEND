
import Vue from "vue";

import TaxCategoriesIndex from "@inventory/components/tax_categories/Index";
import TaxCategoriesCreate from "@inventory/components/tax_categories/Create";
import TaxCategoriesUpdate from "@inventory/components/tax_categories/Update";
import MeasurementUnitsIndex from "@inventory/components/measurement_units/Index";
import MeasurementUnitsCreate from "@inventory/components/measurement_units/Create";
import MeasurementUnitUpdate from "@inventory/components/measurement_units/Update";
import ProductCategoriesIndex from "@inventory/components/product_categories/Index";
import ProductCategoriesCreate from "@inventory/components/product_categories/Create";
import ProductCategoriesUpdate from "@inventory/components/product_categories/Update";
import ProductsIndex from "@inventory/components/products/Index";
import ProductsCreate from "@inventory/components/products/Create";
import ProductsEdit from "@inventory/components/products/Edit";
import StoresIndex from "@inventory/components/stores/Index";
import StoresCreate from "@inventory/components/stores/Create";
import StoresEdit from "@inventory/components/stores/Edit";
import StoresShow from "@inventory/components/stores/Show";
import RequisitionsIndex from "@inventory/components/requisitions/Index";
import RequisitionsCreate from "@inventory/components/requisitions/Create";
import RequisitionsShow from "@inventory/components/requisitions/Show";
import RequisitionsRaisesLpo from "@inventory/components/requisitions/RaiseLpo";
import RequisitionsACtivityLogs from "@inventory/components/requisitions/ActivityLogs";
import RequisitionsAdd from "@inventory/components/requisitions/Add";
import PurchaseOrdersIndex from "@inventory/components/purchase_orders/Index";
import PurchaseOrdersCreate from "@inventory/components/purchase_orders/Create";
import PurchaseOrdersShow from "@inventory/components/purchase_orders/Show";
import PurchaseOrdersGrns from "@inventory/components/purchase_orders/PurchaseOrderGrns";
import PurchaseOrdersApprove from "@inventory/components/purchase_orders/ApproveLpo";
import PurchaseOrdersGoodsReceivedNotes from "@inventory/components/goods_received_notes/Index";
import GoodsReceivedNotesTagInvoice from "@inventory/components/goods_received_notes/TagInvoice";
import GRNViewAttachedInvoice from "@inventory/components/goods_received_notes/AttachedInvoices";
import SupplierInvoice from "@inventory/components/invoices/Index";
import GoodsReceivedNotes from "@inventory/components/grns/Index";
import SupplierIndex from "@inventory/components/suppliers/Index";
import SupplierEdit from "@inventory/components/suppliers/Edit";
import SuppliersCreate from "@inventory/components/suppliers/Create";
import SupplierProfileDetails from "@inventory/components/suppliers/ProfileDetails";
import SupplierAccount from "@inventory/components/suppliers/account/Index";
import SupplierPayment from "@inventory/components/suppliers/account/Payments";
import SupplierStatement from "@inventory/components/suppliers/account/Statement";
import InventoryPointOfSale from "@inventory/components/pos/Index";
import InventoryPointOfSaleShow from "@inventory/components/pos/Show";
import ApprovalLevesIndex from "@inventory/components/setup/approval_levels/Index";
import SetupPointOfSale from "@inventory/components/setup/pos/Index";
import InventorySearchProduct from "@inventory/components/ProductsSearch";
import InventoryStoreProductSearch from "@inventory/components/StoreProductsSearch";

/*
 * Tax categories
 */
Vue.component("tax-categories-index", TaxCategoriesIndex);
Vue.component("tax-categories-create", TaxCategoriesCreate);
Vue.component("tax-categories-update", TaxCategoriesUpdate);

/*
 * Measurement units
 */
Vue.component("measurement-units-index", MeasurementUnitsIndex);
Vue.component("measurement-units-create", MeasurementUnitsCreate);
Vue.component("measurement-units-update", MeasurementUnitUpdate);


/*
 * Product categories
 */
Vue.component("product-categories-index", ProductCategoriesIndex);
Vue.component("product-categories-create", ProductCategoriesCreate);
Vue.component("product-categories-update", ProductCategoriesUpdate);


/*
 * Products views/components
 */
Vue.component("products-index", ProductsIndex);
Vue.component("products-create", ProductsCreate);
Vue.component("products-edit", ProductsEdit);

/*
 * Stores views
 */
Vue.component("stores-index", StoresIndex);
Vue.component("stores-create", StoresCreate);
Vue.component("stores-edit", StoresEdit);
Vue.component("stores-show", StoresShow);


/*
 * Requisitions views
 */
Vue.component("requisitions-index", RequisitionsIndex);
Vue.component("requisitions-create", RequisitionsCreate);
Vue.component("requisitions-show", RequisitionsShow);
Vue.component("requisitions-raise-lpo", RequisitionsRaisesLpo);
Vue.component("requisitions-activity-logs", RequisitionsACtivityLogs);
Vue.component("requisitions-add", RequisitionsAdd);

/*
 * Purchase orders
 */
Vue.component("purchase-orders-index", PurchaseOrdersIndex);
Vue.component("purchase-orders-create", PurchaseOrdersCreate);
Vue.component("purchase-orders-show", PurchaseOrdersShow);
Vue.component("purchase-orders-grns", PurchaseOrdersGrns);
Vue.component("purchase-orders-approve", PurchaseOrdersApprove);

/*
* Goods received notes
* */
Vue.component("purchase-order-goods-received-notes", PurchaseOrdersGoodsReceivedNotes);
Vue.component("goods-received-note-tag-invoice", GoodsReceivedNotesTagInvoice);
Vue.component("goods-received-note-view-attached-invoices", GRNViewAttachedInvoice);


/*
 * Supplier invoices
 */
Vue.component("supplier-invoices", SupplierInvoice);

/*
 * Goods received notes
 */
Vue.component("goods-received-notes", GoodsReceivedNotes);

/*
 * Suppliers
 */
Vue.component("suppliers-index", SupplierIndex);
Vue.component("suppliers-edit", SupplierEdit);
Vue.component("suppliers-create", SuppliersCreate);
Vue.component("supplier-profile-details", SupplierProfileDetails);
Vue.component("supplier-account", SupplierAccount);
Vue.component("supplier-payments", SupplierPayment);
Vue.component("supplier-statement", SupplierStatement);

/*
* point of sale: (pharmacy, shop, cafeteria
* */
Vue.component("inventory-point-of-sale", InventoryPointOfSale);
Vue.component("inventory-point-of-sale-show", InventoryPointOfSaleShow);

/*
* inventory settings views
* */
// approval levels
Vue.component("approval-levels-index", ApprovalLevesIndex);
// points of sale
Vue.component("setup-points-of-sale", SetupPointOfSale);

// search
Vue.component("inventory-product-search", InventorySearchProduct);
Vue.component("inventory-store-product-search", InventoryStoreProductSearch);
