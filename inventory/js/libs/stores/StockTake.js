import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./StockTakeRepository.js";
import { _ } from "vue-underscore";

export default class StockTake extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Initiate stock take
     */
    async scheduleStockTake(storeId) {
        if (this.scheduled_at) {
            const response = this.form.submit("post", route("api.inventory.stores.schedule-stock-take", storeId), this.getFields());

            if (response) {
                flash({
                    message: "Stock take scheduled successfully",
                    alert: "success",
                });
                return response;
            };
        } else {
            flash({
                message: "Please indicate the time to begin stock take",
                alert: "error",
            });
        }
    }

    /*
    * save the stocks_taken
    * */
    saveStocksTaken(storeId, stockTakeId) {
        this.form.submit("post", route("api.inventory.stores.save-stocks-taken", [storeId, stockTakeId]), this.getFields())
            .then((response) => {
                flash(response);
            });
    }

    /*
    * automatically save a single item
    * */
    autoSaveItem(storeId, stockTakeId, item) {
        this.form.submit("post", route("api.inventory.stores.auto-save-stock-taken", [storeId, stockTakeId]), item)
            .then((response) => {
                flash(response);
            });
    }

    /*
    * initialise stock take
    * */
    beginStockTake(stockTake) {
        this.form.submit("post", route("api.inventory.stores.initiate-stock-take", [stockTake.store.id, stockTake.id]))
            .then((response) => {
                flash(response);
            });
    }

    /*
    * finally close stock take and update stocks accordingly
    * */
    closeStockTake(storeId, stockTakeId) {
        this.form.submit("post", route("api.inventory.stores.close-stock-take", [storeId, stockTakeId]))
            .then((response) => {
                flash(response);
                window.reload();
            });
    }
}
