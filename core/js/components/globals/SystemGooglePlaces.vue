
<!--style="width: 100%;
                            margin: 18px 10px; border: none; border-bottom: 1px solid grey; "-->
<template>
  <div>
    <gmap-autocomplete class="introInput form-control"
                       @place_changed="setPlace"
                       :placeholder="label"
                       style="width: 100%; padding: 25px; margin: 1px 1px;"
                       v-bind:style=" outlined ? 'border-bottom: 1px solid grey; border-radius: 5px;' : 'border: none; border-bottom: 1px solid grey;'"
                       :options="options"
    >
      <div v-if="mandatory && visible" class="custom-placeholder">
        <span style="color: red">*</span>
      </div>
    </gmap-autocomplete>

  </div>
</template>
<script>

export default {
  props: {
    country: {
      type: String,
      default: 'ke',
    },
    label: {
      type: String,
      default: '',
    },
    outlined: {
      type: Boolean,
    },
    visibilitySettings: {
      type: Object,
      default: () => ({}),
    },
    mandatorySettings: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    options: {},
    lined: '',
    outline: '',
  }),
  computed: {
    computedLabel() {
      if (this.visibilitySettings.home && this.mandatorySettings.home) {
        return `${this.label} <span style="color: red">*</span>`;
      } else {
        return this.label;
      }
    },
    mandatory() {
      return this.visibilitySettings.home && this.mandatorySettings.home;
    },
    visible() {
      return this.visibilitySettings.home;
    },
    parsedLabel() {
      return this.computedLabel ? `<div>${this.computedLabel}</div>` : '';
    },
  },

  methods: {
    setPlace(val) {
      const data = {
        name: val.formatted_address,
        lat: val.geometry.location.lat(),
        long: val.geometry.location.lng(),
      };
      this.$emit('input', data);
    },
  },

  created() {
    this.options = {
      componentRestrictions: {
        country: this.country,
      },
    };
  },
};
</script>

