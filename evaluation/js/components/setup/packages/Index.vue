<template>
  <div>
      <v-card-title>
          <span class="font-weight-bold">Create package</span>
      </v-card-title>

      <v-card class="my-2">
          <v-card-text>
              <v-row>
                  <v-col cols="3" class="pl-3">
                      <v-text-field v-model="package.name"
                                    required
                                    placeholder="e.g. holiday giveaway"
                                    label="Package name *"></v-text-field>
                  </v-col>
              </v-row>

              <v-row>
                  <v-col>
                      <v-switch label="Package is active?"
                                v-model="package.active"
                      ></v-switch>
                  </v-col>
              </v-row>
          </v-card-text>
      </v-card>

      <div class="py-2">
          <v-card class="py-2">
              <v-card-text>
                  <!--       procedures         -->
                  <v-row>
                      <v-col cols="3" class="pl-3">
                          <procedure-search @results="procedureSelected"
                                            active_only>
                          </procedure-search>
                      </v-col>
                  </v-row>
                  <v-row>
                      <v-col cols="9">
                          <selected-list :items="package.procedures"
                                         type="procedures"
                                         @removeItem="removeItem">
                          </selected-list>
                      </v-col>
                  </v-row>
              </v-card-text>
          </v-card>
      </div>


      <div class="py-2">
          <v-card  class="py-2">
              <!--       drugs         -->
              <v-row>
                  <v-col cols="3">
                      <v-autocomplete
                          v-model="package.drugs.store_id"
                          label="Choose store"
                          class="px-3"
                          outline
                          :items="filteredList"
                          item-value="id" item-text="name"
                      ></v-autocomplete>
                  </v-col>
                  <v-col cols="3">
                      <inventory-store-product-search @results="drugSelected"
                                                      class="px-3"
                                                      unDisableOutOfStock
                                                      :disabled="!package.drugs.store_id"
                                                      :storeId="package.drugs.store_id">
                      </inventory-store-product-search>
                  </v-col>
              </v-row>
              <v-row>
                  <v-col cols="9">
                      <selected-list :items="package.drugs.products"
                                     type="drugs"
                                     @removeItem="removeItem">
                      </selected-list>
                  </v-col>
              </v-row>
          </v-card>
      </div>


      <div class="py-2">
          <v-card  class="py-2">
              <!--       Consumables         -->
              <v-row>
                  <v-col cols="3">
                      <v-autocomplete
                          v-model="package.consumables.store_id"
                          label="Choose store"
                          class="px-3"
                          outline
                          :items="filteredList"
                          item-value="id" item-text="name"
                      ></v-autocomplete>
                  </v-col>
                  <v-col cols="3">
                      <inventory-store-product-search @results="consumableSelected"
                                                      class="px-3"
                                                      unDisableOutOfStock
                                                      :disabled="!package.consumables.store_id"
                                                      :storeId="package.consumables.store_id"
                                                      isConsumable="1">
                      </inventory-store-product-search>
                  </v-col>
              </v-row>
              <v-row>
                  <v-col cols="9">
                      <selected-list :items="package.consumables.products"
                                     type="consumables"
                                     @removeItem="removeItem">
                      </selected-list>
                  </v-col>
              </v-row>
          </v-card>

          <v-btn small class="mt-2" color="primary" @click="package.save()">
              save package
          </v-btn>
      </div>

      <div>
          <v-card>
              <v-card-title> List of the created packages</v-card-title>
              <v-card-text>
                  <collabmed-loading v-if="!packages.data"></collabmed-loading>

                  <v-data-table :headers="headers"
                                v-else
                                :items="packages.data"
                                disable-pagination
                                hide-default-footer
                  >
                      <template v-slot:item.details="{ item }">
                          <span v-for="packageItem in item.details">{{ packageItem.item_name }} - Cash price: {{ packageItem.new_cash_price }} Insurance price: {{ packageItem.new_insurance_price }} <br/></span>
                      </template>
                      <template v-slot:item.actions="{ item }">
<!--                            <v-btn small color="primary" @click="editPackage(item)">edit</v-btn>-->
                          <v-btn small color="error" @click="deletePackage(item)">delete</v-btn>
                      </template>
                  </v-data-table>
              </v-card-text>
          </v-card>
      </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import SelectedList from './partials/SelectedList';
import Package from "@evaluation/libs/setup/packages/Package";
import ProductSearch from "@inventory/components/ProductsSearch";
import ProcedureSearch from '@evaluation/components/procedures/ProcedureSearch';
import PackageSearch from '@evaluation/components/setup/packages/PackageSearch';

export default {
  components: {
      ProductSearch,
      ProcedureSearch,
      SelectedList,

  },

  data () {
      return {
          package: new Package(),
          headers: [
              { text: 'Name', value: 'name' },
              { text: 'Created By', value: 'user' },
              { text: 'Active', value: 'active' },
              { text: 'Details', value: 'details' },
              { text: 'Actions', value: 'actions' },
          ]
      }
  },

  computed: {
      ...mapGetters({
          stores: "getStores",
          packages: "getPackages"
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
          "setStores", "setPackages"
      ]),

      editPackage(item) {
          this.package.assemble(item);
      },

      async deletePackage (item) {
          await this.package.deletePackage(item);
          this.setPackages();
      },

      procedureSelected(procedure) {
         if(procedure) {
             let procedureItem = {
                 id: procedure.id,
                 name: procedure.name,
                 cash_price: procedure.cash_charge,
                 new_cash_price: procedure.cash_charge,
                 insurance_price: procedure.insurance_charge,
                 new_insurance_price: procedure.insurance_charge,
                 units: 1,
                 discount: 0
             };

             let found = this.package.procedures.filter((proc) => proc.id === procedure.id  );

             if (found.length < 1) {
                 this.package.procedures.push(procedureItem);
             } else {
                 flash({
                     message: 'Procedure already added to package',
                     alert: 'warning'
                 });
             }
         }
      },

      drugSelected(product) {
          this.itemSelected(product, 'drugs');
      },

      consumableSelected (product) {
          this.itemSelected(product, 'consumables');
      },

      removeItem (item, type) {
          if(type === 'drugs' || type === 'consumables') {
              const index = this.package[type].products.indexOf(item.item);

              if(index >= 0) {
                  this.package[type].products.splice(index, 1);
              }
          } else {
              const index = this.package[type].indexOf(item.item);

              if(index >= 0) {
                  this.package[type].splice(index, 1);
              }
          }
      },

      itemSelected (product, type) {
          if(product) {
              let productItem = {
                  id: product.id,
                  name: product.name,
                  cash_price: product.selling_price,
                  new_cash_price: product.selling_price,
                  insurance_price: product.insurance_price,
                  new_insurance_price: product.insurance_price,
                  units: 1,
                  discount: 0
              };

              let found = this.package[type].products.filter((prod) => prod.id === product.id  );

              if (found.length < 1) {
                  this.package[type].products.push(productItem);
              } else {
                  flash({
                      message: 'Product already added to package',
                      alert: 'warning'
                  });
              }
          }
      }
  },

  mounted() {
      this.setStores();
      this.setPackages();
      console.log(this.setStores());
  },
}
</script>
