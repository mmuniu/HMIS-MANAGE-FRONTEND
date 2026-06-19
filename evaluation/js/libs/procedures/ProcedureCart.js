import { _ } from 'vue-underscore';

export default class ProcedureCart {
    constructor() {
        this.item = null;

        this.items = [];

        this.emptyText = 'No items in cart';

        this.total = 0;

        this.admission_id = null;

        this.consumable_states = null;
        this.wallet_number = null;
        this.wallet_balance = null;

    }

    addItem(item, type, visit) {
        if (this.inCart(item.id)) {
            flash({
                'message': 'Item has already been selected',
                'alert': 'blue',
            });
        } else {
            const quantity = 1;

            let price;

            if (visit && visit.payment_mode === 'cash') {
                price = item.cash_charge;
            } else {
                if (item.exclusion_price) {
                    price = item.exclusion_price;
                } else {
                    price = item.insurance_charge;
                }
            }

            const amount = price * quantity;

            this.items.unshift({
                'name': item.name,
                'type': type,
                'procedure': item.id,
                'quantity': quantity,
                'performing_doctor': null,
                'admission_id': this.admission_id,
                'price': price,
                'discount': 0,
                'amount': amount,
                'ordered': 1,
                'invoiced': 0,
                'reasons': null,
                'preauth_status': item.requires_preauth ? 'pending' : null,
                'consumables': item.consumables,
                'variable_pricing': item.variable_pricing,
                'requires_preauth': this.check_if_requires_preauth(item, visit),
            });

            this.item = null;

            this.calculateCartTotal();
        }
    }

    check_if_requires_preauth(item, visit) {
        const pricing = _.findWhere(item.prices, visit.facility_id);

        let preauth = false;

        if (pricing.requires_preauth) {
            if (visit.payment_mode == 'cash') {
                if (pricing.preauth_cash) {
                    preauth = true;
                }
            }

            if (visit.payment_mode == 'insurance') {
                if (pricing.preauth_insurance) {
                    preauth = true;

                    if (pricing.preauth_specific_insurance) {
                        if (_.contains(pricing.preauth_specific_insurances, visit.insurance_id)) {
                            preauth = true;
                        } else {
                            preauth = false;
                        }

                        if (pricing.preauth_specific_schemes) {
                            if (_.contains(pricing.preauth_specific_schemes_array, visit.scheme_id)) {
                                preauth = true;
                            } else {
                                preauth = false;
                            }
                        }
                    }
                }
            }
        }

        return preauth;
    }

    calculateItemTotal(itemId) {
        const index = itemId ? _.findIndex(this.items, (item) => item.procedure == itemId) : 0;

        this.items[index].quantity = this.items[index].quantity ? parseFloat(this.items[index].quantity) : 1;

        this.items[index].amount = this.items[index].price * this.items[index].quantity;

        this.calculateCartTotal();
    }

    calculateCartTotal() {
        const total = _.reduce(_.pluck(this.items, 'amount'), (memo, num) => memo + num );

        this.total = total ? total : 0;
    }

    removeItem(id) {
        this.items = _.reject(this.items, (item) => item.procedure === id);

        this.calculateCartTotal();
    }

    inCart(id) {
        return _.find(this.items, (item) => item.procedure === id);
    }

    reset() {
        this.item = null;

        this.items = [];

        this.emptyText = 'No items in cart';

        this.total = 0;
    }
}
