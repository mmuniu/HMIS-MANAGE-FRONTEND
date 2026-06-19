<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title class="subheading grey-text text-darken-2">
            <span class="body-2 ma-0 pa-0">List of requisitions made</span>
            <v-spacer></v-spacer>
            <v-btn color="purple" small class="white--text" :href="`/inventory/requisitions/create`">New Requisition</v-btn>
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-data-table
                    :headers="requisitions.headers" :items="requisitions.data"
                    class="mb-3" flat hide-default-footer
            >
                <template v-slot:item.requested_by="{ item }" class="py-3">
                       <span v-if="item.requestor">
                            {{ item.requestor.name }}
                       </span>
                </template>
                <template v-slot:item.requested_on="{ item }">{{ item.created_on }}</template>
                <template v-slot:item.total_items="{ item }">{{ item.details.length }}</template>
                <template v-slot:item.status="{ item }">
                    <v-chip small color="purple" class="white--text" outlined>{{ item.status }}</v-chip>
                </template>
                <!--<td>
                    <span v-if="item.last_approver">
                        <v-chip small> {{ item.last_approver.full_name }}</v-chip>
                    </span>
                </td>-->
                <template v-slot:item.actions="{ item }">
                    <v-btn color="primary" :href="`/inventory/requisitions/${item.id}/`"
                           small dark>
                        View
                    </v-btn>
                    <v-btn v-if="!item.has_lpo && item.status != 'approved'" disabled color="primary" small>UnApproved</v-btn>

                    <v-btn v-if="item.has_lpo" disabled small>Has lpo</v-btn>
                    <v-btn v-if="item.status === 'approved' && !item.has_lpo" color="warning" :href="`/inventory/requisitions/${item.id}/purchase-order/create`"
                           small dark>
                        Raise LPO
                    </v-btn>
                </template>

                <template slot="footer" v-if="requisitions.links">
                    <v-row  class="py-2 pb-2">
                        <v-col cols="8" class="mt-3 ml-3">
                            Total records: {{ requisitions.meta.total }}
                        </v-col>

                        <v-col cols="3" class="text-right">
                            <v-btn icon @click="navigate(requisitions.links.prev)">
                                <v-icon>chevron_left</v-icon>
                            </v-btn>

                            <v-btn icon @click="navigate(requisitions.links.next)">
                                <v-icon>chevron_right</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>
import _ from "lodash";
import { mapGetters, mapActions } from "vuex";

export default {
    name: "products-index",

    data() {
        return {
            search: null,
            requisitions: null,
        };
    },

    watch: {
        getRequisitions(requisitions) {
            this.requisitions = requisitions;
        },

        search(value) {
            if (!value) {
                this.setRequisitions({ page: 1 });
                return;
            }

            if (value && value.length > 0) {
                this.searchRequisitions(value);
            }
        },
    },

    computed: {
        ...mapGetters([
            "getRequisitions",
        ]),

        initialised() {
            return this.requisitions;
        },
    },

    methods: {
        ...mapActions([
            "setRequisitions",
        ]),

        navigate(url) {
            if (url) {
                const page = url.substring(url.indexOf("page=")).split("page=")[1];
                this.setRequisitions({ page });
            }
        },

        searchRequisitions: _.debounce(function search(search) {
            this.setRequisitions({ search });
        }, 1500),
    },

    mounted() {
        this.setRequisitions({
            page: 1,
        });
    },
};
</script>
