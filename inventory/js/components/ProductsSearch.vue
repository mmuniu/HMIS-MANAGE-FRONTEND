<template>
    <v-autocomplete outline clearable
                    :label="label"
                    class="mb-4"
                    :items="products" item-text="name"
                    v-model="product"
                    @click:clear="selectionCleared()"
                    hide-no-data
                    return-object
                    @change="selectItem()"
                    :search-input.sync="search"
                    :loading="loading"
                    :hint="placeholder"
    >
        <template v-slot:item="data">
            <template v-if="typeof data.item !== 'object'">
                <v-list-item-content v-text="data.item"></v-list-item-content>
            </template>
            <template v-else>
                <v-list-item-content>
                    <v-list-item-title v-html="data.item.name"></v-list-item-title>
                </v-list-item-content>
            </template>
        </template>
    </v-autocomplete>
</template>

<script>
import _ from 'lodash';
import { mapGetters, mapActions } from 'vuex';

export default {
    name: 'products-search',

    props: {
        schemeId: {
            default: null,
        },
        unClearSelected: {
            default: false,
        },

        label: {
            type: String,
            default: 'Search and select product',
        },
    },

    data() {
        return {
            product: null,
            products: [],
            search: '',
            loading: false,
            placeholder: '',
        };
    },

    computed: {
        ...mapGetters([
            'getProducts',
        ]),
    },

    watch: {
        search(term) {
            if (term && this.product === null) {
                this.placeholder = '';
                this.searchProducts(term);
            } else if (term) {
                this.placeholder = 'Enter ' + (3 - term.length) + ' more characters';
            }
        },

        getProducts({ data }) {
            this.loading = false;
            this.products = data;
            if (this.products.length === 1 && /^\d{6,}$/.test(this.search)) {
                this.product = this.products[0];
                console.log(this.product);
                this.$nextTick(() => this.selectItem());
            }
        },
    },

    methods: {
        ...mapActions([
            'setProducts',
        ]),

        selectionCleared() {
            this.$emit('selectionCleared');
            this.products = [];
            this.product = null;
        },

        searchProducts: _.debounce(function search(search) {
            this.loading = true;

            const action = {
                params: {
                    no_pagination: true,
                    scheme_id: this.schemeId,
                },
                search,
            };

            this.setProducts(action);
        }, 700),

        selectItem() {
            this.$emit('results', this.product);

            if (!this.unClearSelected) {
                this.product = null;
                this.products = [];
            }
        },
    },
};
</script>
