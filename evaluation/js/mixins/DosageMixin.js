export const dosageMixin = {
    data() {
        return {
            "methodObject": null,
            "methodFrequency": 1,
            "measureObject": null,
            "measureFrequency": 1,
            "ownMeasureFrequency":1,
            "ownMethodObject": null,
            "ownMethodFrequency": 1,
            "ownMeasureObject": null,
        };
    },

    watch: {
        doseTake(value) {
            if (value) {
                this.updateQuantity();
            }
        },
        
        dispensableAmount(value){
            if(value){
                this.updateQuantity();

            }
        },

        methodObject(value) {
            if (value) {
                const meta = JSON.parse(value.item_meta);

                this.prescription.method = value.id;
                this.prescription.own_method = value.id;

                this.methodFrequency = meta.frequency;

                this.updateQuantity();
            }
        },

        ownMethodObject(value) {
            if (value) {
                const meta = JSON.parse(value.item_meta);

                this.prescription.own_method = value.id;

                this.ownMethodFrequency = meta.frequency;

                this.ownUpdateQuantity();
            }
        },

        doseDuration(value) {
            if (value) {
                this.updateQuantity();
            }
        },

        measureObject(value) {
            if (value) {
                const meta = JSON.parse(value.item_meta);

                this.prescription.time_measure = value.id;

                this.measureFrequency = meta.frequency;

                this.updateQuantity();
            }
        },
        ownMeasureObject(value) {
            if (value) {
                const meta = JSON.parse(value.item_meta);

                this.prescription.own_time_measure = value.id;

                this.ownMeasureFrequency = meta.frequency;

                this.updateQuantity();
            }
        },
    },

    computed: {
        doseTake() {
            return this.prescription.take;
        },

        dispensableAmount(){
            return this.prescription.dispensable_amount;
        },

        doseDuration() {
            return this.prescription.duration;
        },

        ownDoseTake() {
            return this.prescription.own_take;
        },

        ownDispensableAmount(){
            return this.prescription.own_dispensable_amount;
        },
        
        ownDoseDuration() {
            return this.prescription.own_duration;
        },
    },

    methods: {
        updateQuantity() {
            const dispensableAmount = this.dispensableAmount || 1;
            this.prescription.quantity = this.doseTake * this.methodFrequency * this.doseDuration * this.measureFrequency;
        //      // Check if prescription.quantity and product.dispensable_amount are valid numbers
        // if (!isNaN(this.prescription.quantity) && !isNaN(dispensableAmount) && dispensableAmount > 0) {
        
            // Perform the division only if both values are valid and dispensable_amount is greater than 0
            this.prescription.quantity =  Math.ceil(this.prescription.quantity / dispensableAmount);

        },

        ownUpdateQuantity(){
            const dispensableAmount = this.ownDispensableAmount || 1;
            this.prescription.own_quantity = this.ownDoseTake * this.ownMethodFrequency * this.ownDoseDuration * this.ownMeasureFrequency;
        //      // Check if prescription.quantity and product.dispensable_amount are valid numbers
        // if (!isNaN(this.prescription.quantity) && !isNaN(dispensableAmount) && dispensableAmount > 0) {
        
            // Perform the division only if both values are valid and dispensable_amount is greater than 0
            this.prescription.own_quantity =  Math.ceil(this.prescription.own_quantity / dispensableAmount);

        }
    },
};
