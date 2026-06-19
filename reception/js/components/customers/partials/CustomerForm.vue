<template>
  <collabmed-loading v-if="!initialised"></collabmed-loading>

  <div v-else>

    <v-alert :value="ageConflict" color="info" icon="info" outlined class="mb-4">
      Please note that if the date of birth and the age are both filled in then the date of birth will be ignored
    </v-alert>

    <v-dialog v-model="showSchemeModal" max-width="600px">
      <v-card>
        <v-card-title class="headline">Scheme Details</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="4">
              <v-btn large block color="primary" v-html=" 'Add Smart Card'" @click="handleButton1"></v-btn>
            </v-col>
            <v-col cols="12" sm="4">
              <v-btn large block color="secondary" v-html="'Add Smart User Details Manually'" @click="smartManual"></v-btn>
            </v-col>

          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeSchemeModal">Close</v-btn>
        </v-card-actions>
      </v-card>
  </v-dialog>
    <v-dialog v-model="showSmartManualModal" max-width="600px">
      <v-card>
        <v-card-title class="headline">Smart Manual Input</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6">
              <v-autocomplete
                v-model="smartManualInput1"
                :items="allCustomers"
                label="Patients List"
                outlined
                clearable
              ></v-autocomplete>

            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="smartManualInput2"
                label="Input Field 2"
                type="number"
                outlined
                clearable
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showSmartManualModal = false">Close</v-btn>
<!--          <v-btn color="primary" @click="submitSmartManual">Submit</v-btn>-->
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- profile information -->
    <v-card class="mb-5">
      <v-card-title>
        <h2 class="text-body-2 ma-0 pa-0">Customer profile information</h2>
      </v-card-title>

      <v-divider class="ma-0"></v-divider>


      <v-card-text>

        <v-row >

          <v-col cols="12">
            <v-radio-group v-model="isCorporate" row>
              <v-radio :label="'Regular Account'" :value="false"></v-radio>
            </v-radio-group>
          </v-col>

          <v-col cols="12" v-if="isCorporate">
            <v-divider class="my-3"></v-divider>
            <div class="text-subtitle-2 mb-2">Corporate Account Details</div>

            <v-text-field
              label="Company Name"
              v-model="companyName"
              dense
              outlined
            ></v-text-field>

            <v-text-field label="KRA PIN Certificate" v-model="corporate.kra_pin_certificate" dense outlined></v-text-field>

            <div class="text-subtitle-2 mb-2 mt-3">Procurement Officer Contact</div>
            <v-text-field label="Officer Name" v-model="corporate.procurement_officer_name" dense outlined></v-text-field>
            <v-text-field label="Officer Phone" v-model="corporate.procurement_officer_phone" dense outlined></v-text-field>
            <v-text-field label="Officer Email" v-model="corporate.procurement_officer_email" dense outlined></v-text-field>

            <div class="text-subtitle-2 mb-2 mt-3">Credit Terms</div>
            <v-text-field label="Credit Days" type="number" v-model.number="corporate.credit_days" dense outlined></v-text-field>
            <v-text-field label="Credit Limit" type="number" v-model.number="corporate.credit_limit" dense outlined></v-text-field>
          </v-col>

          <v-col cols="12" md="4" v-if="!isCorporate && visibilitySettings['first_name']">

            <div class="mx-3">
              <v-text-field
                  v-model="customer.profile.first_name"
                  :error="errors.has('profile.first_name')" outlined required
                  :hint="errors.get('profile.first_name')" persistent-hint
                  @keyup="errors.clear('profile.first_name')"
              >
                <template v-slot:label>
                  <div v-html="getFieldLabel('First Name', 'first_name')"></div>
                </template>
              </v-text-field>

            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="!isCorporate && !msetting('reception.remove_middle_name') && visibilitySettings['middle_name']">
            <div class="mx-3">
              <v-text-field v-model="customer.profile.middle_name"
                            outlined>
                <template v-slot:label>
                  <div v-html="getFieldLabel('Middle Name', 'middle_name')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="!isCorporate && visibilitySettings['last_name']">
            <div class="mx-3">
              <v-text-field
                  v-model="customer.profile.last_name"
                  :error="errors.has('profile.last_name')" outlined required
                  :hint="errors.get('profile.last_name')" persistent-hint
                  @keyup="errors.clear('profile.last_name')">
                <template v-slot:label>
                  <div v-html="getFieldLabel('Last Name','last_name')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>

          <v-col cols="12" sm="4" v-if="visibilitySettings['date_of_birth']">
            <input type="radio" class="lni-radio-button" value="dob"  id="dob_select" v-model="dob_selection" name="using dob" @change="selectDobAge()">
            <div v-html="getFieldLabel('DoB or', 'date_of_birth')"></div>

            <input type="radio" class="lni-radio-button" value="age_in_years" id="age_in_years"  v-model="dob_selection"  name="using dob" @change="selectDobAge()">
            <label for="age_in_years">Age</label><br>
          </v-col>
          <v-col v-if="useAgeDatePicker && visibilitySettings['date_of_birth']" cols="12" md="4">
            <div class="mx-3">
              <v-menu
                  ref="dob"
                  :close-on-content-click="false"
                  v-model="dob"
                  :return-value.sync="customer.profile.dob"
                  transition="scale-transition"
                  min-width="290px">
                <template v-slot:activator="{ on }">
                  <v-text-field
                      flat outlined clearable
                      v-on="on"
                      v-model="customer.profile.dob"
                      readonly :error="errors.has('profile.dob')"
                      :hint="errors.get('profile.dob')" persistent-hint
                      @change="errors.clear('profile.dob')"
                      @input="onDobInput"
                  >
                    <template v-slot:label>
                      <div v-html="getFieldLabel('Date of Birth', 'date_of_birth')"></div>
                    </template>
                  </v-text-field>
                </template>



                <v-date-picker v-model="customer.profile.dob" scrollable>
                  <v-spacer></v-spacer>
                  <v-btn flat color="primary" @click="dob = false">Cancel</v-btn>
                  <v-btn flat color="primary" @click="$refs.dob.save(customer.profile.dob)">OK</v-btn>
                </v-date-picker>
              </v-menu>
            </div>

          </v-col>
          <v-col cols="12" md="4" v-if="showAgeChip && visibilitySettings['date_of_birth']">
            <v-chip  color="blue" text-color="white" small>{{ ageChipText }}</v-chip>
            <input  v-if="showAgeChip" type="hidden" v-model="customer.age">
          </v-col>

          <v-col cols="12" md="4" v-if="showSelectAge && visibilitySettings['date_of_birth']">
            <div class="mx-3" >
              <v-text-field  type="number" v-model="customer.age" outlined :readonly="ageReadOnly"
                             @keyup="errors.clear('age')">
                <template v-slot:label>
                  <div v-html="getFieldLabel('Age as number', 'date_of_birth')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>

          <v-col cols="12" v-if="!useAgeDatePicker && visibilitySettings['date_of_birth']" md="4">
            <div class="mx-3">
              <v-select  :items="configurations.age_in" item-text="item_name"
                         item-value="item_name"
                         v-model="customer.age_in" :error="errors.has('age_in')" outlined
                         :hint="errors.get('age_in')"
                         persistent-hint @change="errors.clear('age_in')">
                <template v-slot:label>
                  <div v-html="getFieldLabel('Age in', 'date_of_birth')"></div>
                </template>
              </v-select>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="visibilitySettings['gender']">
            <div class="mx-3">
              <v-select
                  :items="genders"
                  v-model="customer.profile.sex"
                  :error="errors.has('profile.sex')" outlined
                  :hint="errors.get('profile.sex')" persistent-hint
                  @keyup="errors.clear('profile.sex')"
              >
                <template v-slot:label>
                  <div v-html="getFieldLabel('Gender', 'gender')"></div>
                </template>
              </v-select>
            </div>
          </v-col>
          <v-col cols="12" md="4" v-if="visibilitySettings['marital_status']">
            <div class="mx-3">
              <v-select
                  :items="marital_status"
                  v-model="customer.profile.marital_status"
                  :error="errors.has('profile.marital_status')" outlined
                  :hint="errors.get('profile.marital_status')" persistent-hint
                  @keyup="errors.clear('profile.martial_status')"
              >
                <template v-slot:label>
                  <div v-html="getFieldLabel('Marital status', 'marital_status')"></div>
                </template>
              </v-select>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="visibilitySettings['ethnicity']">
            <div class="mx-3">
              <v-text-field
                  v-model="customer.profile.ethnicity"
                  :error="errors.has('profile.ethnicity')" outlined
                  :hint="errors.get('profile.ethnicity')" persistent-hint
                  @keyup="errors.clear('profile.ethnicity')"
              >
                <template v-slot:label>
                  <div v-html="getFieldLabel('Ethnicity', 'ethnicity')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>
          <v-col cols="12" md="4" v-if="visibilitySettings['id_number']">
            <div class="mx-3">
              <v-text-field
                  v-model="customer.profile.id_no"
                  :error="errors.has('profile.id_no')" outlined
                  :hint="errors.get('profile.id_no')" persistent-hint
                  @keyup="errors.clear('profile.id_no')"
              >
                <template v-slot:label>
                  <div v-html="getFieldLabel('ID Number', 'id_number')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>

          <!-- KRA PIN Field -->
          <v-col cols="12" md="4">
            <div class="mx-3">
              <v-text-field
                  v-model="customer.profile.kra_pin_number"
                  :error="errors.has('profile.kra_pin_number')" outlined
                  :hint="errors.get('profile.kra_pin_number')" persistent-hint
                  @keyup="errors.clear('profile.kra_pin_number')"
              >
                <template v-slot:label>
                  <div>KRA PIN</div>
                </template>
              </v-text-field>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="visibilitySettings['nemis_number']">
            <div class="mx-3">
              <v-text-field
                  v-model="customer.profile.nemis_number"
                  :error="errors.has('profile.nemis_number')" outlined
                  :hint="errors.get('profile.nemis_number')" persistent-hint
                  @keyup="errors.clear('profile.nemis_number')"
              >
                <template v-slot:label>
                  <div v-html="getFieldLabel('Nemis Number', 'nemis_number')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="!msetting('reception.remove_tsc_number')">
            <div class="mx-3">
              <v-text-field
                  v-model="customer.profile.tsc_number"
                  :error="errors.has('profile.tsc_number')" outlined
                  :hint="errors.get('profile.tsc_number')" persistent-hint
                  @keyup="errors.clear('profile.tsc_number')"
              >
                <template v-slot:label>
                  <div v-html="getFieldLabel('TSC number', 'tsc_number')"></div>
                </template>

              </v-text-field>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="!msetting('reception.remove_occupation') && visibilitySettings['occupation'] ">
            <div class="mx-3">
              <v-text-field
                  v-model="customer.profile.occupation"
                  :error="errors.has('profile.occupation')" outlined
                  :hint="errors.get('profile.occupation')" persistent-hint
                  @keyup="errors.clear('profile.occupation')"
              >
                <template v-slot:label>
                  <div v-html="getFieldLabel('Occupation', 'occupation')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>

          <!--<v-col cols="12" md="4" v-if="can('evaluation.view-patient-allergies')">
              <div class="mx-3">
                  <v-textarea label="Allergies" outlined v-model="customer.allergies" outline></v-textarea>
              </div>
          </v-col>-->
        </v-row>
      </v-card-text>
    </v-card>

    <!-- contact information -->
    <v-card class="mb-5">
      <v-card-title>
        <h2 class="text-body-2 ma-0 pa-0">Customer contact information</h2>
      </v-card-title>

      <v-divider class="ma-0"></v-divider>

      <v-card-text>
        <v-row >
          <v-col cols="12" md="4">
            <div class="mx-3">
              <v-text-field
                  v-model="customer.profile.mobile" outlined
                  :error="errors.has('profile.mobile')"
                  :hint="errors.get('profile.mobile')" persistent-hint
                  @keyup="errors.clear('profile.mobile')"
              >
                <template v-slot:label>
                  <div v-html="getFieldLabel('Mobile', 'mobile')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="visibilitySettings['secondary_number']">
            <div class="mx-3">
              <v-text-field
                  v-model="customer.profile.alt_number"
                  outlined>
                <template v-slot:label>
                  <div v-html="getFieldLabel('Secondary Number', 'secondary_number')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="visibilitySettings['email_address']">
            <div class="mx-3">
              <v-text-field  type="email"
                             v-model="customer.profile.email"
                             :error="errors.has('profile.email')" outlined
                             :hint="errors.get('profile.email')" persistent-hint
                             @keyup="errors.clear('profile.email')"
              >
                <template v-slot:label>
                  <div v-html="getFieldLabel('Email Address', 'email_address')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="visibilitySettings['secondary_email']">
            <div class="mx-3">
              <v-text-field  type="email"
                             v-model="customer.profile.secondary_email"
                             :error="errors.has('profile.secondary_email')" outlined
                             :hint="errors.get('profile.secondary_email')" persistent-hint
                             @keyup="errors.clear('profile.secondary_email')"
              >
                <template v-slot:label>
                  <div v-html="getFieldLabel('Secondary Email Address', 'secondary_email_address')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="visibilitySettings['telephone']">
            <div class="mx-3">
              <v-text-field  v-model="customer.profile.telephone"
                             outlined>
                <template v-slot:label>
                  <div v-html="getFieldLabel('Telephone', 'telephone')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="visibilitySettings['countries']">
            <div class="mx-3">
              <v-autocomplete
                  v-if="countries.length > 1"
                  :items="countries"
                  item-text="name"
                  outlined
                  item-value="name"
                  chips
                  deletable-chips
                  v-model="customer.profile.nationality">
              </v-autocomplete>
              <v-text-field v-else label="Nationality" v-model="customer.profile.nationality"
                            outlined>
                <template v-slot:label>
                  <div v-html="getFieldLabel('Nationality', 'nationality')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>
          <v-col cols="12" md="4" v-if="!msetting('reception.remove_county_of_residence') && visibilitySettings['county_of_residence']">
            <div class="mx-3">
              <v-autocomplete :items="counties"
                              v-model="customer.profile.resident_county"
                              @input="fetchSubCounties()">
                <template v-slot:label>
                  <div v-html="getFieldLabel('County', 'county_of_residence')"></div>
                </template>
              </v-autocomplete>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="!msetting('reception.remove_sub_county') && visibilitySettings['sub_county_of_residence']">
            <div class="mx-3">
              <v-col cols="9">

                <v-autocomplete   label="Sub county of residence"
                                  outline
                                  :items="getSubCounties"
                                  v-model="customer.profile.resident_sub_county"
                                  persistent-hint>
                  <template v-slot:label>
                    <div v-html="getFieldLabel('Sub county', 'sub_county_of_residence')"></div>
                  </template>
                </v-autocomplete>
              </v-col>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="!msetting('reception.remove_village') && visibilitySettings['village']">
            <div class="mx-3">
              <v-text-field  v-model="customer.profile.resident_village"
                             outlined>
                <template v-slot:label>
                  <div v-html="getFieldLabel('Village/Estate', 'village')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="!msetting('reception.remove_town') && visibilitySettings['town']">
            <div class="mx-3">
              <v-text-field  v-model="customer.profile.town"
                             outlined>
                <template v-slot:label>
                  <div v-html="getFieldLabel('Town', 'town')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="!msetting('reception.remove_home_location') && visibilitySettings['home']">
            <div class="mx-3">
              <v-text-field v-model="customer.profile.home_location"
                            outlined>
                <template v-slot:label>
                  <div v-html="getFieldLabel('Home Location', 'home')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>


          <v-col cols="12" md="4" v-if="!msetting('reception.remove_postal_address') && visibilitySettings['postal_address']">
            <div class="mx-3">
              <v-text-field v-model="customer.profile.address"
                            outlined>
                <template v-slot:label>
                  <div v-html="getFieldLabel('Postal Address', 'postal_address')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="!msetting('reception.remove_postal_code') && visibilitySettings['postal_code']">
            <div class="mx-3">
              <v-text-field v-model="customer.profile.post_code"
                            outlined>
                <template v-slot:label>
                  <div v-html="getFieldLabel('Postal Code', 'postal_code')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="visibilitySettings['other_details']">
            <div class="mx-3">
              <v-textarea label="Other details"
                          v-model="customer.profile.other_details"
                          placeholder="Any other information about the patient"
                          outlined>
                <template v-slot:label>
                  <div v-html="getFieldLabel('Other details', 'other_details')"></div>
                </template>
              </v-textarea>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>


    <!--insurance information -->
    <v-card class="mb-5">

      <div>
        <v-card-title>
          <h2 class="text-body-2 ma-0 pa-0">Customer finance &amp; insurance details</h2>
        </v-card-title>

        <v-divider class="ma-0"></v-divider>
        <!-- customer loyalty eligibility information -->
        <v-card class="mb-5">
          <v-card-title>
            <h2 class="text-body-2 ma-0 pa-0">Customer loyalty eligibility ?</h2>

          </v-card-title>

          <v-divider class="ma-0"></v-divider>

          <v-card-text>
            <v-row >
              <v-col cols="12" md="6">
                <div class="mx-3">
                  <v-switch label="Customer is eligible for loyalty points program ?" v-model="customer.profile.eligibleForPoints"></v-switch>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-divider class="ma-0"></v-divider>

        <v-card-text>
          <v-col cols="12">
            <div class="mx-3">
              <v-switch label="Customer has insurance" v-model="customer.hasInsurance"></v-switch>
            </div>
          </v-col>

          <v-col cols="12" v-if="customer.hasInsurance">
            <transition-group name="slide-fade">
              <v-row  v-for="(scheme, index) in customer.schemes.length" :key="index+0" class="my-4 mx-3">

                <v-col cols="12">
                  <div class="mx-2">
                    <p class="pink--text">
                      <span class="subheading mt-3">Scheme {{ index + 1 }}</span>
                      <v-btn small @click.prevent="removeScheme(index)" color="pink"
                             icon dark v-if="!customer.schemes[index].scheme_name">
                        <v-icon small>delete</v-icon>
                      </v-btn>
                    </p>
                  </div>
                </v-col>

                <v-col cols="12" sm="4">
                  <div v-if="customer.schemes[index].scheme_name">
                    <p class="font-weight-bold text-h6"
                       v-if="editingMode">{{ customer.schemes[index].scheme_name }}</p>
                  </div>

                  <div class="mx-2" v-else>
                    <v-autocomplete :items="insuranceCompanies"
                                    @change="selectSchemes($event, index,customer.age,customer.age_in,customer.profile.sex)"
                                    item-text="name" return-object
                                    v-model="customer.schemes[index].company_id"
                                    label="Insurance Company" outlined
                    ></v-autocomplete>
                  </div>
                </v-col>

                <v-col cols="12" sm="4">
                  <div  class="mx-2" v-if="! customer.schemes[index].scheme_name">
                    <v-autocomplete v-model="customer.schemes[index].scheme_id"
                                    @change="selectSpecificSchemes($event)"
                                    :items="insuranceSchemes[index]"
                                    item-text="full_name" item-value="id"
                                    label="Insurance Schemes" outlined
                    ></v-autocomplete>
                  </div>
                </v-col>

                <v-col cols="12" sm="4">
                  <div class="mx-2">
                    <v-text-field v-model="customer.schemes[index].policy_number"
                                  label="Policy Number" outlined
                    ></v-text-field>
                  </div>
                </v-col>

                <v-col cols="12" sm="4">
                  <div class="mx-2">
                    <v-text-field v-model="customer.schemes[index].principal"
                                  label="Principal" outlined
                    ></v-text-field>
                  </div>
                </v-col>

                <v-col cols="12" sm="4">
                  <div class="mx-2">

                  </div>
                  <div class="mx-2">
                    <v-menu
                        :ref="`reference${index}`"
                        :close-on-content-click="false"
                        :v-model="dateMenu(index)"
                        transition="scale-transition"
                        min-width="290px"
                        :return-value.sync="customer.schemes[index].dob"
                    >

                      <template v-slot:activator="{ on }">
                        <v-text-field
                            v-on="on"
                            label="Date of Birth"
                            v-model="customer.schemes[index].dob"
                            readonly outlined
                        ></v-text-field>
                      </template>

                      <v-date-picker v-model="customer.schemes[index].dob" no-title scrollable @change="calculateAge">
                        <v-spacer></v-spacer>
                        <v-btn flat color="primary"
                               @click="customer.schemes[index].menu = false">
                          Cancel
                        </v-btn>
                        <v-btn flat color="primary" @click="pickDate(index)">OK</v-btn>
                      </v-date-picker>
                    </v-menu>
                  </div>
                </v-col>


                <v-col cols="12" sm="4">
                  <div class="mx-2">
                    <v-select v-model="customer.schemes[index].relationship_id"
                              v-if="configurations"
                              :items="configurations.relationship"
                              item-text="item_name" item-value="id"
                              label="Relationship" outlined
                    ></v-select>
                  </div>
                </v-col>
              </v-row>
            </transition-group>


            <!-- Button to add schemes -->
            <v-col cols="12">
              <v-btn @click.prevent="addScheme()" color="blue" icon dark class="mb-2 mt-3">
                <v-icon>add_circle</v-icon>
              </v-btn>
            </v-col>
            <!-- End of Button -->

          </v-col>
        </v-card-text>
      </div>


      <v-card-text>
        <v-col cols="12" v-if="errors.any()">
          <v-alert :value="true" type="error" outlined>
            <div v-html="errors.display()"></div>
          </v-alert>
        </v-col>

        <v-col cols="12" class="text-right">
                    <span v-if="!patient_id">
                        <v-btn v-if="!profile" type="submit" class="blue lighten-1" color="blue" large
                               :dark="!formLoader" :loading="formLoader" :disabled="formLoader"
                               @click="saveCustomer()">
                            {{ !screen ? 'Save customer' : 'Save' }}
                        </v-btn>
                    </span>

          <span v-if="!patient_id">

                    </span>

          <v-btn v-if="profile " type="submit" class="blue lighten-1" color="blue" large
                 :dark="!formLoader" :loading="formLoader" :disabled="formLoader"
                 @click="updateCustomer()">
            {{ !screen ? 'Update customer' : 'Update' }}
          </v-btn>

          <v-btn v-if="checkin" class="green lighten-1" dark large @click="checkinPatient()">
            Checkin Patient
          </v-btn>
        </v-col>

      </v-card-text>
    </v-card>



  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Customer from '@reception/libs/customers/Customer';
