import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import {fields} from './GroupPosRepository';
import {_} from "vue-underscore";

export default class GroupPos extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }


    clearItems() {
        this.pos_data.items = [];
        this.updateTotalCost();
    }

    /**
     * Save data
     */
    async saveSale(slug, reload = true, internal = null) {
        this.pos_data.internal = internal;
        const data = this.pos_data;
        return await this.form.submit('post', route('api.evaluation.grouped-pos.store', slug), data);

    }



    async processPosSale(sale_id, internal = false) {

        try {
            return await axios.post(
                `/api/evaluation/grouped-pos/${sale_id}/process/payment`,
                {
                    sale_id: sale_id,
                    internal: internal
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );
        } catch (error) {
            console.error("Error processing POS sale:", error);
            throw error;
        }
    }


    async processPesapalSale(payload) {
        try {
            // Use the Finance PesapalController initiate endpoint
            return await axios.post('/api/finance/pesapal/initiate', payload);
        } catch (error) {
            console.error("Error processing POS sale:", error);
            throw error;
        }
    }

    async fetchStores(){
        return await this.form.submit('get', route('inventory.stores.all-stores'));
    }
    async fetchProducts(data){
        return await this.form.submit('get', `/api/inventory/storeProducts?store_id=${data.params.store_id}&pagination=${data.params.pagination}&page=${data.params.page}&per_page=${data.params.per_page}`, data);
    }
    /**
     * Save data
     */
    async saveSaleAndPay(slug) {
        this.saveSale(slug, false).then(function(response){
            if (response.payment_mode === "insurance") {
                window.open(`/finance/invoices/pending/action/bill?visit_id=${response.visit_id}`, "_blank");
            } else {
                window.open(`/finance/cash/receive?patient_id=${response.patient_id}`, "_blank");
            }
        });
    }

    /*
    * process payment
    * */
    processPayment(saleId) {
        this.form.submit("post", route("api.evaluation.process-sale-payment", saleId)).then((response) => {
            flash(response);

            if (response.payment_mode === "insurance") {
                window.open(`/finance/invoices/pending/action/bill?visit_id=${response.visit_id}`, "_blank");
            } else {
                window.open(`/finance/cash/receive?patient_id=${response.patient_id}`, "_blank");
            }
        });
    }


    /**
     * procedure selected
     * @param index
     * @param procedure
     */
    procedureSelected(index, procedure) {
        this.pos_data.services[index].id = procedure.id;
        this.pos_data.services[index].name = procedure.name;
        this.pos_data.services[index].category = procedure.category;
        this.pos_data.services[index].initial_price = procedure.cash_charge;
        this.pos_data.services[index].price = procedure.cash_charge;
        this.pos_data.services[index].comments = null;
        this.pos_data.services[index].on_credit = null;
        this.updateTotalCost();
    }

    /**
     * drug selected (this is pharmaceutical sale
     * @param index
     * @param selected
     */
    drugSelected(index, selected) {

        const selling_price = selected.cash_price;
        // console.log(selected);

        if (!this.inCart(selected) ) {
            // Ensure the target row exists
            if (!this.pos_data.drugs) this.pos_data.drugs = [];
            while (this.pos_data.drugs.length <= index) {
                this.addNewRow('drug');
            }
            // Use a prompt to let the user set the desired quantity
            let quantity = 1; // Default quantity is 1

            // Convert the quantity to a number
            quantity = parseInt(quantity, 10);
            // const dispensableAmount = selected.dispensable_amount;
            this.pos_data.drugs[index].id = selected.id;
            this.pos_data.drugs[index].name = selected.name;
            this.pos_data.drugs[index].quantity = 1;
            this.pos_data.drugs[index].orderable_quantity = selected.quantity;
            this.pos_data.drugs[index].duration = 1;
            this.pos_data.drugs[index].dispensable_amount = selected.dispensable_amount;
            this.pos_data.drugs[index].unit_of_measurement = selected.unit_of_measurement;
            this.pos_data.drugs[index].selling_price = selling_price;
            this.pos_data.drugs[index].route = null;
            this.pos_data.drugs[index].amount = selling_price;
            this.pos_data.drugs[index].total = selling_price;
            this.pos_data.drugs[index].product_id = selected["product_id"];
            this.pos_data.drugs[index].product_type = selected.type;
            this.pos_data.drugs[index].lower_limit_price = selected.lower_limit_price;
            this.pos_data.drugs[index].lower_limit_percentage = selected.lower_limit_percentage;
            this.pos_data.drugs[index].product_type = selected.type;

            // Handle batch selection if provided
            if (selected.selected_batch) {
                this.pos_data.drugs[index].batch = selected.selected_batch.batch;
                this.pos_data.drugs[index].expiry_date = selected.selected_batch.expiry_date;
                this.pos_data.drugs[index].orderable_quantity = Math.min(selected.quantity, selected.selected_batch.quantity || selected.quantity);
                this.pos_data.drugs[index].batch_id = selected.selected_batch.id;
            }

            this.updateTotalCost();
        } else {
            flash({
                message: "Product already exists in cart",
                alert: "error"
            });
        }
    }

    /**
     * item selected
     * @param index
     * @param selected
     */
    itemSelected(index, selected) {
        const cost = selected.cash_price || selected.price || 0;

        if (!this.inCart(selected) ) {
            // Ensure the target row exists
            if (!this.pos_data.items) this.pos_data.items = [];
            while (this.pos_data.items.length <= index) {
                this.addNewRow('item');
            }

            this.pos_data.items[index].id = selected.id;
            this.pos_data.items[index].name = selected.name;
            this.pos_data.items[index].quantity = 1;
            this.pos_data.items[index].orderable_quantity = selected.quantity;
            this.pos_data.items[index].product_id = selected["product_id"] || selected["id"];
            this.pos_data.items[index].selling_price = cost;
            this.pos_data.items[index].amount = cost;
            this.pos_data.items[index].total = cost;
            this.updateTotalCost();
        } else {
            flash({
                message: "Product already exists in cart",
                alert: "error",
            });
        }
    }


    customPosItemSelected(index, selected) {

        const cost = selected.cash_price || selected.price || 0;
        if (!this.inCart(selected) ) {
            // Ensure the target row exists
            if (!this.pos_data.items) this.pos_data.items = [];
            while (this.pos_data.items.length <= index) {
                this.addNewRow('item');
            }

            this.pos_data.items[index].id = selected.id;
            this.pos_data.items[index].name = selected.name;
            // Use the quantity from the selected product instead of hardcoding to 1
            this.pos_data.items[index].quantity = selected.quantity || 1;
            this.pos_data.items[index].orderable_quantity = selected.quantity;
            this.pos_data.items[index].product_id = selected["product_id"] || selected["id"];
            this.pos_data.items[index].selling_price = cost;
            // Update amount to reflect the quantity
            this.pos_data.items[index].amount = cost * (selected.quantity || 1);
            this.pos_data.items[index].total = this.pos_data.items[index].amount;
            this.updateTotalCost();
        } else {
            flash({
                message: "Product already exists in cart",
                alert: "error"
            });
        }
    }


    /**
     * check not in cart
     * @param type
     * @returns {*}
     */
    inCart(selected) {
        if (!selected) return false;
        const selectedId = selected.id || selected.product_id;
        if (!selectedId) return false;
        const inDrugs = Array.isArray(this.pos_data.drugs) && _.find(this.pos_data.drugs, (item) => item && (item.id === selectedId || item.product_id === selectedId));
        const inItems = Array.isArray(this.pos_data.items) && _.find(this.pos_data.items, (item) => item && (item.id === selectedId || item.product_id === selectedId));
        return !!(inDrugs || inItems);
    }



    /**
     * add a new service/item row
     * @param type
     */
    addNewRow (type) {
        if(type  === 'service') {
            this.pos_data.services.push({
                id: null,
                name: null,
                category: null,
                initial_price: null,
                units: 1,
                price: null,
            });
        }

        if(type === 'drug') {
            this.pos_data.drugs.push({
                id: null,
                name: null,
                route: null,
                frequency: 1,
                duration: null,
                measure: null,
                quantity: null,
                selling_price: null,
                amount: null,
                total: null,
                product_id: null,
                product_type: null,
                dispensable_amount:null,
                unit_of_measurement:null
            });
        }

        if(type == 'item') {
            this.pos_data.items.push({
                id: null,
                name: null,
                quantity: null,
                product_id: null,
                price: null,
                amount: 1,
                variance: null,
                total: null,
            });
        }
    }

    /**
     * remove selection
     * @param index
     * @param type
     */
    removeSelection(index, type) {

        if(type ===  'service') {
            this.pos_data.services.splice(index, 1);
        }

        if(type ===  'drug') {
            this.pos_data.drugs.splice(index, 1);
        }

        if(type ===  'item') {
            this.pos_data.items.splice(index, 1);
        }

        this.updateTotalCost();
    }

    /**
     * make necesssary calculations based on proviced data
     * @param item
     */
    updatePharmacyCartState(item) {
        const index = this.pos_data.drugs.indexOf(item);

        let pre_frequency = 1; // Default value
        if (item.frequency && item.frequency.item_meta) {
            const parsedMeta = JSON.parse(item.frequency.item_meta);
            pre_frequency = parsedMeta.frequency || 1;
        }

        let pre_measure = 1; // Default value
        if (item.measure && item.measure.item_meta) {
            const parsedMeta = JSON.parse(item.measure.item_meta); // Corrected parsing for "measure"
            pre_measure = parsedMeta.measure || 1; // Assuming measure is in the parsed meta
        }

        const frequency = pre_frequency;
        const measure = pre_measure;
        const duration = item.duration || 1;
        const dosage = item.dosage || 1;
        let qty = frequency * duration * measure * dosage;
        const dispensableAmount = item.dispensable_amount || 1;

        const dividedQty = (qty / dispensableAmount).toFixed(1);
        let roundedQty = Math.ceil(qty / dispensableAmount);

        // If roundedQty is larger than orderable_quantity, display error and adjust quantity
        if (roundedQty > item.orderable_quantity) {
            flash({
                message: `Quantity exceeds the available stock. Please reduce the quantity to ${item.orderable_quantity}.`,
                alert: "error",
            });
            roundedQty = item.orderable_quantity;
        }

        // Update item quantity and amount in the pharmacy cart
        this.pos_data.drugs[index].quantity = roundedQty;
        this.pos_data.drugs[index].amount = roundedQty * item.selling_price;

        this.updateTotalCost(item);
    }



    /**
     * update item cost
     * @param item
     */
    updateItemCost (item) {
        const index = this.pos_data.items.indexOf(item);

        // Normalize quantity: treat empty, null, undefined, NaN as 0; prevent negatives
        let inputQty = parseInt(item.quantity, 10);
        if (isNaN(inputQty) || inputQty === null || inputQty === undefined) {
            inputQty = 0;
        }
        if (inputQty < 0) {
            inputQty = 0;
        }

        // Respect available stock if provided (coerce to number if possible)
        const oq = Number(item.orderable_quantity);
        const maxQty = Number.isFinite(oq) ? oq : inputQty;
        const quantity = inputQty > maxQty ? maxQty : inputQty;

        this.pos_data.items[index].quantity = quantity;
        // When quantity is 0, amount should be 0 (avoid NaN)
        const amount = (Number(item.selling_price) || 0) * quantity;
        this.pos_data.items[index].amount = amount;
        this.pos_data.items[index].total = amount;
        this.pos_data.items[index].variance = item.cost > 0 ? (quantity * (Number(item.selling_price) || 0)) - amount : 0;

        this.updateTotalCost();
    }

    /**
     * update total cost
     */
    updateTotalCost(type = null, saleItem = null, index = null) {
        this.pos_data.total_cost = 0;

        const self = this;

        if(type === 'item') {
            // When editing amount directly, recompute selling price safely
            const qty = Number(saleItem.quantity);
            const amt = Number(saleItem.amount);
            this.pos_data.items[index].selling_price  = qty > 0 ? (amt / qty) : 0;
            this.pos_data.items[index].total  = amt || 0;
        }

        this.pos_data.services.forEach( function(val) {
            if(val.price && val.units) {
                self.pos_data.total_cost += (parseFloat(val.price) * parseFloat(val.units));
            }
        });

        this.pos_data.drugs.forEach( function(val) {
            if(val.selling_price && val.quantity) {
                self.pos_data.total_cost += (parseFloat(val.selling_price) * parseFloat(val.quantity));
            }

        });

        this.pos_data.items.forEach( function(val) {
            if(val.amount) {
                self.pos_data.total_cost += parseFloat(val.amount);
            }
        });
    }

    /**
     * update cart costs: pharmacy
     * @param item
     */
    updatePharmacyCartCost(item) {
        const index = this.pos_data.drugs.indexOf(item);
        const dispensableAmount = item.dispensable_amount;

        // Validate that the quantity is divisible by dispensable_amount
        // if (item.quantity % dispensableAmount !== 0) {


        //     flash({
        //         message: `Please change the quantity to a whole number`,
        //         alert: "error",
        //     });

        //     // revert the quantity to the last valid one or reset it
        //     // this.pos_data.drugs[index].quantity = dispensableAmount; // You can set it to a default divisible value or previous value
        // }

        //if item.quantity exceeds orderable_quantity, set it to orderable_quantity and flash an error of user to reduce quantity
        if (item.quantity > item.orderable_quantity) {
            flash({
                message: `Quantity exceeds the available stock. Please reduce the quantity to ${item.orderable_quantity}`,
                alert: "error"
            });
        }


        // Ensure the quantity doesn't exceed orderable_quantity
        const quantity = item.quantity > item.orderable_quantity ? item.orderable_quantity : item.quantity;
        this.pos_data.drugs[index].quantity = quantity;
        // Update the amount and total based on the new valid quantity
        this.pos_data.drugs[index].amount = quantity * item.selling_price;
        this.pos_data.drugs[index].total = this.pos_data.drugs[index].amount;

        this.updateTotalCost();
    }

}
