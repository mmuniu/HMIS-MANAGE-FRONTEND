<template>
    <v-row justify="center">
        <v-dialog v-model="destination" width="500" persistent>
            <v-card>
                <v-card-title class="subheading">
                    Change a visit destination
                    <v-spacer></v-spacer>
                    <v-btn text icon color="red" small @click="destination = false">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-divider class="ma-0 pa-0"></v-divider>

                <v-card-text>
                    <v-row >
                        <v-col cols="12">
                            <v-select v-if="visitDestinations" label="Change from" v-model="visitDestination.change.from"
                                      :items="visitDestinations" item-text="name" item-value="id" outline>
                            </v-select>
                        </v-col>

                        <v-col cols="12">
                            <v-autocomplete
                                    v-model="visitDestination.change.to"
                                    :items="allDestinations"
                                    outline
                                    color="blue-grey lighten-2"
                                    label="Change to"
                                    item-text="name"
                                    item-value="id"
                            >
                                <template slot="item" slot-scope="data">
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
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-actions>
                    <v-btn class="mb-2" color="blue" large block
                           :dark="!loader" :loading="loader" :disabled="loader"
                           @click="initiate()">
                        Change destination
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { _ } from 'vue-underscore';
import VisitDestination from '@reception/libs/visits/VisitDestination';

export default {
    props: [
        'destination', 'destinations',
    ],

    data() {
        return {
            loader: false,
            allDestinations: [],
            visitDestinations: [],
            visitDestination: new VisitDestination,
        };
    },

    watch: {
        destinations(value) {
            const destiantions = JSON.parse(this.destinations);

            const vm = this;

            _.map(this.getDestinations.data, function(group) {
                _.map(group, function(item) {
                    _.each(destiantions, function(destination) {
                        if (destination.destination_id === item.id) {
                            vm.visitDestinations.push(item);
                        }
                    });
                });
            });
            this.visitDestination.visitId = destiantions[0].visit;
        },

        getDestinations({ data }) {
            _.each(data, (group, index) => {
                const groupName = this.ucwords(index);
                this.allDestinations.push({ header: groupName });
                _.each(group, (destination, key) => {
                    this.allDestinations.push({
                        id: destination.id,
                        name: destination.name,
                    });
                });
                this.allDestinations.push({ divider: true });
            });
        },

        submitted(value) {
            if (value) {
                this.visitDestination.form.submitted = false;

                this.loader = false;

                this.$emit('changed');
            }
        },
    },

    computed: {
        ...mapGetters([
            'getDestinations',
        ]),

        submitted() {
            return this.visitDestination.form.submitted;
        },
    },

    methods: {
        ...mapActions([
            'setDestinations',
        ]),

        ucwords(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },

        initiate() {
            this.loader = true;
            this.visitDestination.switchDestinations();
        },
    },

    mounted() {
        this.setDestinations();
    },
};
</script>