import SettingsOptions from '@settings/libs/SettingsOptions';
import countiesJson from '/resources/frontend/reception/counties/counties.json';
import subCountiesJson from '/resources/frontend/reception/counties/sub-counties.json';
import Registration from '@settings/libs/registration/Registration';
export default {
  props: {
    profile: {
      default: null,
    },

    editingMode: {
      type: Boolean,
      default: false,
    },
    screen: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      patient_id: null,
      dob: false,
      formLoader: false,
      checkin: false,
      insuranceSchemes: [],
      insuranceCompanies: [],
      customer: new Customer(),
      handleButton1:false,
      smartManual:false,
      closeSchemeModal:false,
      showSchemeModal:false,
      loader: false,
      options: new SettingsOptions(),
      registration: new Registration(),
      home: 'Home',
      countries: [],
      counties: null,
      ethnicity: null,
      tsc_no: null,
      age: null,
      dob_selection: null,
      age_in_years: false,
      nemis_number: null,
      sub_counties: [],
      getSubCounties: [],
      showAgeChip: false,
      showSelectAge: false,
      useAgeDatePicker: true,
      ageChipText: '',
      genders: [
        { text: 'Male', value: 'male' },
        { text: 'Female', value: 'female' },
      ],
      marital_status: [
        { text: 'Single', value: 'single' },
        { text: 'Married', value: 'married' },
        { text: 'Divorced', value: 'divorced' },
        { text: 'Widowed', value: 'windowed' },

      ],
      fields: [],
      visibilitySettings: {},
      mandatorySettings: {},

            showSmartManualModal: false,

            submitSmartManual:false,

            smartManualInput1: null,

            smartManualInput2: null,

            smartManualAutocompleteItems1: [],

            smartManualAutocompleteItems2: [],

            allCustomers: [],
            isCorporate: false,
            corporate: {
              kra_pin_certificate: '',
              procurement_officer_name: '',
              procurement_officer_phone: '',
              procurement_officer_email: '',
              credit_days: 0,
              credit_limit: 0
            },

            companyName: '',
    };
  },

  computed: {
    ...mapGetters([
      'getInsurances', 'getCounties',
    ]),
    shouldRenderChiefCard() {
      return ['chief_first_name', 'chief_middle_name', 'chief_last_name', 'chief_mobile_number']
          .some((field) => this.visibilitySettings[field]);
    },

    ageReadOnly() {
      return !!this.customer.profile.dob; // Check if dob is filled
    },

    ageConflict() {
      return this.customer.profile.dob && this.customer.age;
    },

    configurations() {
      return this.options.configurations;
    },

    initialised() {
      const initial = this.getInsurances && this.configurations;

      if (this.profile) {
        return initial && this.profile && this.populated;
      }

      return initial;
    },
    getFieldLabel() {
      return (label, field) => {
        if (this.visibilitySettings[field] && this.mandatorySettings[field]) {
          return `${label} <span style="color: red">*</span>`;
        } else {
          return label;
        }
      };
    },

    errors() {
      return this.customer.form.errors;
    },

    submitted() {
      return this.customer.form.submitted;
    },

    contaminated() {
      return this.customer.form.errorDetected;
    },

    populated() {
      return this.customer.populated;
    },
  },

  watch: {

    isCorporate(newVal) {
      if (newVal) {
        const name = this.customer.profile.first_name || this.customer.profile.last_name || '';
        if (name) {
          this.customer.profile.first_name = name;
          this.customer.profile.middle_name = name;
          this.customer.profile.last_name = name;
        }
      } else {

      }
    },

    // react when parent passes profile (e.g. on edit route) to populate corporate fields
    profile: {
      immediate: true,
      handler(val) {
        if (val) {
          this.loadCorporateFromProfile(val);
        }
      }
    },


   'customer.profile.dob'(newVal, oldVal) {
     if (newVal !== oldVal) {
       this.calculateAge();
     }
   },

    contaminated(value) {
      if (value) {
        this.formLoader = false;

        this.customer.form.errorDetected = false;
      }
    },

    submitted(value) {
      if (value) {
        this.formLoader = false;
        this.checkin = true;

        this.customer.form.submitted = false;
      }
    },
  },

  methods: {
    ...mapActions([
      'setInsurances', 'setCounties',
    ]),

    loadCorporateFromProfile(profile) {
        try {
          if (!profile) return;

          // ensure patient id mapping
          if (profile.id) {
            this.patient_id = profile.id;
            this.customer.customer_id = profile.id;
            this.customer.profile.id = profile.id;
          }

          const corp = profile.corporate_account || null;
          if (!corp) return;

          // enable corporate UI and mirror company name into name fields
          this.isCorporate = true;
          // populate corporate object
           this.corporate.company_name = this.companyName;
          this.corporate.kra_pin_certificate = corp.kra_pin_certificate ?? '';
          this.corporate.procurement_officer_name = corp.procurement_officer_name ?? '';
          this.corporate.procurement_officer_phone = corp.procurement_officer_phone ?? '';
          this.corporate.procurement_officer_email = corp.procurement_officer_email ?? '';
          this.corporate.credit_days = corp.credit_days ?? 0;
          this.corporate.credit_limit = corp.credit_limit ?? 0;

          // keep corporate id for updates
          this.customer.profile.corporate_account_id = corp.id ?? null;
        } catch (e) {
          // silent failure - best-effort population
        }
      },

    async fetchAllCustomers() {
      try {
        const response = await fetch('/api/reception/patients/');

        // const response = await fetch('/api/reception/all/patients/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Map data to objects with label and value properties
        this.allCustomers = data.map(customer => ({
          label: customer.first_name,
          value: customer.id,
        }));

        // this.allCustomers = this.allCustomers;
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      }
    },



    selectDobAge() {
      if (this.dob_selection === 'dob') {
        this.useAgeDatePicker = true;
        this.showSelectAge =false;

      } else if (this.dob_selection === 'age_in_years') {
        this.showAgeChip = false;
        this.showSelectAge =true;
        this.useAgeDatePicker = false;
      }
    },



    onDobInput(value) {
      if (!value) {
        this.customer.age = null;
        // Clear the error related to dob if necessary
        this.errors.clear('profile.dob');
      }
    },
    async fetchRegistrationFormSettings() {
      this.loader = true;
      try {
        // Define all possible fields
        const allFields = [
          'first_name', 'last_name', 'middle_name', 'date_of_birth', 'gender', 'marital_status', 'ethnicity',
          'nemis_number', 'id_number', 'tsc_number', 'occupation', 'mobile', 'secondary_number', 'email_address',
          'secondary_email', 'telephone', 'countries', 'county_of_residence', 'sub_county_of_residence',
          'village', 'town', 'home', 'postal_address', 'postal_code', 'other_details',
          'chief_first_name', 'chief_middle_name', 'chief_last_name', 'chief_area', 'chief_mobile_number'
        ];

        // Set all fields as not visible and not mandatory by default
        const visibilitySettings = {};
        const mandatorySettings = {};

        allFields.forEach(field => {
          visibilitySettings[field] = false;
          mandatorySettings[field] = false;
        });

        // Make only first name, last name, ID number, and mobile visible and mandatory
        const requiredFields = ['first_name', 'last_name', 'id_number', 'mobile'];

        requiredFields.forEach(field => {
          visibilitySettings[field] = true;
          mandatorySettings[field] = true;
        });

        this.visibilitySettings = visibilitySettings;
        this.mandatorySettings = mandatorySettings;
      } catch (error) {
        console.error('Failed to set settings:', error);
      } finally {
        this.loader = false;
      }
    },
    calculateAge() {
      if (this.customer.profile.dob) {
        const dob = new Date(this.customer.profile.dob);
        const today = new Date();
        const millisecondsInDay = 1000 * 60 * 60 * 24;
        const millisecondsInMonth = millisecondsInDay * 30; // Approximation, can be adjusted as needed

        // Calculate age in days
        const ageInDays = Math.floor((today - dob) / millisecondsInDay);

        // Calculate age in months
        const ageInMonths = Math.floor(ageInDays / 30);

        // Calculate age in years
        const ageInYears = Math.floor(ageInDays / 365);

        if (ageInDays <= 30) {
          this.customer.age = ageInDays; // Retain the age as days
          this.ageChipText = ageInDays + ' day(s)';
        } else if (ageInDays <= 540) { // 18 months = 18 * 30 days
          this.customer.age = ageInMonths; // Retain the age as months
          this.ageChipText = ageInMonths + ' month(s)';
        } else {
          // Calculate the remaining months after subtracting full years
          const remainingMonths = ageInMonths - (ageInYears * 12);
          this.customer.age = ageInYears; // Retain the age as years
          if (remainingMonths === 0) {
            this.ageChipText = ageInYears + ' years';
          } else {
            this.ageChipText = ageInYears + ' years ' + remainingMonths + ' months';
          }
        }

        this.showAgeChip = true;
      } else {
        this.showAgeChip = false;
      }
    },

    dependantSelected(customer) {
      const data = {
        name: customer.full_name,
        relationship_id: null,
        age: customer.age_friendly,
        id: customer.id,
      };

      if (this.customer.dependants.length >= this.msetting('reception.number_of_dependants')) {
        flash({
          message: 'This customer has reached the maximum number of dependants',
          alert: 'warning',
        });
      } else {
        if (this.customer.dependants.some((obj) => obj.id === data.id)) {
          flash({
            message: 'Already selected',
            alert: 'warning',
          });
        } else {
          this.customer.dependants.push(data);
        }
      }
    },

    removeDependant(index) {
      this.customer.dependants.splice(index, 1);
    },

    pickDate(index) {
      const reference = `reference${index}`;
      this.$refs[reference][0].save(this.customer.schemes[index].dob);
    },

    dateMenu(index) {
      return this.customer.schemes[index].menu;
    },

    addScheme() {
      this.customer.schemes.push(
          this.customer.schemeTemplate(),
      );
    },

    addNok() {
      this.customer.noks.push(
          this.customer.nokTemplate(),
      );
    },

    removeScheme(index) {
      this.insuranceSchemes.splice(index, 1);
      this.customer.schemes.splice(index, 1);
    },

    removeNok(index) {
      this.customer.noks.splice(index, 1);
    },

    selectSchemes(company, index, age, ageIn, gender) {
      // Filter schemes based on age and gender restrictions
      const filteredSchemes = company.schemes.filter((scheme) => {
        // Check if the scheme is age-restricted and falls within the age range
        if (scheme.age_restricted && ageIn === 'years') {
          const [minAge, maxAge] = scheme.age_range.split('-').map(Number);
          if (age < minAge || age > maxAge) {
            return false; // Skip this scheme if age is not within the range
          }
        }


        // Check if the scheme is gender-restricted and matches the customer's gender
        if (scheme.gender_restricted && scheme.gender !== gender) {
          return false; // Skip this scheme if gender doesn't match
        }
        return true;
      });

      // Set the filtered schemes to insuranceSchemes array
      this.$set(this.insuranceSchemes, index, filteredSchemes);
    },

    selectSpecificSchemes(scheme) {
      // Open a modal with 3 large buttons when a scheme is selected
      // this.showSchemeModal = true;
      this.selectedScheme = scheme;
    },



    async saveCustomer() {
      if (this.formLoader) return;
      this.formLoader = true;

      // If flagged as corporate, create/update the corporate account record
      if (this.isCorporate) {
        try {
          const payload = {
            kra_pin_certificate: this.corporate.kra_pin_certificate || null,
            procurement_officer: {
              name: this.corporate.procurement_officer_name || null,
              phone: this.corporate.procurement_officer_phone || null,
              email: this.corporate.procurement_officer_email || null,
            },
            credit_days: Number(this.corporate.credit_days || 0),
            credit_limit: Number(this.corporate.credit_limit || 0),
            company_name: this.companyName || null,

          };
          await window.axios.post('/api/reception/corporate-accounts', payload);
        } catch (e) {
          console.warn('Failed to create corporate account', e);
        }
      }

      try {
        const response = await this.customer.save();
        if (response) {
          this.customer_id = response.customer_id ? response.customer_id : this.customer_id;
          if (this.screen) {
            this.redirectToScreened();
          }
        }
      } catch (e) {
        console.error('Failed to save customer', e);
      } finally {
        this.formLoader = false;
      }
    },


    redirectToScreened() {
      window.open('/reception/screened-patients?screened=1', '_self');
    },

    async saveAndCheckin() {
      if (this.formLoader) return;
      this.formLoader = true;
      try {
        const response = await this.customer.save();
        if (response) {
          this.checkinPatient();
        }
      } catch (e) {
        console.error('Failed to save and checkin', e);
      } finally {
        this.formLoader = false;
      }
    },

    async updateCustomer() {
      if (this.formLoader) return;
      this.formLoader = true;
      try {
        const response = await this.customer.update();

        if (response) {
          // After patient update, ensure corporate account is created/updated as needed
          try {
            // Build payload same as saveCustomer
            const payload = {
              patient_id: this.patient_id || (response && response.customer_id) || this.customer.customer_id,
              kra_pin_certificate: this.corporate.kra_pin_certificate || null,
              procurement_officer: {
                name: this.corporate.procurement_officer_name || null,
                phone: this.corporate.procurement_officer_phone || null,
                email: this.corporate.procurement_officer_email || null,
              },
              credit_days: Number(this.corporate.credit_days || 0),
              credit_limit: Number(this.corporate.credit_limit || 0),
              profile: {
                first_name: this.customer.profile.first_name,
                middle_name: this.customer.profile.middle_name,
                last_name: this.customer.profile.last_name,
                mobile: this.customer.profile.mobile || this.customer.profile.alt_number,
                kra_pin_number: this.customer.profile.kra_pin_number || null,
                sex: this.customer.profile.sex
              }
            };

            // If editing and we have a corporate_account id, PATCH; otherwise POST (create/upsert)
            const corpId = this.customer.profile.corporate_account_id || (this.profile && this.profile.corporate_account && this.profile.corporate_account.id) || null;
            if (this.isCorporate) {
              if (corpId) {
                await window.axios.patch(`/api/reception/corporate-accounts/${corpId}`, payload);
              } else {
                await window.axios.post('/api/reception/corporate-accounts', payload);
              }
            } else {
              // if user turned off corporate on edit, optionally delete corporate account
              // (not removing here to avoid accidental deletes; implement if desired)
            }
          } catch (e) {
            console.warn('Failed to create/update corporate account', e);
          }

          this.screen ? this.redirectToScreened() : null;
        }
      } catch (e) {
        console.error('Failed to update customer', e);
      } finally {
        this.formLoader = false;
      }
    },

    checkinPatient() {
      window.location = route('reception.customer.visits.create', this.customer.customer_id);
    },

    async fetchCountries() {
      if (this.screen) {
        this.customer.profile.nationality = 'Kenya';
      }

      const response = await fetch('https://restcountries.eu/rest/v2/all?fields=name;capital');

      if (response) {
        this.countries = await response.json();
      }
    },

    setSubCounties({ params }) {
      try {
        // Extract the selected county code from the params
        const selectedCountyCode = params.county_code;

        // Find the entry for the selected county code in the subCountiesJson
        const subCountiesEntries = subCountiesJson.filter((entry) => entry.county_code === selectedCountyCode);


        // Extract sub-counties array if the entries exist
        // Set the sub-counties in your data property (assuming `getSubCounties` is a data property)
        this.getSubCounties = subCountiesEntries.map((entry) => {
          return {
            value: entry.name, // Assuming 'name' is the property containing sub-county name
            text: entry.name, // Display the sub-county name in the dropdown
          };
        });
      } catch (error) {
        // Handle errors, if any
        console.error('Error setting sub-counties', error);
      }
    },
    fetchSubCounties() {
      // Find the entry for the selected county in countiesJson
      const selectedCounty = this.customer.profile.resident_county;
      const countyEntry = countiesJson.find((entry) => entry.name === selectedCounty);

      if (!countyEntry) {
        console.error('County entry not found for:', selectedCounty);
        return;
      }

      // Extract the county code
      const countyCode = countyEntry.code;

      this.setSubCounties({
        params: {
          county_code: countyCode,
        },
      });
    },

    initializePage() {
      this.setInsurances();

      this.options.config([
        'relationship', 'age_in', 'covid_symptoms',
      ]);

      if (this.profile) {
        this.customer.populate(this.profile);
      }

      this.checkin = false;

      if (this.screen) {
        this.customer.profile.resident_county = 'Kisii';

        this.fetchSubCounties();
      }

      this.fetchCountries();
      this.fetchAllCustomers();

      // this.setCounties();
    },
  },

  mounted() {
    // populate corporate fields when editing
    if (this.profile) {
      this.loadCorporateFromProfile(this.profile);
    }

    this.screen ? this.customer.screening = 1 : 0;
    this.initializePage();
    this.counties = countiesJson.map((county) => county.name); // disable browser cached autocompletes
    this.dob_selection = 'dob'; // Set dob_selection to 'dob' to check the radio button
    this.fetchRegistrationFormSettings();
    this.fetchAllCustomers();
  },
};
</script>

<style lang="scss">
/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active {
  transition: all .5s ease;
}
.slide-fade-leave-active {
  transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
  /* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateY(15px);
  opacity: 0;
}

.v-text-field__details {
  padding: 0 0 5px 0 !important;

  .theme--light.v-messages{
    color: #e74c3c !important;
  }
}
</style>
