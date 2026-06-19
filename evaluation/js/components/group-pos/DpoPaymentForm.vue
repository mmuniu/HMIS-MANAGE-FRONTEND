                    <v-row>
                      <v-col offset-md="1" md="8" class="mx-4">
                        <v-text-field
                          label="Customer Phone"
                          v-model="dpoPayment.customerPhone"
                          type="tel"
                          :rules="[v => !!v || 'Phone is required']"
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <!-- Service Description -->
                    <v-row>
                      <v-col offset-md="1" md="8" class="mx-4">
                        <v-text-field
                          label="Service Description"
                          v-model="dpoPayment.serviceDescription"
                          :rules="[v => !!v || 'Description is required']"
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <!-- Allocations Section -->
                    <v-subheader class="mt-4">Payment Allocations</v-subheader>
                    
                    <v-row v-for="(allocation, index) in dpoPayment.allocations" :key="index">
                      <v-col offset-md="1" md="3" class="mx-4">
                        <v-text-field
                          v-model="allocation.providerToken"
                          label="Provider Token"
                          :rules="[v => !!v || 'Provider token is required']"
                        ></v-text-field>
                      </v-col>
                      
                      <v-col md="2">
                        <v-text-field
                          v-model="allocation.amount"
                          label="Amount"
                          type="number"
                          :rules="[v => !!v || 'Amount is required']"
                          prefix="KSH"
                        ></v-text-field>
                      </v-col>
                      
                      <v-col md="2">
                        <v-text-field
                          v-model="allocation.currency"
                          label="Currency"
                          value="USD"
                          readonly
                        ></v-text-field>
                      </v-col>
                      
                      <v-col md="2">
                        <v-text-field
                          v-model="allocation.service"
                          label="Service Code"
                          :rules="[v => !!v || 'Service code is required']"
                        ></v-text-field>
                      </v-col>
                      
                      <v-col md="3">
                        <v-text-field
                          v-model="allocation.description"
                          label="Description"
                          :rules="[v => !!v || 'Description is required']"
                        ></v-text-field>
                      </v-col>
                      
                      <v-col md="1" class="text-right">
                        <v-btn
                          icon
                          color="error"
                          @click="removeAllocation(index)"
                          :disabled="dpoPayment.allocations.length <= 1"
                        >
                          <v-icon>fa-times</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col offset-md="1" class="mx-4">
                        <v-btn color="primary" @click="addAllocation">
                          <v-icon left>fa-plus</v-icon>
                          Add Allocation
                        </v-btn>
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col offset-md="1" md="8" class="mx-4">
                        <v-btn 
                          color="success" 
                          @click="requestPayment('dpo')" 
                          :disabled="!dpoPayment.customerEmail || !dpoPayment.customerPhone || !dpoPayment.serviceDescription"
                        >
                          <v-progress-circular
                              indeterminate
                              v-if="loading"
                              :size="10"
                              :width="2"
                              color="primary"
                          ></v-progress-circular>
                          Process DPO Payment
                        </v-btn>
                      </v-col>
                    </v-row>