<template>
    <v-card flat>
        <v-card-title>
            <h5>Add missing items to this store</h5>
        </v-card-title>
        <v-card-text>
            <products-search ref="productSearch" @results="addItem"></products-search>
        </v-card-text>
        <br/>

        

<v-card-text v-if="items.length > 0 && msetting('reception.checkin_to_roles')" >
            <h5>Bar Code</h5>
            <v-text-field
                id="barcode-input"
                v-model="barcode"
                @keyup.enter="handleBarcodeScan"
                autofocus
                type="text"
            ></v-text-field>
            
            <div v-if="scannedBarcode" class="mt-2">
                Scanned Barcode: {{ scannedBarcode }}
            </div>
        </v-card-text>

        <v-card-text>
            <v-chip close v-for="(item, index) in items" @click:close="removeItem(index)" :key="index">{{ item.name }}</v-chip>
        </v-card-text>

        <br/>

        <v-card-text>
            <v-btn small color="primary" @click="submit">submit</v-btn>
        </v-card-text>
    </v-card>
</template>
<script>
import Store from '@inventory/libs/stores/Store';
import ProductsSearch from '@inventory/components/ProductsSearch';

export default {
    components: { ProductsSearch },
    data() {
        return {
            store: new Store(),
            items: [],
            barcode: '',
            scannedBarcode: '',
        };
    },

    methods: {
        addItem(item) {
            this.items.push(item);
            // Update scannedBarcode to the bar_code of the newly added item if exists
            if (item.bar_code) {
                this.scannedBarcode = item.bar_code;
            } else {
                this.scannedBarcode = '';
            }
        },

        removeItem(index) {
            this.items.splice(index, 1);
        },

        async submit() {
            const response = await this.store.addProductsToStore(this.items, this.$route.params.storeId);

            if (response) {
                if (response.alert) {
                    if (response.alert === 'success') {
                        this.items = [];
                    }
                }

                flash(response);
            }
        },

        handleBarcodeScan() {
            if (this.barcode.trim() === '') {
                return;
            }

            // Display the scanned barcode instead of searching products
            this.scannedBarcode = this.barcode;

            // Append the barcode as bar_code property to the last item in items array
            if (this.items.length > 0) {
                this.items.forEach((item, index) => {
                    if (index === this.items.length - 1) {
                        this.$set(this.items[index], 'bar_code', this.barcode);
                    }
                });
            }

            // Clear the barcode input after scanning
            this.barcode = '';

            // Hide scannedBarcode after 2 seconds
            setTimeout(() => {
                this.scannedBarcode = '';
            }, 2000);
        },
    },
};
</script>
