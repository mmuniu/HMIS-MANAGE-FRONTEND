<template>
  <v-row >
    <v-col class="pb-2" cols="12" >
      <v-autocomplete clearable hide-details solo flat return-object large prepend-inner-icon="search"
                      single-line placeholder="Search for 705 MOH Diagnosis"
                      :items="register_705.search.results" item-text="name"
                      :no-filter="true"
                      item-value="id"  v-model="register_705.variation" label="MOH 705 Condition"
                      :loading="searching"
                      :search-input.sync="register_705.search.term"
                      outline
      >
        <template slot="item" slot-scope="{ item }">
          <v-list-item-avatar color="cyan" size="42"  class="headline font-weight-light white--text">
            <span class="subheading caption"  >{{ item.code }}</span>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="caption" v-text="item.name"></v-list-item-title>
          </v-list-item-content>
        </template>
      </v-autocomplete>
    </v-col>

    <v-col class="pb-1" cols="12" v-if="showVariation" >
      <template v-for="(variation, index) in variations">
        <v-chip   close color="teal" text-color="white"
                 class="mx-1"
                 @click:close="remove(variation)">
          {{variation.variation.code}} {{variation.variation.name}}
        </v-chip>
      </template>
    </v-col>
  </v-row>
</template>



<script>
import Register_705 from '@evaluation/libs/registers/Register_705';
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'Register_705',

  props: {
    visitId: {
      default: null,
      type: String,
    },
  },

  data() {
    return {
      register_705: new Register_705(),
      noteMohValue: null
    };
  },

  computed: {
    term() {
      return this.register_705.search.term;
    },

    variation() {
      return this.register_705.variation;
    },

    searching() {
      return this.register_705.search.loading;
    },

    get705variation(){
      return this.register_705.variation;
    },

    variations() {
      return this.getNoteMoh().data
       ?? {data :{
          variation: { name: 'Cancel and Reselect 705 MOH Option', code: '' },
        }};
    },
  },

  watch: {
    term(value) {
      if (value) {
        if (value.length > 2) {
          if (value.charAt(1) === '-') {
            this.searchByCode();
          } else {
            this.searchByName();
          }
        } else {
          this.resetSearch();
        }
      }
    },

    variation(value) {
      if (value && this.variations ) {
        this.onVariationSelected(value);
        this.updatePatientConditions(value);
        this.variations.push(this.RegisterTransformer(value));
        this.register_705.search.results = [];
        this.register_705.variation = null;
      }
    },
  },
  methods: {
    ...mapActions([
      'setNoteMoh',
      'setStoredVariation',
    ]),

    ...mapGetters([
      'getStoredVariation',
    ]),

    RegisterTransformer(value) {
      const data = {
        variation: { name: value.name, code: value.code },
      };
      return data;
    },

    check_moh_value(){

      fetch('/api/evaluation/get/moh/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') // For CSRF protection
        },
        body: JSON.stringify({ 'visit' : this.$route.params.visitId })
      })
  .then(response => response.json())
  .then(data => {

    console.log(data)
    this.saveLoader = false; // Hide the loader

    this.noteMohValue = data;
    // this.register_705.variation = data;

  })
  .catch(error => {
    this.saveLoader = false; // Hide the loader
    console.error('Error :', error);
  });

},


    ...mapGetters([
      'getNoteMoh',
    ]),

    showVariation() {
      // let isVariationShowed = (this.variations.length > 0);
      // if(!isVariationShowed)
      //     window.$emit("isIcd10Set");
      return (this.variations.length > 0);
    },

    remove(variation) {
      this.register_705.deletePatient705Condition(variation, this.visitId);
      this.variations.splice(this.variations.indexOf(variation), 1);
      this.register_705.variation = null;
    },

    updatePatientConditions(variation) {
      this.register_705.insertPatient705Condition(variation, this.visitId);
    },

    onVariationSelected(value) {
      console.log('Variation selected:', value);
    },

    searchByCode: _.debounce(function search(search) {
      this.register_705.searchByCode();
    }, 700),

    searchByName: _.debounce(function search(search) {
      this.register_705.searchByName();
    }, 700),

    resetSearch: _.debounce(function search(search) {
      this.register_705.search.reset();
    }, 700),

  },

  mounted() {

    const noteMohValue = this.getNoteMoh();

    console.log("noteMohValue")
    console.log(noteMohValue)

    if (this.getStoredVariation()) {
      this.register_705.variation = this.getStoredVariation();
    }

    this.check_moh_value();

    this.setNoteMoh({
      params: {
        visit_id: this.visitId,
      },
    });
  },

};
</script>

<style scoped>

</style>

