<template>
  <v-card flat style="padding: 0; margin: 0">
    <form @submit.prevent="!organizationData ? saveOrganization() : updateOrganization()">
      <v-container fluid >


        <!-- present already stored information-->
        <v-row  v-if="organizationInfo">
          <v-col class="pl-5" cols="12" md="6" >
            <img :src="'/' + organizationLogo" style="width: 400px; height: 200px" alt="organization-logo"/>
          </v-col>
          <v-col cols="12" md="6" class="text-right pr-5" >
            <span class="font-weight-black headline">{{ organizationInfo.name }}</span> <br/>
            <span class="font-weight-black subheading">P.O. Box {{ organizationInfo.postal_address }}</span> <br/>
            <span class="font-weight-black subheading">{{ organizationInfo.street }}, {{ organizationInfo.building }}, {{ organizationInfo.office_number }}</span> <br/>
            <span class="font-weight-black subheading">{{ organizationInfo.town }}, {{ organizationInfo.country }}</span> <br/>

            <br/>

            <span class="font-weight-black grey--text body-1">{{ organizationInfo.email }}</span> <br/>
            <span class="font-weight-black grey--text body-1">{{ organizationInfo.telephone }} / {{ organizationInfo.mobile }}</span> <br/>
          </v-col>
        </v-row>

        <v-divider></v-divider>

        <v-row >
          <!-- main contact information-->
          <v-col md="6" cols="12">
            <v-col class="pr-4" cols="12" >
              <div class="mx-3">
                <v-text-field label="Organization name" v-model="organization.name" required outline></v-text-field>
              </div>
            </v-col>
            <v-col class="pr-4" cols="12" >
              <div class="mx-3">
                <v-text-field label="Postal Address" v-model="organization.postal_address" required outline></v-text-field>
              </div>
            </v-col>
            <v-col class="pr-4" cols="12" >
              <div class="mx-3">
                <v-text-field label="Telephone" v-model="organization.telephone" required outline></v-text-field>
              </div>
            </v-col>
            <v-col class="pr-4" cols="12" >
              <div class="mx-3">
                <v-text-field label="Mobile" v-model="organization.mobile" required outline></v-text-field>
              </div>
            </v-col>
            <v-col class="pr-4" cols="12" >
              <div class="mx-3">
                <v-text-field label="Email Address" type="email" v-model="organization.email" required outline></v-text-field>
              </div>
            </v-col>
            <v-col class="pr-4" cols="12" >
              <div class="mx-3">
                <v-text-field label="Fax" v-model="organization.fax" required outline></v-text-field>
              </div>
            </v-col>
            <v-col class="pr-4" cols="12" >
              <div class="mx-3">
                <input type="file" id="file" ref="file" v-on:change="onChangeFileUpload()"/>
              </div>
            </v-col>
          </v-col>
          <!-- other information-->
          <v-col md="6" cols="12">
            <v-col class="pr-4" cols="12" >
              <div class="mx-3">
                <v-text-field label="Country" v-model="organization.country" required outline></v-text-field>
              </div>
            </v-col>
            <v-col class="pr-4" cols="12" >
              <div class="mx-3">
                <v-text-field label="City/Town" v-model="organization.town" required outline></v-text-field>
              </div>
            </v-col>
            <v-col class="pr-4" cols="12" >
              <div class="mx-3">
                <v-text-field label="Street" v-model="organization.street" required outline></v-text-field>
              </div>
            </v-col>
            <v-col class="pr-4" cols="12" >
              <div class="mx-3">
                <v-text-field label="Building" v-model="organization.building" required outline></v-text-field>
              </div>
            </v-col>
            <v-col class="pr-4" cols="12" >
              <div class="mx-3">
                <v-text-field label="Office number" v-model="organization.office_number" required outline></v-text-field>
              </div>
            </v-col>
            <v-col class="pr-4" cols="12" >
              <div class="mx-3">
                <v-text-field label="Pin" v-model="organization.pin" required outline></v-text-field>
              </div>
            </v-col>
            <v-col class="pr-4" cols="12" >
              <div class="mx-3">
                <v-checkbox label="Use logo as letterhead instead" v-model="organization.is_letterhead"></v-checkbox>
              </div>
            </v-col>
            <v-col cols="12"  class="text-right pr-4">
              <v-btn v-if="!organizationData" type="submit" class="blue lighten-1" color="blue" large
                     :dark="!loader" :loading="loader" :disabled="loader">
                Save
              </v-btn>

              <v-btn v-else type="submit" class="blue lighten-1" color="blue" large
                     :dark="!loader" :loading="loader" :disabled="loader">
                update
              </v-btn>
            </v-col>
          </v-col>
        </v-row>
      </v-container>
    </form>
  </v-card>
</template>
<script>
import Organization from '@settings/libs/organiztion/Organization';

export default {
  props: [
    'organizationData',
    'organizationLogo',
  ],

  data: () => ({
    loader: false,
    organization: new Organization(),
    found_logo: false,
  }),

  computed: {
    organizationInfo() {
      if (this.organizationData) {
        return JSON.parse(this.organizationData);
      } else {
        return null;
      }
    },
  },

  methods: {
    saveOrganization() {
      this.organization.save();
    },

    updateOrganization() {
      this.organization.update();
    },

    onChangeFileUpload() {
      this.organization.logo = this.$refs.file.files[0];
    },
  },

  mounted() {
    if (this.organizationData) {
      if (this.organizationInfo.logo) {
        this.found_logo = true;
      }

      this.organization.assemble(this.organizationInfo);
    }
  },
};
</script>
