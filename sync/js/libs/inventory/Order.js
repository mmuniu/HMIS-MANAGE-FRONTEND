/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-07-08
 * Time: 17:49
 */

import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import Facility from "@sync/libs/facilities/Facility";
import { fields } from "./OrderRepository";

export default class Order extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.facilityObj = new Facility();

        this.orders = null;

        this.saved = false;

        this.action = false;

        this.actionCompleted = false;

        this.actionAsyncCompleted = false;

        this.actionData = false;

        this.products = [];
    }

    /**
     * perform a search on product on remote system
     *
     * @param url
     */
    searchProduct(url) {
        this.form.submit("get", url, null, this.facilityObj.visa()).then((response) => {
            this.products = response;
        });
    }

    searchLocalProduct(url) {
        // let url = route('api.sync.inventory.products').relative();
        this.form.submit("get", url).then((response) => {
            this.products = response;
        });
    }

    /**
     * get on local -> remember it uses decorator
     *
     * @param key
     * @param page
     */
    async get(key, page = null) {
        let url = route("api.sync.inventory.index", key).relative();

        if (page) {
            url += `?page=${page}`;
        }


        const response = await this.form.submit("get", url);

        if (response.message) {
            flash({ message: response.message, alert: "error" });
        }

        if (response) {
            this.orders = response;

            return response;
        }
    }

    /**
     * save on remote -> remember it uses decorator
     *
     * @param url
     */
    save(url) {
        this.saved = false;

        const data = this.getFields(["orderRequest"]);

        this.form.submit("post", url, data, this.facilityObj.visa()).then((response) => {
            this.saved = true;

            flash({ message: "Order Placed Successfully.", alert: "success" });
        });
    }

    /**
     * action on local -> remember it uses decorator
     */
    performAction(url, data) {
        this.actionCompleted = false;

        this.form.submit("post", url, data).then((response) => {
            this.actionCompleted = true;

            if (response.hasOwnProperty("message")) {
                flash(response);
            } else {
                this.actionData = response;
                flash({ message: "Action Successful.", alert: "success" });
            }
        });
    }

    /**
     * async action on local -> remember it uses decorator
     */
    async performActionAsync(url, data) {
        this.actionCompleted = false;
        this.actionAsyncCompleted = false;

        await this.form.submit("post", url, data).then((response) => {
            this.actionCompleted = true;
            this.actionAsyncCompleted = true;

            if (response.hasOwnProperty("message")) {
                flash(response);
            } else {
                this.actionData = response;
                flash({ message: "Action Successful.", alert: "success" });
            }
        });
    }

    /**
     * action on local -> remember it uses decorator
     */
    performActionOnRemote(url, data) {
        this.actionCompleted = false;

        this.form.submit("post", url, data, this.facilityObj.visa()).then((response) => {
            this.actionCompleted = true;

            if (response.hasOwnProperty("message")) {
                flash(response);
            } else {
                this.actionData = response;
                flash({ message: "Action Successful.", alert: "success" });
            }
        });
    }

    reset() {
        this.orderRequest.user_id = null;
        this.orderRequest.user_name = null;
        this.orderRequest.delivery_date = null;
        this.orderRequest.requesting_facility_identifier = null;
        this.orderRequest.requesting_facility_name = null;
        this.orderRequest.items = [];
    }
}
