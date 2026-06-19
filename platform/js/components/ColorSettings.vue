<template>
  <v-card class="mb-4">
    <v-card-title class="headline">
      <v-icon left>fa-palette</v-icon>
      Color Settings
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <v-card outlined>
            <v-card-title class="subtitle-1">
              Navbar Color
            </v-card-title>
            <v-card-text>
              <v-color-picker
                v-model="headerColor"
                hide-inputs
                show-swatches
                swatches-max-height="200"
                @input="updateHeaderColor"
              ></v-color-picker>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card outlined>
            <v-card-title class="subtitle-1">
              Sidebar Color
            </v-card-title>
            <v-card-text>
              <v-color-picker
                v-model="sidebarColor"
                hide-inputs
                show-swatches
                swatches-max-height="200"
                @input="updateSidebarColor"
              ></v-color-picker>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="12">
          <v-card outlined>
            <v-card-title class="subtitle-1">
              Login Page Color
            </v-card-title>
            <v-card-text>
              <v-color-picker
                  v-model="loginPageColor"
                  hide-inputs
                  show-swatches
                  swatches-max-height="200"
                  @input="updateLoginPageColor"
              ></v-color-picker>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row class="mt-4">
        <v-col cols="12">
          <v-alert
            v-if="saveSuccess"
            type="success"
            dismissible
            transition="scale-transition"
          >
            Color settings saved successfully!
          </v-alert>
          <v-btn color="primary" @click="saveSettings" :loading="saving">
            <v-icon left>fa-save</v-icon>
            Save Settings
          </v-btn>
          <v-btn color="secondary" class="ml-2" @click="resetSettings">
            <v-icon left>fa-undo</v-icon>
            Reset to Defaults
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { settingsKey } from '@app/libs/Util';

export default {
  name: 'ColorSettings',
  data() {
    return {
      headerColor: 'blue',
      sidebarColor:  '#222d32',
      loginPageColor: '#222d32',
      saving: false,
      saveSuccess: false
    };
  },
  mounted() {
    this.fetchColorSettings()
  },
  methods: {
    updateHeaderColor(color) {
      this.headerColor = color;
    },
    updateLoginPageColor(color) {
      this.loginPageColor = color;
    },
    updateSidebarColor(color) {
      this.sidebarColor = color;
    },
    saveSettings() {
      this.saving = true;

      // Get current settings from localStorage
      let settings = [];
      if (window.localStorage.hasOwnProperty(settingsKey)) {
        settings = JSON.parse(window.localStorage.getItem(settingsKey));
      }

      // Update or add headerColor setting
      const headerColorIndex = settings.findIndex(s => s.name === 'headerColor');
      if (headerColorIndex >= 0) {
        settings[headerColorIndex].value = this.headerColor;
      } else {
        settings.push({ name: 'headerColor', value: this.headerColor });
      }

      // Update or add sidebarColor setting
      const sidebarColorIndex = settings.findIndex(s => s.name === 'sidebarColor');
      if (sidebarColorIndex >= 0) {
        settings[sidebarColorIndex].value = this.sidebarColor;
      } else {
        settings.push({ name: 'sidebarColor', value: this.sidebarColor });
      }

      // Update or add loginPageColor setting
      const loginPageColorIndex = settings.findIndex(s => s.name === 'loginPageColor');
      if (loginPageColorIndex >= 0) {
        settings[loginPageColorIndex].value = this.loginPageColor;
      } else {
        settings.push({ name: 'loginPageColor', value: this.loginPageColor });
      }

      // Save settings to localStorage
      window.localStorage.setItem(settingsKey, JSON.stringify(settings));

      // Update MSettings
      window.MSettings.updateSettings();

      // Emit event to update settings in the store
      window.events.$emit('UPDATE_SYSTEM_SETTINGS');

      // Save settings to database
      const dbSettings = {
        'core.sidebar_color': this.sidebarColor,
        'core.header_color': this.headerColor,
        'core.login_page_color': this.loginPageColor
      };
      console.log("dbSettings are" )

      console.log(dbSettings)

      axios.post('/settings/settings', dbSettings)
        .then(response => {
          this.saving = false;
          this.saveSuccess = true;

          // Hide success message after 3 seconds
          setTimeout(() => {
            this.saveSuccess = false;
            window.location.reload()
          }, 3000);
        })
        .catch(error => {
          console.error('Error saving settings to database:', error);
          this.saving = false;
          this.saveSuccess = true; // Still show success since localStorage was updated

          // Hide success message after 3 seconds
          setTimeout(() => {
            this.saveSuccess = false;
          }, 3000);
        });
    },

    fetchColorSettings(){
      console.log('settings key')
      console.log(settingsKey)
      // Load saved settings from localStorage if they exist
      if (window.localStorage.hasOwnProperty(settingsKey)) {
        const settings = JSON.parse(window.localStorage.getItem(settingsKey));
        const headerColorSetting = settings.find(s => s.name === 'headerColor');
        const sidebarColorSetting = settings.find(s => s.name === 'sidebarColor');
        const loginPageColorSetting = settings.find(s => s.name === 'loginPageColor');

        if (headerColorSetting) {
          this.headerColor = headerColorSetting.value;
        }

        if (sidebarColorSetting) {
          this.sidebarColor = sidebarColorSetting.value;
        }

        if (loginPageColorSetting) {
          this.loginPageColor = loginPageColorSetting.value;
        }

        return {
          headerColor: this.headerColor,
          sidebarColor: this.sidebarColor,
          loginPageColor: this.loginPageColor
        };
      }else{
        axios.get('/api/settings/fetch-color-settings')
            .then(response => {
              this.headerColor =  response.headerColor
              this.sidebarColor = response.sidebarColor
              this.loginPageColor = response.loginPageColor

            })
            .catch(error => {
              console.error('Error fetching color settings:', error);

            });
      }

      return {
        headerColor: this.headerColor,
        sidebarColor: this.sidebarColor,
        loginPageColor: this.loginPageColor
      };
    },
    resetSettings() {
      this.headerColor = '#4D97F3';
      this.sidebarColor = '#202227';
      this.loginPageColor = '#4F9CE6'
      this.saveSettings();
    }
  }
};
</script>
