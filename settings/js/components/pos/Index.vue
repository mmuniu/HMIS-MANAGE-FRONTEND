<template>
    <div>
        <v-card flat>
            <collabmed-loading v-if="!initialised"></collabmed-loading>

            <div v-else>
                <v-card-title class="subheading grey-text text-darken-2">
                    <h2 class="body-2 ma-0 pa-0">Create a new point of sale</h2>
                </v-card-title>
                <v-card-text>
                    <v-row  class="mx-2">
                        <v-col class="mr-2" md="2" >
                            <v-text-field label="Display Name"
                                          outline
                                          required
                                          v-model="posSetup.display_name"
                            ></v-text-field>
                        </v-col>

                        <v-col class="mr-2" md="2" >
                            <v-select label="Customer type"
                                      :items="groupPos.customer_types"
                                      outline
                                      item-text="name"
                                      item-value="value"
                                      multiple
                                      required
                                      v-model="posSetup.customer_type"
                            ></v-select>
                        </v-col>

                        <v-col class="mr-2" md="2" >
                            <v-select label="Pos type"
                                      :items="['Services only', 'Products only', 'Both']"
                                      outline
                                      required
                                      v-model="posSetup.pos_type"
                            ></v-select>
                        </v-col>

                        <v-col class="mr-2" md="2" v-if="posSetup.pos_type === 'Products only' || posSetup.pos_type === 'Both'">
                            <v-autocomplete label="Select a store" :items="getStores.data" item-text="name" item-value="id"
                                            v-model="posSetup.store_id" outline required
                            ></v-autocomplete>
                        </v-col>

                        <v-col class="mr-2" md="2" v-if="(posSetup.pos_type === 'Services only' || posSetup.pos_type === 'Both') && getProcedureCategories.categories">
                            <v-select multiple
                                      :items="getProcedureCategories.categories"
                                      item-text="name"
                                      item-value="id"
                                      label="Service types/categories"
                                      v-model="posSetup.service_types"></v-select>
                        </v-col>


                        <v-col class="mr-2" md="2" >
                            <v-text-field label="Icon"
                                          outline
                                          placeholder="fa fa-icon"
                                          v-model="posSetup.icon"
                            ></v-text-field>
                        </v-col>
                        <v-col class="mr-2" md="2" >
                            <v-autocomplete label="Select a facility" :items="getFacilities.facilities" required item-text="name" item-value="id"
                                            v-model="posSetup.facility_id" outline
                            ></v-autocomplete>
                        </v-col>
                    </v-row>

                    <v-row  class="mx-2">
                        <v-col md="3">
                            <v-switch label="Is it a pharmaceuticals pos" class="mid-center" v-model="posSetup.is_pharmacy"></v-switch>
                        </v-col>
                      <v-col md="3">
                        <v-switch label="Is it a custom pos" class="mid-center" v-model="posSetup.is_custom"></v-switch>
                      </v-col>
                        <v-col md="3">
                            <v-switch label="Has stocks involvement" class="mid-center"  v-model="posSetup.has_stocks"></v-switch>
                        </v-col>
                        <v-col md="3">
                            <v-switch label="Allows credit sales" class="mid-center"  v-model="posSetup.allows_credit"></v-switch>
                        </v-col>
                        <v-col class="mr-2" md="1" >
                            <v-switch label="Active" class="mid-center"  v-model="posSetup.active"></v-switch>
                        </v-col>
                        <v-col class="mr-2" md="2" >
                            <v-btn small color="primary" v-if="!posSetup.updating" @click="savePos()">save</v-btn>
                            <v-btn small color="primary" v-if="posSetup.updating" @click="updatePos()">update</v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </div>
        </v-card>

        <br/>

        <v-card flat v-if="getPointsOfSale">
            <v-card-title class="subheading grey-text text-darken-2">
                <h2 class="body-2 ma-0 pa-0">Created points of sale</h2>
            </v-card-title>

            <v-data-table
                    :headers="headers"
                    :items="getPointsOfSale"
                    class="elevation-1"
            >
                <template v-slot:item.has_stocks="{ item }">
                    {{ item.has_stocks ? "True" : "False" }}
                </template>
                <template v-slot:item.is_pharmacy="{ item }">{{ item.is_pharmacy ? "True" : "False" }}</template>
                <template v-slot:item.active="{ item }">{{ item.active ? "True" : "False" }}</template>
                <template v-slot:item.actions="{ item }">
                    <v-btn icon small  @click="posSetup.updatePos(item)">
                        <v-icon small color="primary">edit</v-icon>
                    </v-btn>
                    <!-- <v-btn icon small>
                         <v-icon small color="error" @click="posSetup.deletePos(item.id)">delete</v-icon>
                     </v-btn>-->
                </template>

                <template v-slot:no-results>
                    <v-alert :value="true" color="error" icon="warning">
                        Your search for "{{ search }}" found no results.
                    </v-alert>
                </template>
            </v-data-table>
        </v-card>
    </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import PosSetup from "@settings/libs/pos/PosSetup";
import GroupPos from "@evaluation/libs/groupPos/GroupPos";

export default {
    data: () => ({
        groupPos: new GroupPos(),
        posSetup: new PosSetup(),
        headers: [
            { text: "Display name", value: "display_name" },
            { text: "Store", value: "store.name" },
            { text: "Facility", value: "facility.name" },
            { text: "Has stocks", value: "has_stocks" },
            { text: "Pharmacy", value: "is_pharmacy" },
            { text: "Active", value: "active" },
            { text: "Actions", value: "actions" },
        ],
    }),

    computed: {
        ...mapGetters([
            "getStores", "getFacilities", "getPointsOfSale", "getProcedureCategories"
        ]),

        initialised() {
            return !!(this.getStores && this.getFacilities);
        },
    },

    methods: {
        ...mapActions([
            "setStores", "setFacilities", "setPointsOfSale", "setProcedureCategories"
        ]),

        async savePos() {
            await this.posSetup.savePosDetails();
            await this.setPointsOfSale();
        },

        async updatePos() {
            await this.posSetup.updatePosDetails();
            await this.setPointsOfSale();
        },
    },

    mounted() {
        this.setStores();
        this.setFacilities();
        this.setPointsOfSale();
        this.setProcedureCategories();
    },
};
</script>
