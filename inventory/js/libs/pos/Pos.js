import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./PosRepository";
import { _ } from "vue-underscore";

export default class Pos extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    async saveData(andProcessPayment = 0) {
        if (this.is_pharmacy) {
            return this.savePharmacyPosData(andProcessPayment);
        } else {
            return this.savePosData(andProcessPayment);
        }
    }


    async dispenseItems(data){

        
        const response = await this.form.submit("post", "/api/evaluation/grouped-pos/dispense-pharmacy-items", data);

        if (response) {
            flash(response); // Display success message or notification

            return response;
        }

    }


    async processItems(data){

        
        const response = await this.form.submit("post", "/api/evaluation/grouped-pos/process-items", data);

        if (response) {
            flash(response); // Display success message or notification

            return response;
        }

    }

    /*
    * save pharmacy pos data (this will save as prescription with tag (walkin)
    * */
    async savePharmacyPosData(andProcessPayment) {
        if (this.pharmacy.patient || this.new_patient) {
            const data = this.getFields();

            const self = this;

            const response = await this.form.submit("post", "/api/inventory/point-of-sale", data);

            if (response) {
                flash(response);

                if (andProcessPayment) {
                    self.processPayment(response.sale_id);
                }

                this.resetFormData();

                return "success";
            }
        } else {
            flash({
                message: "Please select or enter the patient's name",
                alert: "error",
            });
        }
    }

    /*
    * save the sales info
    * */
    savePosData() {
        const data = this.getFieldsExcept(["pharmacy"]);

        this.form.submit("post", "/api/inventory/point-of-sale", data).then((response) => {
            this.setFields(fields);

            flash(response);

            /*response.no_receipt ?*/ window.location.reload() /*: window.location.href = route("inventory.point-of-sale.view.sale", response.sale_id )*/;
        });
    }

    /*
    * update cart costs (normal pos)
    * */
    updateCost(item) {
        const index = this.selectedItems.indexOf(item);

        const quantity = parseInt((item.quantity > item.orderable_quantity ? item.orderable_quantity : item.quantity));

        this.selectedItems[index].quantity = quantity;

        this.selectedItems[index].amount = item.selling_price * quantity;

        this.selectedItems[index].total = item.amount;

        this.selectedItems[index].variance = item.cost > 0 ? (quantity * item.selling_price) - item.amount : 0;

        item.amount ? this.updateTotalCost() : "";
    }

    updateTotal(item) {
        const index = this.selectedItems.indexOf(item);

        this.selectedItems[index].total = item.amount;
        this.selectedItems[index].variance = item.selling_price > 0 ? (item.quantity * item.selling_price) - item.amount : 0;
        item.amount ? this.updateTotalCost() : "";
    }

    /*
     * Update a measurement unit in the database
     */
    update() {
        const data = this.getFields();

        this.form.submit("patch", `/api/inventory/measurement-units/${this.id}`, data).then((response) => {
            flash(response);
        });
    }

    /*
    * make necesssary calculations based on proviced data
    * */
    updatePharmacyCartState(item) {
        console.log("presc qty ")
        const index = this.pharmacy.selected_drugs.indexOf(item);

       
        const frequency = item.frequency ? JSON.parse(item.frequency.item_meta).frequency : 1;
        const measure = item.measure ? JSON.parse(item.measure.item_meta).frequency : 1;
        const duration = item.duration ? item.duration : 1;
        const dosage = item.dosage ? item.dosage : 1;
        const qty = frequency * duration * measure * dosage;

        this.pharmacy.selected_drugs[index].quantity = qty;
        this.pharmacy.selected_drugs[index].amount = qty * item.selling_price;
        this.updatePharmacyCartCost(item);
    }

    /*
    * update cart costs: pharmacy
    * */
    updatePharmacyCartCost(item) {
        const index = this.pharmacy.selected_drugs.indexOf(item);

        const quantity = item.quantity > item.orderable_quantity ? item.orderable_quantity : item.quantity;

        this.pharmacy.selected_drugs[index].quantity = quantity

        this.pharmacy.selected_drugs[index].amount = quantity * item.selling_price;

        this.pharmacy.selected_drugs[index].total = item.amount;

        this.updateTotalCost();
    }

    /*
    * update total cost
    * */
    updateTotalCost() {
        const vm = this;

        vm.total_cost = 0;

        if (this.is_pharmacy) {
            this.pharmacy.selected_drugs.forEach( function(val) {
                if (val.amount ) {
                    return vm.total_cost = (parseFloat(val.amount)) + vm.total_cost;
                }
            });
        } else {
            this.selectedItems.forEach( function(val) {
                if (val.total) {
                    return vm.total_cost = (parseFloat(val.total)) + vm.total_cost;
                }
            });
        }
    }

    changePaymentMode() {
        if (this.patient) {
            console.log(this.patient);
        }
    }

    /*
    * process payment
    * */
    processPayment(saleId) {
        this.form.submit("post", route("api.inventory.process-sale-payment", saleId)).then((response) => {
            flash(response);

            if (response.payment_mode === "insurance") {
                window.open(`/finance/invoices/pending/action/bill?visit_id=${response.visit_id}`, "_blank");
            } else {
                window.open(`/finance/cash/receive?patient_id=${response.patient_id}`, "_blank");
            }
        });
    }

    /*
    * check not in cart
    * */
    inCart(product) {
        if (this.is_pharmacy) {
            return _.find(this.pharmacy.selected_drugs, (item) => item.id === product.id);
        } else {
            return _.find(this.selectedItems, (item) => item.id === product.id);
        }
    }

    /*
     * Initialise the fields with a tax category
     */
    assemble(isMeasurementUnit) {
        const measurementUnit = JSON.parse(isMeasurementUnit);

        _.each(fields, (value, key) => {
            this[key] = measurementUnit[key];
        });
    }

    resetFormData() {
        const self = this;

        _.each(fields, function(value, key) {
            if (key === "pharmacy") {
                _.each(self.pharmacy, function(value, pharmKey) {
                    if (pharmKey === "selected_drugs") {
                        _.each(self.pharmacy.selected_drugs, function(val, index) {
                            _.each(val, function(val, drugKey) {
                                self.pharmacy.selected_drugs[index][drugKey] = null;
                            });
                        });
                    } else {
                        self.pharmacy[pharmKey] = null;
                    }
                });
            } else if ( key === "selectedItems") {
                _.each(self[key], function(value, index) {
                    _.each(value, function(val, drugKey) {
                        self.selectedItems[index][drugKey] = null;
                    });
                });
            }

            self.total_cost = 0;
        });
    }

    /*
    * prints
    * */
    printBill(sale_id) {
        window.open("/inventory/point-of-sale/" + sale_id + "/print", "_blank");
    }

    printBillThermal(sale_id) {
        window.open("/inventory/point-of-sale/" + sale_id + "/print?paper_size=thermal", "_blank");
    }
}
