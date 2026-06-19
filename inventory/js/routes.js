/*
 * Store management routes
 */


const storeManagement = '/inventory/stores/:storeId';

import StoreProducts from './components/stores/management/StoreProducts';
import DirectOrders from './components/stores/management/DirectOrders';
import InternalOrders from './components/stores/management/InternalOrders';
import ReceivedOrders from './components/stores/management/ReceivedOrders';
import StockTake from './components/stores/management/StockTake';
import TakeStocks from './components/stores/management/TakeStocks';
import ViewStockTake from './components/stores/management/ViewStockTake';
import KnockOff from './components/stores/management/KnockOff';
import AddProductsToStore from './components/stores/management/AddToStore';
import StoreReports from './components/stores/management/reports/Index';
import IssueProducts from './components/stores/management/IssueProducts';
import StockMovement from './components/stores/management/reports/stock-movement/Index';
import StockAuditReport from './components/stores/management/reports/audit-report/Index';
import StockExpiries from './components/stores/management/reports/stock-expiry/Index';
import StockValue from './components/stores/management/reports/stock-value/Index';
import OrderTrail from './components/stores/management/OrderTrail';
import Dispatch from './components/stores/management/DispatchOrders';
import ReceiveProducts from './components/stores/management/Receive';
import SupplierAccountIndex from './components/suppliers/account/Index';
import SupplierAccountPurchaseOrders from './components/suppliers/account/PurchaseOrders';
import SupplierAccountDirectOrders from './components/suppliers/account/DirectOrders';
import SupplierAccountPayment from './components/suppliers/account/Payments';
import SupplierAccountSummary from './components/suppliers/account/Summary';
import SupplierStatement from './components/suppliers/account/Statement';

export const inventory = [

    /*
     * Store management routes
     */
    { path: `${storeManagement}/products`, component: StoreProducts },
    { path: `${storeManagement}/receive`, component: DirectOrders },
    { path: `${storeManagement}/internal-orders`, component: InternalOrders },
    { path: `${storeManagement}/received-orders`, component: ReceivedOrders },
    { path: `${storeManagement}/stock-take`, component: StockTake },
    { path: `${storeManagement}/take-stocks/:stockTakeId`, component: TakeStocks },
    { path: `${storeManagement}/view-stock-take/:stockTakeId`, component: ViewStockTake },
    { path: `${storeManagement}/knock-off`, component: KnockOff },
    { path: `${storeManagement}/store-reports`, component: StoreReports },
    { path: `${storeManagement}/issue-products`, component: IssueProducts },
    { path: `${storeManagement}/add-items-to-store`, component: AddProductsToStore },

    /*
    *  store managment: (store reports)
    * */
    { path: `${storeManagement}/store-reports/stock-movement`, component: StockMovement },
    { path: `${storeManagement}/store-reports/audit-report`, component: StockAuditReport },
    { path: `${storeManagement}/store-reports/stock-expiries`, component: StockExpiries },
    { path: `${storeManagement}/store-reports/stock-value`, component: StockValue },

    /*
     * Other routes on store management
     */
    { path: `${storeManagement}/order/:orderId`, component: OrderTrail },
    { path: `${storeManagement}/order/:orderId/dispatch`, component: Dispatch },
    { path: `${storeManagement}/order/:orderId/receive`, component: ReceiveProducts },

    /*
    * supplier account
    * */
    { path: '/inventory/suppliers/:supplier_id/account', component: SupplierAccountIndex },
    { path: '/inventory/suppliers/:supplier_id/purchase-orders', component: SupplierAccountPurchaseOrders },
    { path: '/inventory/suppliers/:supplier_id/direct-orders', component: SupplierAccountDirectOrders },
    { path: '/inventory/suppliers/:supplier_id/payments', component: SupplierAccountPayment },
    { path: '/inventory/suppliers/:supplier_id/summary', component: SupplierAccountSummary },
    { path: '/inventory/suppliers/:supplier_id/statement', component: SupplierStatement },
];
