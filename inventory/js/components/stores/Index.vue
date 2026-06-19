
<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title class="subheading grey-text text-darken-2">
            <h2 class="body-2 ma-0 pa-0">List of all stores</h2>
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-row>
                <v-col offset-md="8" md="4" cols="12">
                    <v-text-field prepend-inner-icon="search" label="Search store ..." v-model="search"
                                  outline single-line hide-details>
                    </v-text-field>
                </v-col>
            </v-row>
        </v-card-text>

        <v-data-table
                :headers="stores.headers"
                :items="filteredList"
                class="mb-3"
                flat
        >
            <template v-slot:item.department="{ item }">{{ item.department ? item.department.name : 'N/A' }}</template>
            <template v-slot:item.parent_store="{ item }">{{ item.parentStore ? item.parentStore.name : 'N/A' }}</template>
            <template v-slot:item.facility="{ item }">{{ item.facility ? item.facility.name : 'N/A' }}</template>
            <template v-slot:item.date_added="{ item }">{{ item.created_at }}</template>
            <template v-slot:item.store_actions="{ item }">
                <v-btn
                        :href="`/inventory/stores/${item.id}/internal-orders`"
                        class="caption"
                        v-if="managingStores"
                        color="cyan"
                        small dark
                >
                    Manage
                </v-btn>

                <v-btn
                        :href="`/inventory/stores/${item.id}/edit`"
                        class="caption"
                        v-if="storesSettings"
                        color="blue"
                        small dark
                >
                    Edit
                </v-btn>
            </template>
        </v-data-table>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    name: 'stores-create',

    data() {
        return {
            stores: null,
            search: '',
        };
    },

    computed: {
        filteredList() {
            return _.filter(this.stores.data, (item) => {
                const perm = `inventory.${item.name}-Store`;
                if (this.$options.methods.can(perm) || this.storesSettings) {
                    return item;
                }
            });
        },

        lastUrlSegment() {
            return window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
        },

        managingStores() {
            if (this.lastUrlSegment === 'stores') {
                return true;
            } else {
                return false;
            }
        },

        storesSettings() {
            if (this.lastUrlSegment === 'create' || this.lastUrlSegment === 'edit') {
                return true;
            } else {
                return false;
            }
        },

        ...mapGetters([
            'getStores',
        ]),

        initialised() {
            return this.stores;
        },
    },

    watch: {
        getStores(stores) {
            this.stores = stores;
        },

        search(term, old) {
            if (term.length > 3 && term.length > old.length) {
                this.setStores({
                    search: term,
                });
            }

            if (term.length === 0) {
                this.setStores({ page: 1 });
            }
        },
    },

    methods: {
        ...mapActions([
            'setStores',
        ]),

        navigate(url) {
            if (url) {
                const page = url.substring(url.indexOf('page=')).split('page=')[1];
                this.setStores({ page });
            }
        },
    },

    mounted() {
        this.setStores({
            page: 1,
        });
    },
};
</script>
