<template>
    <collabmed-loading v-if="!stores.data"></collabmed-loading>
    <v-container v-else>
        <v-row >
            <v-col>
                <v-autocomplete
                        v-model="selectedStores"
                        :items="filteredList"
                        filled
                        chips
                        color="blue-grey lighten-2"
                        label="Select stores from which you will be prescribing from."
                        item-text="name"
                        item-value="id"
                        multiple
                >
                    <template slot="item" slot-scope="{ item }">
                        <v-list-tile-content>
                            <v-list-tile-title class="caption">
                                {{ item.name }}
                            </v-list-tile-title>
                            <v-list-tile-sub-title>
                                <span v-if="item.closed" class="caption red--text"> Closed </span>
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                    </template>

                    <template v-slot:selection="data">
                        <v-chip
                                :input-value="data.selected"
                                close
                                class="chip--select-multi"
                                @input="remove(data.item)"
                        >
                            {{ data.item.name }}
                        </v-chip>
                    </template>
                </v-autocomplete>
            </v-col>
        </v-row>

        <v-row >
            <v-col>
                <v-btn small color="primary" @click="back()">
                    back
                </v-btn>
            </v-col>
            <v-col class="text-right">
                <v-btn small color="primary" @click="save()">Save</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import QueueObj from '@evaluation/libs/queue/Queue';

export default {
    props: [
        'selected',
    ],

    data: () => ({
        selectedStores: [],
        queueObj: new QueueObj(),
        loading: false,
    }),

    computed: {
        ...mapGetters({
            stores: 'getStores',
        }),

        filteredList() {
            return _.filter(this.stores.data, (item) => {
                const perm = `inventory.${item.name}-Store`;
                if (this.$options.methods.can(perm) || this.storesSettings) {
                    return item;
                }
            });
        },
    },

    methods: {
        ...mapActions([
            'setStores',
        ]),

        async save() {
            if (this.selectedStores.length > 0) {
                this.loading = true;

                const response = await this.queueObj.recordOperatingStore(this.selectedStores);

                if (response) {
                    this.loading = false;

                    if ('referrer' in document) {
                        window.location = document.referrer;

                        // window.open(document.referrer, "_self");
                        /* OR */
                        // location.replace(document.referrer);
                    } else {
                        window.location.reload();
                    }
                }
            } else {
                flash({
                    message: 'Please select at least one store',
                    alert: 'warning',
                });
            }
        },

        remove(item) {
            const index = this.selectedStores.indexOf(item.id);
            if (index >= 0) this.selectedStores.splice(index, 1);
        },

        back() {
            window.history.back();
        },
    },

    mounted() {
        this.setStores({
            params: {
                clinic_filter: true,
                check_open: true,
            },
        });
        if (this.selectedStores) {
            this.selectedStores = JSON.parse(this.selected).selected_stores;
        }
    },
};
</script>
