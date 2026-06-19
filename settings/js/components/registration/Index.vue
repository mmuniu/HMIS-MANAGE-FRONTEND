<template>
  <v-container fluid>
    <label>Patient profile information</label>

    <v-row>
      <v-col v-for="(field, index) in fields" :key="index" class="pr-4" cols="12" md="3">
        <div class="mx-3">
          <div class="field-group">
            <label class="mandatory-registration-labels">{{ field.label }}</label>
            <div class="checkbox-group">
              <v-checkbox
                  :id="getFieldId(field.name, 'visible')"
                  :name="getFieldName(field.name, 'visible')"
                  type="checkbox"
                  class="flat-blue"
                  label="Visible"
                  @change="updateVisibility(field.name)"
                  v-model="visibilitySettings[field.name]"
              ></v-checkbox>
            </div>
            <div class="checkbox-group">
              <v-checkbox
                  :id="getFieldId(field.name, 'mandatory')"
                  :name="getFieldName(field.name, 'mandatory')"
                  type="checkbox"
                  class="flat-blue"
                  label="Mandatory"
                  v-if="isVisible(field.name)"
                  v-model="mandatorySettings[field.name]"
              ></v-checkbox>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
    <label>Patient contact information</label>

    <v-row>
      <v-col v-for="(field, index) in contact_fields" :key="index" class="pr-4" cols="12" md="3">
        <div class="mx-3">
          <div class="field-group">
            <label class="mandatory-registration-labels">{{ field.label }}</label>
            <div class="checkbox-group">
              <v-checkbox
                  :id="getFieldId(field.name, 'visible')"
                  :name="getFieldName(field.name, 'visible')"
                  type="checkbox"
                  class="flat-blue"
                  label="Visible"
                  @change="updateVisibility(field.name)"
                  v-model="visibilitySettings[field.name]"
              ></v-checkbox>
            </div>
            <div class="checkbox-group">
              <v-checkbox
                  :id="getFieldId(field.name, 'mandatory')"
                  :name="getFieldName(field.name, 'mandatory')"
                  type="checkbox"
                  class="flat-blue"
                  label="Mandatory"
                  v-if="isVisible(field.name)"
                  v-model="mandatorySettings[field.name]"
              ></v-checkbox>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
    <label>Chief's information</label>

    <v-row>
      <v-col v-for="(field, index) in chief_information" :key="index" class="pr-4" cols="12" md="3">
        <div class="mx-3">
          <div class="field-group">
            <label class="mandatory-registration-labels">{{ field.label }}</label>
            <div class="checkbox-group">
              <v-checkbox
                  :id="getFieldId(field.name, 'visible')"
                  :name="getFieldName(field.name, 'visible')"
                  type="checkbox"
                  class="flat-blue"
                  label="Visible"
                  @change="updateVisibility(field.name)"
                  v-model="visibilitySettings[field.name]"
              ></v-checkbox>
            </div>
            <div class="checkbox-group">
              <v-checkbox
                  :id="getFieldId(field.name, 'mandatory')"
                  :name="getFieldName(field.name, 'mandatory')"
                  type="checkbox"
                  class="flat-blue"
                  label="Mandatory"
                  v-if="isVisible(field.name)"
                  v-model="mandatorySettings[field.name]"
              ></v-checkbox>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-btn color="primary" @click="submitForm">Submit</v-btn>

  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Registration from '@settings/libs/registration/Registration';

