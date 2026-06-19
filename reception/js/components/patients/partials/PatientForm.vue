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
                  :items="allPatients"
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
          <v-btn color="primary" @click="submitSmartManual">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- profile information -->
    <v-card class="mb-5">
      <v-card-title>
        <h2 class="text-body-2 ma-0 pa-0">Patient profile information</h2>
      </v-card-title>

      <v-divider class="ma-0"></v-divider>

      <v-card-text>
        <v-row >
          <v-col cols="12" md="4" v-if="visibilitySettings['first_name']">
            <div class="mx-3">
              <v-text-field
                  v-model="patient.profile.first_name"
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

          <v-col cols="12" md="4" v-if="!msetting('reception.remove_middle_name') && visibilitySettings['middle_name']">
            <div class="mx-3">
              <v-text-field v-model="patient.profile.middle_name"
                            outlined>
                <template v-slot:label>
                  <div v-html="getFieldLabel('Middle Name', 'middle_name')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="visibilitySettings['last_name']">
            <div class="mx-3">
              <v-text-field
                  v-model="patient.profile.last_name"
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
                  :return-value.sync="patient.profile.dob"
                  transition="scale-transition"
                  min-width="290px">
                <template v-slot:activator="{ on }">
                  <v-text-field
                      flat outlined clearable
                      v-on="on"
                      v-model="patient.profile.dob"
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



                <v-date-picker v-model="patient.profile.dob" scrollable>
                  <v-spacer></v-spacer>
                  <v-btn flat color="primary" @click="dob = false">Cancel</v-btn>
                  <v-btn flat color="primary" @click="$refs.dob.save(patient.profile.dob)">OK</v-btn>
                </v-date-picker>
              </v-menu>
            </div>

          </v-col>
          <v-col cols="12" md="4" v-if="showAgeChip && visibilitySettings['date_of_birth']">
            <v-chip  color="blue" text-color="white" small>{{ ageChipText }}</v-chip>
            <input  v-if="showAgeChip" type="hidden" v-model="patient.age">
          </v-col>

          <v-col cols="12" md="4" v-if="showSelectAge && visibilitySettings['date_of_birth']">
            <div class="mx-3" >
              <v-text-field  type="number" v-model="patient.age" outlined :readonly="ageReadOnly"
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
                         v-model="patient.age_in" :error="errors.has('age_in')" outlined
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
                  v-model="patient.profile.sex"
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
                  v-model="patient.profile.marital_status"
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
                  v-model="patient.profile.ethnicity"
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
                  v-model="patient.profile.id_no"
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

          <v-col cols="12" md="4" v-if="visibilitySettings['nemis_number']">
            <div class="mx-3">
              <v-text-field
                  v-model="patient.profile.nemis_number"
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
                  v-model="patient.profile.tsc_number"
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
                  v-model="patient.profile.occupation"
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
                  <v-textarea label="Allergies" outlined v-model="patient.allergies" outline></v-textarea>
              </div>
          </v-col>-->
        </v-row>
      </v-card-text>
    </v-card>

    <!-- contact information -->
    <v-card class="mb-5">
      <v-card-title>
        <h2 class="text-body-2 ma-0 pa-0">Patient contact information</h2>
      </v-card-title>

      <v-divider class="ma-0"></v-divider>

      <v-card-text>
        <v-row >
          <v-col cols="12" md="4">
            <div class="mx-3">
              <v-text-field
                  v-model="patient.profile.mobile" outlined
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
                  v-model="patient.profile.alt_number"
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
                             v-model="patient.profile.email"
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
                             v-model="patient.profile.secondary_email"
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
              <v-text-field  v-model="patient.profile.telephone"
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
                  v-model="patient.profile.nationality">
              </v-autocomplete>
              <v-text-field v-else label="Nationality" v-model="patient.profile.nationality"
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
                              v-model="patient.profile.resident_county"
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
                                  v-model="patient.profile.resident_sub_county"
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
              <v-text-field  v-model="patient.profile.resident_village"
                             outlined>
                <template v-slot:label>
                  <div v-html="getFieldLabel('Village/Estate', 'village')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="!msetting('reception.remove_town') && visibilitySettings['town']">
            <div class="mx-3">
              <v-text-field  v-model="patient.profile.town"
                             outlined>
                <template v-slot:label>
                  <div v-html="getFieldLabel('Town', 'town')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="!msetting('reception.remove_home_location') && visibilitySettings['home']">
            <div class="mx-3">
              <v-text-field v-model="patient.profile.home_location"
                            outlined>
                <template v-slot:label>
                  <div v-html="getFieldLabel('Home Location', 'home')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>


          <v-col cols="12" md="4" v-if="!msetting('reception.remove_postal_address') && visibilitySettings['postal_address']">
            <div class="mx-3">
              <v-text-field v-model="patient.profile.address"
                            outlined>
                <template v-slot:label>
                  <div v-html="getFieldLabel('Postal Address', 'postal_address')"></div>
                </template>
              </v-text-field>
            </div>
          </v-col>

          <v-col cols="12" md="4" v-if="!msetting('reception.remove_postal_code') && visibilitySettings['postal_code']">
            <div class="mx-3">
              <v-text-field v-model="patient.profile.post_code"
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
                          v-model="patient.profile.other_details"
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

    <!-- base vitals -->
    <v-card flat v-if="screen" class="mb-5">
      <v-card-title>
        <h2 class="text-body-2 ma-0 pa-0">Patient vitals</h2>
      </v-card-title>

      <v-divider class="ma-0"/>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <div class="mx-3">
              <v-text-field label="Temperature"
                            v-model="patient.vitals.temperature" outlined
              ></v-text-field>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="mx-3">
              <v-text-field label="Visited places"
                            v-model="patient.vitals.visited_places" outlined
              ></v-text-field>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="mx-3">
              <v-combobox
                  outlined label="Symptoms"
                  :items="configurations.covid_symptoms"
                  hint="To enter non-existent symptom, press tab after typing the symptom"
                  persistent-hint
                  item-text="item_name"
                  :return-object="false"
                  item-value="item_name"
                  multiple chips
                  v-model="patient.vitals.symptoms"
              ></v-combobox>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- next of kins  -->
    <v-card class="mb-5">
      <v-card-title>
        <h2 class="text-body-2 ma-0 pa-0">Patient's next of kin information</h2>
      </v-card-title>

      <v-divider class="ma-0"></v-divider>

      <v-card-text>
        <v-row >
          <v-col cols="12">
            <transition-group name="slide-fade">
              <v-row  v-for="(nok, index) in patient.noks.length" :key="index+0" class="my-4 mx-3">

                <v-col cols="12" sm="4">
                  <div  class="mx-2">
                    <reception-patient-search label="Select the patient if already a patient in the system"
                                              v-model="patient.noks[index].nok_system_id">
                    </reception-patient-search>
                  </div>
                </v-col>

                <v-col cols="12">
                  <div class="mx-2">
                    <p class="pink--text">
                      <v-btn small @click.prevent="removeNok(index)" color="pink" icon dark>
                        <v-icon small>delete</v-icon>
                      </v-btn>
                      <span class="subheading mt-3">NOK {{ index + 1 }}</span>
                    </p>
                  </div>
                </v-col>

                <v-col cols="12" sm="4">
                  <div  class="mx-2">
                    <v-text-field label="Next of kin first name"
                                  v-model="patient.noks[index].first_name"
                    ></v-text-field>
                  </div>
                </v-col>

                <v-col cols="12" sm="4">
                  <div  class="mx-2">
                    <v-text-field label="Next of kin middle name"
                                  v-model="patient.noks[index].middle_name"
                    ></v-text-field>
                  </div>
                </v-col>

                <v-col cols="12" sm="4">
                  <div  class="mx-2">
                    <v-text-field label="Next of kin last name"
                                  v-model="patient.noks[index].last_name">
                    </v-text-field>
                  </div>
                </v-col>

                <v-col cols="12" sm="4">
                  <div  class="mx-2">
                    <v-text-field label="Next of kin mobile"
                                  v-model="patient.noks[index].mobile"
                    ></v-text-field>
                  </div>
                </v-col>

                <v-col cols="12" sm="4">
                  <div  class="mx-2">
                    <v-autocomplete label="Next of kin relationship"
                                    v-model="patient.noks[index].relationship_id"
                                    v-if="configurations"
                                    item-text="item_name" item-value="id"
                                    :items="configurations.relationship"
                    ></v-autocomplete>
                  </div>
                </v-col>

                <v-col cols="12" sm="4">
                  <div  class="mx-2">
                    <v-text-field label="Next of kin email"
                                  v-model="patient.noks[index].email"
                    ></v-text-field>
                  </div>
                </v-col>
              </v-row>
            </transition-group>

            <!-- Button to add noks -->
            <v-col cols="12">
              <v-btn @click.prevent="addNok()" color="blue" icon dark class="mb-2 mt-3">
                <v-icon>add_circle</v-icon>
              </v-btn>
            </v-col>
            <!-- End of Button -->

          </v-col>

        </v-row>
      </v-card-text>
    </v-card>

    <!-- chief information  -->
    <v-card class="mb-5" v-if="shouldRenderChiefCard">
      <v-card-title>
        <h2 class="text-body-2 ma-0 pa-0">Chief's information</h2>
      </v-card-title>

      <v-divider class="ma-0"></v-divider>

      <v-card-text>
        <v-row >
          <v-col cols="12" >

            <v-col cols="12" sm="4" v-if="visibilitySettings['chief_first_name']">
              <div  class="mx-2">
                <v-text-field
                    v-model="patient.profile.chief_first_name"
                >
                  <template v-slot:label>
                    <div v-html="getFieldLabel('Chief\'s first name', 'chief_first_name')"></div>
                  </template>
                </v-text-field>
              </div>
            </v-col>

            <v-col cols="12" sm="4" v-if="visibilitySettings['chief_middle_name']">
              <div  class="mx-2">
                <v-text-field
                    v-model="patient.profile.chief_middle_name"
                >
                  <template v-slot:label>
                    <div v-html="getFieldLabel('Chief\'s middle name', 'chief_middle_name')"></div>
                  </template>
                </v-text-field>
              </div>
            </v-col>

            <v-col cols="12" sm="4" v-if="visibilitySettings['chief_last_name']">
              <div  class="mx-2">
                <v-text-field
                    v-model="patient.profile.chief_last_name"
                >
                  <template v-slot:label>
                    <div v-html="getFieldLabel('Chief\'s last name', 'chief_last_name')"></div>
                  </template>
                </v-text-field>
              </div>
            </v-col>
            <v-col cols="12" sm="4" v-if="visibilitySettings['chief_area']">
              <div  class="mx-2">
                <v-text-field
                    v-model="patient.profile.chief_area"
                >
                  <template v-slot:label>
                    <div v-html="getFieldLabel('Chief\'s area', 'chief_area')"></div>
                  </template>
                </v-text-field>
              </div>
            </v-col>
            <v-col cols="12" sm="4" v-if="visibilitySettings['chief_mobile_number']">
              <div  class="mx-2">

                <v-text-field
                    v-model="patient.profile.chief_mobile_no"
                >
                  <template v-slot:label>
                    <div v-html="getFieldLabel('Chief\'s mobile number', 'chief_mobile_number')"></div>
                  </template>
                </v-text-field>
              </div>
            </v-col>

          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <!-- patient's dependants  -->
    <v-card class="mb-5" >
      <v-card-title>
        <h2 class="text-body-2 ma-0 pa-0">Patient's dependants</h2>
      </v-card-title>

      <v-divider class="ma-0"></v-divider>

      <v-card-text>
        <v-row>
          <v-col cols="12">
            <div class="text-caption my-2">
              All dependants must be created as patients first and then attached as dependants to other
              existing patients.
            </div>

            <v-row>
              <v-col cols="12" sm="4">
                <div  class="mx-2">
                  <reception-patient-search
                      label="Search and select patient"
                      @patientSelected="dependantSelected"
                  >
                  </reception-patient-search>
                </div>
              </v-col>
            </v-row>
          </v-col>


          <v-divider v-if="patient.dependants.length > 0" class="my-2"></v-divider>

          <v-col cols="12" sm="6"
                 v-for="(dependant, index) in patient.dependants"
                 :key="index"
          >
            <v-row>
              <v-col cols="12" sm="4">
                                <span style="font-size: 14px;" class="font-weight-bold">
                                    {{ dependant.name }}
                                </span> <br/>
                <span class="text-caption"> Age: {{ dependant.age }}</span>
              </v-col>
              <v-col cols="12" sm="6">
                <div  class="mx-2">
                  <v-autocomplete label="Relationship"
                                  v-model="patient.dependants[index].relationship_id"
                                  v-if="configurations"
                                  item-text="item_name" item-value="id"
                                  :items="configurations.relationship"
                  ></v-autocomplete>
                </div>
              </v-col>
              <v-col cols="1">
                <v-btn icon small @click="removeDependant(index)">
                  <v-icon small color="error">
                    close
                  </v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!--insurance information -->
    <v-card class="mb-5">

      <div>
        <v-card-title>
          <h2 class="text-body-2 ma-0 pa-0">Patient finance &amp; insurance details</h2>
        </v-card-title>

        <v-divider class="ma-0"></v-divider>

        <v-card-text>
          <v-col cols="12">
            <div class="mx-3">
              <v-switch label="Patient has insurance" v-model="patient.hasInsurance"></v-switch>
            </div>
          </v-col>

          <v-col cols="12" v-if="patient.hasInsurance">
            <transition-group name="slide-fade">
              <v-row  v-for="(scheme, index) in patient.schemes.length" :key="index+0" class="my-4 mx-3">

                <v-col cols="12">
                  <div class="mx-2">
                    <p class="pink--text">
                      <span class="subheading mt-3">Scheme {{ index + 1 }}</span>
                      <v-btn small @click.prevent="removeScheme(index)" color="pink"
                             icon dark v-if="!patient.schemes[index].scheme_name">
                        <v-icon small>delete</v-icon>
                      </v-btn>
                    </p>
                  </div>
                </v-col>

                <v-col cols="12" sm="4">
                  <div v-if="patient.schemes[index].scheme_name">
                    <p class="font-weight-bold text-h6"
                       v-if="editingMode">{{ patient.schemes[index].scheme_name }}</p>
                  </div>

                  <div class="mx-2" v-else>
                    <v-autocomplete :items="insuranceCompanies"
                                    @change="selectSchemes($event, index,patient.age,patient.age_in,patient.profile.sex)"
                                    item-text="name" return-object
                                    v-model="patient.schemes[index].company_id"
                                    label="Insurance Company" outlined
                    ></v-autocomplete>
                  </div>
                </v-col>

                <v-col cols="12" sm="4">
                  <div  class="mx-2" v-if="! patient.schemes[index].scheme_name">
                    <v-autocomplete v-model="patient.schemes[index].scheme_id"
                                    @change="selectSpecificSchemes($event)"
                                    :items="insuranceSchemes[index]"
                                    item-text="full_name" item-value="id"
                                    label="Insurance Schemes" outlined
                    ></v-autocomplete>
                  </div>
                </v-col>

                <v-col cols="12" sm="4">
                  <div  class="mx-2">
                    <v-text-field v-model="patient.schemes[index].policy_number"
                                  label="Policy Number" outlined
                    ></v-text-field>
                  </div>
                </v-col>

                <v-col cols="12" sm="4">
                  <div class="mx-2">
                    <v-text-field v-model="patient.schemes[index].principal"
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
                        :return-value.sync="patient.schemes[index].dob"
                    >

                      <template v-slot:activator="{ on }">
                        <v-text-field
                            v-on="on"
                            label="Date of Birth"
                            v-model="patient.schemes[index].dob"
                            readonly outlined
                        ></v-text-field>
                      </template>

                      <v-date-picker v-model="patient.schemes[index].dob" no-title scrollable @change="calculateAge">
                        <v-spacer></v-spacer>
                        <v-btn flat color="primary"
                               @click="patient.schemes[index].menu = false">
                          Cancel
                        </v-btn>
                        <v-btn flat color="primary" @click="pickDate(index)">OK</v-btn>
                      </v-date-picker>
                    </v-menu>
                  </div>
                </v-col>


                <v-col cols="12" sm="4">
                  <div class="mx-2">
                    <v-select v-model="patient.schemes[index].relationship_id"
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
                               @click="savePatient()">
                            {{ !screen ? 'Save patient' : 'Save' }}
                        </v-btn>
                    </span>

          <span v-if="!patient_id">
                        <v-btn v-if="!profile" type="submit" class="green lighten-1" color="blue" large
                               :dark="!formLoader" :loading="formLoader" :disabled="formLoader"
                               @click="saveAndCheckin()">
                            Save and checkin
                        </v-btn>
                    </span>

          <v-btn v-if="profile " type="submit" class="blue lighten-1" color="blue" large
                 :dark="!formLoader" :loading="formLoader" :disabled="formLoader"
                 @click="updatePatient()">
            {{ !screen ? 'Update patient' : 'Update' }}
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
import Patient from '@reception/libs/patients/Patient';
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
      patient: new Patient(),
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
      smartManualInput1: null,
      smartManualInput2: null,
      smartManualAutocompleteItems1: [],
      smartManualAutocompleteItems2: [],
      allPatients: [],
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
      return !!this.patient.profile.dob; // Check if dob is filled
    },

    ageConflict() {
      return this.patient.profile.dob && this.patient.age;
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
      return this.patient.form.errors;
    },

    submitted() {
      return this.patient.form.submitted;
    },

    contaminated() {
      return this.patient.form.errorDetected;
    },

    populated() {
      return this.patient.populated;
    },
  },

  watch: {


    getInsurances({ companies }) {
      return this.insuranceCompanies = companies;
    },


    'patient.profile.dob'(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.calculateAge();
      }
    },

    contaminated(value) {
      if (value) {
        this.formLoader = false;

        this.patient.form.errorDetected = false;
      }
    },

    submitted(value) {
      if (value) {
        this.formLoader = false;
        this.checkin = true;

        this.patient.form.submitted = false;
      }
    },
  },

  methods: {
    ...mapActions([
      'setInsurances', 'setCounties',
    ]),

    async fetchAllPatients() {
      console.log("response here issss")
      try {
        const response = await fetch('/api/reception/patients/');
        console.log("response here issss")
        console.log(response)
        // const response = await fetch('/api/reception/all/patients/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Map data to objects with label and value properties
        this.allPatients = data.map(patient => ({
          label: patient.first_name,
          value: patient.id,
        }));

        // this.allPatients = this.allPatients;
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

    smartManual() {
      //this.showSmartManualModal = true;
    },


    onDobInput(value) {
      if (!value) {
        this.patient.age = null;
        // Clear the error related to dob if necessary
        this.errors.clear('profile.dob');
      }
    },
    async fetchRegistrationFormSettings() {
      this.loader = true;
      try {
        // Fetch the settings from the backend
        const response = await this.registration.fetchSettings();
        const visibilitySettings = {};
        const mandatorySettings = {};

        // Iterate over each setting in the response array
        response.forEach((setting) => {
          visibilitySettings[setting.field_name] = setting.is_visible === 1;
          mandatorySettings[setting.field_name] = setting.is_mandatory === 1;
        });
        this.visibilitySettings = visibilitySettings;
        this.mandatorySettings = mandatorySettings;
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        this.loader = false;
      }
    },
    calculateAge() {
      if (this.patient.profile.dob) {
        const dob = new Date(this.patient.profile.dob);
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
          this.patient.age = ageInDays; // Retain the age as days
          this.ageChipText = ageInDays + ' day(s)';
        } else if (ageInDays <= 540) { // 18 months = 18 * 30 days
          this.patient.age = ageInMonths; // Retain the age as months
          this.ageChipText = ageInMonths + ' month(s)';
        } else {
          // Calculate the remaining months after subtracting full years
          const remainingMonths = ageInMonths - (ageInYears * 12);
          this.patient.age = ageInYears; // Retain the age as years
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

    dependantSelected(patient) {
      const data = {
        name: patient.full_name,
        relationship_id: null,
        age: patient.age_friendly,
        id: patient.id,
      };

      if (this.patient.dependants.length >= this.msetting('reception.number_of_dependants')) {
        flash({
          message: 'This patient has reached the maximum number of dependants',
          alert: 'warning',
        });
      } else {
        if (this.patient.dependants.some((obj) => obj.id === data.id)) {
          flash({
            message: 'Already selected',
            alert: 'warning',
          });
        } else {
          this.patient.dependants.push(data);
        }
      }
    },

    removeDependant(index) {
      this.patient.dependants.splice(index, 1);
    },

    pickDate(index) {
      const reference = `reference${index}`;
      this.$refs[reference][0].save(this.patient.schemes[index].dob);
    },

    dateMenu(index) {
      return this.patient.schemes[index].menu;
    },

    addScheme() {
      this.patient.schemes.push(
          this.patient.schemeTemplate(),
      );
    },

    addNok() {
      this.patient.noks.push(
          this.patient.nokTemplate(),
      );
    },

    removeScheme(index) {
      this.insuranceSchemes.splice(index, 1);
      this.patient.schemes.splice(index, 1);
    },

    removeNok(index) {
      this.patient.noks.splice(index, 1);
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


        // Check if the scheme is gender-restricted and matches the patient's gender
        return !(scheme.gender_restricted && scheme.gender !== gender);

      });

      // Set the filtered schemes to insuranceSchemes array
      this.$set(this.insuranceSchemes, index, filteredSchemes);
    },

    selectSpecificSchemes(scheme) {
      // Open a modal with 3 large buttons when a scheme is selected
      // this.showSchemeModal = true;
      this.selectedScheme = scheme;
    },


    async savePatient() {
      this.formLoader = true;

      const response = await this.patient.save();

      this.patient_id = response.patient_id;

      if (response) {
        this.screen ? this.redirectToScreened() : null;
      }
    },

    redirectToScreened() {
      window.open('/reception/screened-patients?screened=1', '_self');
    },

    async saveAndCheckin() {
      const response = await this.patient.save();

      if (response) {
        this.checkinPatient();
      }
    },

    async updatePatient() {
      this.formLoader = true;
      const response = await this.patient.update();

      if (response) {
        this.formLoader = false;

        this.screen ? this.redirectToScreened() : null;
      }
    },

    checkinPatient() {
      window.location = route('reception.patient.visits.create', this.patient.patient_id);
    },

    async fetchCountries() {
      if (this.screen) {
        this.patient.profile.nationality = 'Kenya';
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
      const selectedCounty = this.patient.profile.resident_county;
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
        this.patient.populate(this.profile);
      }

      this.checkin = false;

      if (this.screen) {
        this.patient.profile.resident_county = 'Kisii';

        this.fetchSubCounties();
      }

      this.fetchCountries();
      this.fetchAllPatients();

      // this.setCounties();
    },
  },

  mounted() {
    this.screen ? this.patient.screening = 1 : 0;
    this.initializePage();
    this.counties = countiesJson.map((county) => county.name); // disable browser cached autocompletes
    this.dob_selection = 'dob'; // Set dob_selection to 'dob' to check the radio button
    this.fetchRegistrationFormSettings();
    this.fetchAllPatients();
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

