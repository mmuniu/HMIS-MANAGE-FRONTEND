import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./WalkinRepository";
import { _ } from "vue-underscore";

export default class Walkin extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.type = null;
    }

    /*
     * Sets a prescription type as fetched from persistence - fetched by name
     */
    async save(andReceivePayment) {
        this.loading = true;

        const self = this;

        const response = await this.form.submit("post", route("evaluation.shopfront.post"), this.getFields());

        if (response) {
            flash({
                message: "Service(s) requested successfully",
                alert: "success",
            });

            self.loading = false;

            this.resetFormData();

            if (andReceivePayment) {
                window.open(`/finance/cash/receive?patient_id=${response.patient_id}`);
            }

            return response;
        }
    }

    /*
    * remove an already selected service from list
    * */
    removeSelection(index) {
        this.selected_services.splice(index, 1);
        this.updateTotalCost();
    }

    /*
    * procedure selected
    * */
    procedureSelected(index, procedure) {
        this.selected_services[index].id = procedure.id;
        this.selected_services[index].name = procedure.name;
        this.selected_services[index].category = procedure.category;
        this.selected_services[index].initial_price = procedure.cash_charge;
        this.selected_services[index].price = procedure.cash_charge;
        this.selected_services[index].comments = null;
        this.selected_services[index].on_credit = null;
        this.updateTotalCost();
    }

    /*
    * add a new empty service row
    * */
    AddNewRow() {
        this.selected_services.push({
            id: null,
            name: null,
            category: null,
            initial_price: null,
            units: 1,
            price: null,
        });
    }

    /*
    * update total cost
    * */
    updateTotalCost() {
        this.total_cost = 0;

        const self = this;

        this.selected_services.forEach( function(val) {
            self.total_cost += (val.price * val.units);
        });
    }

    resetFormData() {
        const self = this;

        _.each(fields, function(value, key) {
            if (key === "total_cost" ) {
                self.total_cost = 0;
            } else if (key === "new_patient" || key === "loading") {
                self[key] = false;
            } else if (key === "patient_id") {
                self.patient_id = null;
            } else if (key === "patient_data") {
                _.each(self.patient_data, function(value, patientKey) {
                    self.patient_data[patientKey] = null;
                });
            } else if ( key === "customer_data") {
                _.each(self.customer_data, function(value, customerKey) {
                    if (customerKey === "is_staff") {
                        self.customer_data.is_staff = false;
                    } else {
                        self.customer_data[customerKey] = null;
                    }
                });
            } else if (key === "selected_services") {
                _.each(self.selected_services, function(value, index) {
                    _.each(self.selected_services[index], function(value, identifier) {
                        self.selected_services[index][identifier] = null;
                    });
                });
            }

            self.total_cost = 0;
        });
    }

    /*
    * empty patient records when we are entering a case for customers
    * */
    emptyPatientData() {

    }
}
