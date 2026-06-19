/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-07-07
 * Time: 20:59
 */

import Vue from "vue";
import SyncFacilities from "@sync/components/facilities/Index";
import SyncNotifications from "@sync/components/notifications/Index";
import SyncUpdates from "@sync/components/updates/Index";
import SyncInventoryIncoming from "@sync/components/inventory/Incoming";
import SyncInventoryMakeOrders from "@sync/components/inventory/MakeOrder";
import SyncInventoryProductMatches from "@sync/components/inventory/ProductMatches";
import SyncInventoryReceiveOrders from "@sync/components/inventory/ReceiveOrders";

Vue.component("sync-facilities", SyncFacilities);

Vue.component("sync-notifications", SyncNotifications);

Vue.component("sync-updates", SyncUpdates);

/**
 * inventory
 */
Vue.component("sync-inventory-incoming", SyncInventoryIncoming);
Vue.component("sync-inventory-make-order", SyncInventoryMakeOrders);
Vue.component("sync-inventory-product-matches", SyncInventoryProductMatches);
Vue.component("sync-inventory-receive-orders", SyncInventoryReceiveOrders);
