import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./ProductRepository";

export default class Product extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Save the product
     */
    save() {
        const data = this.getFields();

        this.form.submit("post", "/api/inventory/products", data).then((response) => {
            this.setFields(fields);

            flash(response);
        });
    }


    fetchStores() {
        return this.form.submit("get", "/api/inventory/stores")
            .then((response) => {
                return response.data; 
            })
            .catch((error) => {
                console.error("Error fetching stores:", error);
                return []; 
            });
    }
    

    saveProductStores(data) {
        this.form.submit("post", "/api/inventory/update-product-stores", data).then((response) => {
            // Reset fields after successful submission
            this.selectedProducts = [];
            this.selectedStores = [];
            flash(response); // Display success message or notification

            return response;
        }).catch(error => {
            console.error("Failed to update product stores", error);
        });
    }


    updateEcommerceProducts(data) {
        this.form.submit("post", "/api/inventory/sync-ecommerce-products", data).then((response) => {
            // Reset fields after successful submission
            this.selectedProducts = [];
            this.selectedStores = [];
            flash(response); // Display success message or notification

            return response;
        }).catch(error => {
            console.error("Failed to update product stores", error);
        });
    }
    /*
     * Update a products details
     */
    update() {
        const data = this.getFields();

        this.form.submit("patch", `/api/inventory/products/${this.product_id}`, data).then((response) => {
            flash(response);
        });
    }

    /*
     * Populate the default fields with product details (during edits)
     */
    assemble(product) {
        product = JSON.parse(product);

        this.product_id = product.id;

        _.each(fields, (value, key) => {
            this[key] = product[key];
        });
    }

    async deleteProduct(productId) {
        const response = this.form.submit("delete", `/api/inventory/products/${productId}`);

        if(response) {
            return response;
        }
    }
}
