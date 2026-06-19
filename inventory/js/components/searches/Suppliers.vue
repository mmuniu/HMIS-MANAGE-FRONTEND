<template>
    <v-autocomplete
            v-model="selected"
            :loading="loading"
            :items="suppliers_data"
            :search-input.sync="search"
            @change="supplierSelected()"
            color="black"
            @click:clear="clearedSelected()"
            class="black--text"
            item-text="name"
            item-value="id"
            :placeholder="placeholder"
            flat clearable
            hide-no-data no-filter outline hide-details
            label="Search for supplier"
            return-object
    ></v-autocomplete>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';

export default {
    props: {
        placeholder: {
            type: String,
            default: '',
        },
    },

    data: () => ({
        loading: false,
        search: null,
        selected: null,
        suppliers_data: [],
    }),

    computed: {
        ...mapGetters({
            suppliers: 'getSuppliers',
        }),
    },

    watch: {
        suppliers(val) {
            this.suppliers_data = val.data;
        },

        search(val) {
            if (val != null && val.length > 3) {
                this.performSearch();
            } else {
                this.placeholder = `Enter ${3-1} more characters to search`;
            }
        },
    },

    methods: {
        ...mapActions({
            fetchSuppliers: 'setSuppliers',
        }),

        getIcon() {
            return this.loading ? 'bubble_chart' : '';
        },

        supplierSelected() {
            this.$emit('results', this.selected);
        },

        clearedSelected() {
            this.$emit('clearedSelected');
            this.suppliers_data = [];
            this.selected = null;
        },

        performSearch: _.debounce(function() {
            this.loading = true;
            this.fetchSuppliers({
                params: {
                    search: this.search,
                },
            });
        }, 1000),
    },

    created() {
        window.events.$on('STORE_SET_ACTION_LOADING', (val) => {
            this.loading = val;
        });
    },
};
</script>
