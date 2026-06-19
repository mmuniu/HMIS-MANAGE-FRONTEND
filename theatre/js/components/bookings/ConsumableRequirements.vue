<!--
* Created by PhpStorm.
* User: Lexx YungCarter
* Date: 2018-12-06
* Time: 18:39
* Project: platform
-->

<template>
    <div>
        <v-row  >


            <v-col cols="12" sm="12">
                <v-autocomplete v-model="consumable.department_id" label="Choose Store" outline
                                :items="stores" item-value="id" item-text="name"
                ></v-autocomplete>
            </v-col>

            <!-- {{ items }} -->

            <v-col cols="12" sm="12">
                <v-autocomplete clearable hide-details solo flat return-object large prepend-inner-icon="search" single-line placeholder="Search for a Consumable"
                                :items="items" item-text="name"  item-value="id" v-model="selected" :disabled="!consumable.department_id"
                                :loading="loading" :search-input.sync="term" outline
                >
                    <template slot="item" slot-scope="{ item }">
                        <v-list-item-avatar color="cyan" size="42" class="headline font-weight-light white--text">
                            <span class="subheading">{{ item.name.substring(0, 2) }}</span>
                        </v-list-item-avatar>
                        <v-list-item-content>
                            <v-list-item-title class="caption" v-text="item.name"></v-list-item-title>
                            <!--<v-list-item-subtitle>{{ item.quantity }} in stock</v-list-item-subtitle>-->
                        </v-list-item-content>
                    </template>
                </v-autocomplete>
            </v-col>

            <v-col cols="12" sm="12" class="mt-4">
                <v-text-field label="Quantity" v-model="consumable.quantity" outline></v-text-field>
            </v-col>

            <v-col cols="12" sm="12">
                <v-btn color="primary" @click.prevent="save" :disabled="loading">Save Consumable</v-btn>
            </v-col>
        </v-row>

        <h4 class="title mt-4">List</h4>
        <ol v-if="list">
            <li v-for="(item, index) in list" :key="index">
                {{ item.name }} - <strong>Units:</strong> {{ item.quantity }}

                <v-btn flat icon  color="red" @click="remove(item)"><v-icon small>delete</v-icon></v-btn>

                <v-divider class="my-0"></v-divider>
            </li>
        </ol>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Booking from "@theatre/libs/bookings/Booking";

export default {
    props: {
        bookingId: {
            required: true,
        },
        // stores: {
        //   default:Object
        // }
    },

    data() {
        return {
            list: null,
            booking: new Booking(),
            consumable: {
                quantity: 1,
                department_id: null,
            },
            term: null,
            loading: false,
            entries: [],
            selected: null,
            stores: [],
        };
    },

    computed: {
        ...mapGetters([
            "getTheatreRequirements", "getStoreDepartments", "getStores"
        ]),

        filteredList() {
            return _.filter(this.stores.data, (item) => {
                const perm = `inventory.${item.name}-Store`;
                if (this.$options.methods.can(perm) || this.storesSettings) {
                    return item;
                }
            });
        },

        departments() {
            if (this.getStoreDepartments) {
                return this.getStoreDepartments.data;
            } else {
                return [];
            }
        },

        items() {

            return this.entries;
        },

        errors() {
            return this.booking.form.errors;
        },

        submitted() {
            return this.booking.form.submitted;
        },

        contaminated() {
            return this.booking.form.errorDetected;
        },

    },

    watch: {
        getTheatreRequirements(value) {
            this.list = value.data;
        },

        term(value) {
            if (value) {
                if (value.length > 2) {
                    this.loading = true;
                    this.search();
                }
            } else {
                this.items = null;
                this.loading = false;
            }
        },

        contaminated(value) {
            if (value) {
                this.loading = false;
                this.booking.form.errorDetected = false;
            }
        },

        submitted() {
            this.booking.form.submitted = false;
            this.loading = false;
            this.initialise();
        },
    },

    methods: {
        ...mapActions([
            "setTheatreRequirements", "setStoreDepartments", "setStores"
        ]),

        initialise() {
            this.setTheatreRequirements({
                params: {
                    booking_id: this.bookingId,
                    type: "consumables",
                },
            });

            this.setStoreDepartments();
        },

        search() {
            let url = route("api.inventory.store-products.index.consumable");
            url += `?is_consumable=1&store_id=`+this.consumable.department_id;
            // console.log(url);+`&search=`+this.selected

                  // axios.post(url, {
                  //               search: $('.consumable-select').val(),
                  //             store_id: $("#department_id").val(),
                  //                               no_pagination: true,
                  // })
                  //   .then(function (response) {
                  //     console.log(response);
                  //   })
                  //   .catch(function (error) {
                  //     console.log(error);
                  //   });
            axios.get(url)
                .then((response) => {

                    // this.entries = response.data.results;
                    console.log(response.data.data)
                    this.entries = response.data.data;
                })
                .catch((error) => {
                    console.log("error");
                })
                .finally(() => (this.loading = false));
        },

        reset() {

        },

        save() {
            this.consumable.product_id = this.selected.id;
            this.consumable.booking_id = this.bookingId;

            const data = {};
            data.consumable = this.consumable;
            data.type = "consumables";

            this.list.push(this.selected);

            this.booking.saveRequirement(this.bookingId, data);
        },

        remove(item) {
            if (confirm("Are you sure you want to delete the item?")) {
                this.booking.removeRequirement("consumables", item.id);
            }
        },
    },

    mounted() {
      // console.log('Booking:'.this.bookingId);
      this.setStores();
      fetch('/api/inventory/all/stores', {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                      // You can add additional headers if needed
                    },

                  })
                  .then(response => {
                    if (!response.ok) {
                      throw new Error('Network response was not ok');
                    }
                    return response.json(); // Parse the JSON response
                  })
                  .then(data => {
                    // Handle the response data
                    this.stores = data;
                    console.log(this.stores);

                  })
                  .catch(error => {
                    // Handle errors
                    console.error('There was a problem with the fetch operation:', error);
                  });




        this.initialise();
    },
};
</script>

<style scoped lang="scss">

</style>