export default {
  data() {
    return {
      departmentData: null,
      loader: false,
      search: '',
      registration: new Registration(),
      fields: [
        { name: 'first_name', label: 'First Name' },
        { name: 'middle_name', label: 'Middle Name' },
        { name: 'last_name', label: 'Last Name' },
        { name: 'date_of_birth', label: 'Date of Birth' },
        { name: 'gender', label: 'Gender' },
        { name: 'marital_status', label: 'Marital Status' },
        { name: 'ethnicity', label: 'Ethnicity' },
        { name: 'id_number', label: 'ID Number' },
        { name: 'tsc_number', label: 'TSC Number' },
        { name: 'nemis_number', label: 'Nemis Number' },
      ],
      contact_fields: [
        { name: 'mobile', label: 'Mobile' },
        { name: 'secondary_number', label: 'Secondary Number' },
        { name: 'email_address', label: 'Email Address' },
        { name: 'secondary_email_address', label: 'Secondary Email Address' },
        { name: 'telephone', label: 'Telephone' },
        { name: 'nationality', label: 'Nationality' },
        { name: 'county_of_residence', label: 'County of residence' },
        { name: 'sub_county_of_residence', label: 'Sub county of residence' },
        { name: 'village', label: 'Resident Village' },
        { name: 'town', label: 'Town' },
        { name: 'home', label: 'Home' },
        { name: 'postal_code', label: 'Postal code' },
        { name: 'postal_address', label: 'Postal address' },
        { name: 'other_details', label: 'Other details' },
      ],
      chief_information: [
        { name: 'chief_first_name', label: 'Chief first name' },
        { name: 'chief_middle_name', label: 'Chief middle name' },
        { name: 'chief_last_name', label: 'Chief last name' },
        { name: 'chief_area', label: 'Chief area' },
        { name: 'chief_mobile_number', label: 'Chief mobile number' },
      ],
      visibilitySettings: {
        'first_name': false,
        'middle_name': false,
        'last_name': false,
        'date_of_birth': false,
        'gender': false,
        'marital_status': false,
        'ethnicity': false,
        'id_number': false,
        'nemis_number': false,
      },
      mandatorySettings: {}, // Initialize mandatorySettings
    };
  },

  computed: {

  },

  methods: {

    getFieldId(fieldName, type) {
      return `${fieldName}_${type}`;
    },
    getFieldName(fieldName, type) {
      return `${fieldName}_${type}`;
    },
    isVisible(fieldName) {
      return this.visibilitySettings[fieldName] || false;
    },
    isMandatory(fieldName) {
      return this.mandatorySettings[fieldName] || false;
    },

    updateVisibility(fieldName) {
      // console.log("updating visibility")

      // Reset mandatory setting if visibility is unchecked
      if (!this.visibilitySettings[fieldName]) {
        this.$set(this.mandatorySettings, fieldName, false);
      }
    },
    updateMandatory(fieldName) {
      // Make field visible if it's set to mandatory
      if (this.mandatorySettings[fieldName]) {
        this.$set(this.visibilitySettings, fieldName, true);
      }
    },
    submitForm() {
      // Collect all form data here
      const formData = {
        visibilitySettings: this.visibilitySettings,
        mandatorySettings: this.mandatorySettings,
      };

      // Call saveRegistration method with form data
      this.saveRegistration(formData);
    },

    async fetchSettings() {
      this.loader = true;
      try {
        // Fetch the settings from the backend
        const response = await this.registration.fetchSettings();
        // Initialize visibilitySettings and mandatorySettings objects
        const visibilitySettings = {};
        const mandatorySettings = {};

        // Iterate over each setting in the response array
        response.forEach((setting) => {
          // Assign the setting's visibility and mandatory values to the corresponding objects
          visibilitySettings[setting.field_name] = setting.is_visible === 1;
          mandatorySettings[setting.field_name] = setting.is_mandatory === 1;
        });

        // Update component data with the new settings
        this.visibilitySettings = visibilitySettings;
        this.mandatorySettings = mandatorySettings;
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        this.loader = false;
      }
    },
    saveRegistration(formData) {
      const self = this;
      this.loader = true;

      // Call saveRegistration method with form data
      this.registration.saveRegistration(formData).then((response) => {
        self.loader = false;
        // Optionally, reset form fields after successful submission
        // this.resetForm();
      });
    },

  },
  watch: {
    mandatorySettings: {
      handler(newVal, oldVal) {
        // Iterate over each field in the new settings
        for (const fieldName in newVal) {
          // If the field's mandatory setting has changed, call updateMandatory
          if (!oldVal[fieldName] || newVal[fieldName] !== oldVal[fieldName]) {
            this.updateMandatory(fieldName);
          }
        }
      },
      deep: true, // This makes Vue watch nested properties in the object
    },
    visibilitySettings: {

      handler(newVal, oldVal) {
        for (const fieldName in newVal) {
          // Reset mandatory setting if visibility is unchecked
          if (!newVal[fieldName]) {
            this.$set(this.mandatorySettings, fieldName, false);
          }
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.fetchSettings();
  },
};
</script>

<style>
.field-group {
  margin-bottom: 15px;
}
.field-group label {
  font-weight: bold;
}
.checkbox-group {
  display: flex;
  align-items: center;
  margin-top: 5px;
}
.checkbox-group input[type="checkbox"] {
  margin-right: 10px;
}
.mandatory-registration-labels {
  padding: 5px;
}
</style>
