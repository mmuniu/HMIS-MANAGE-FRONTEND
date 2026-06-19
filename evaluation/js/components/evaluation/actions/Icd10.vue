<template>
  <v-row >
    <v-col class="pb-2" cols="12" >
      <v-autocomplete clearable hide-details solo flat return-object large prepend-inner-icon="search"
                      single-line placeholder="Search for a icd11 diagnosis"
                      :items="icd10.search.results" item-text="name"
                      :no-filter="true"
                      item-value="id"  v-model="icd10.variation" label="ICD11 Condition"
                      :loading="searching"
                      :search-input.sync="icd10.search.term"
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
        <v-chip  :key="index" close color="teal" text-color="white"
                 class="mx-1"  @click:close="remove(variation)">
          {{variation.variation.code}} {{variation.variation.name}}
        </v-chip>
      </template>
    </v-col>
  </v-row>
</template>

<script>
import Icd10 from '@evaluation/libs/icd10/Icd10';
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'Icd10',

  props: {
    visitId: {
      default: null,
      type: String,
    },
  },

  data() {
    return {
      icd10: new Icd10(),
    };
  },

  computed: {
    term() {
      return this.icd10.search.term;
    },

    variation() {
      return this.icd10.variation;
    },

    searching() {
      return this.icd10.search.loading;
    },

    variations() {
      return this.getNote().data;
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
        this.updatePatientConditions(value);
        this.variations.push(this.icd10Transformer(value));
        this.icd10.search.results = [];
        this.icd10.variation = null;
      }
    },
  },
  methods: {
    ...mapActions([
      'setNote',
    ]),

    icd10Transformer(value) {
      const data = {
        variation: { name: value.name, code: value.code },
      };
      return data;
    },

    ...mapGetters([
      'getNote',
    ]),

    showVariation() {
      // let isVariationShowed = (this.variations.length > 0);
      // if(!isVariationShowed)
      //     window.$emit("isIcd10Set");
      return (this.variations.length > 0);
    },

    remove(variation) {
      this.icd10.deletePatientId10Condition(variation, this.visitId);
      this.variations.splice(this.variations.indexOf(variation), 1);
      this.icd10.variation = null;
    },

    updatePatientConditions(variation) {

      this.icd10.insertPatientId10Condition(variation, this.visitId);

    },

    searchByCode: _.debounce(function search(search) {
      this.icd10.searchByCode();
    }, 700),

    searchByName: _.debounce(function search(search) {
      this.icd10.searchByName();
    }, 700),

    resetSearch: _.debounce(function search(search) {
      this.icd10.search.reset();
    }, 700),

  },

  mounted() {
    const noteIcd10Value = this.getNote();
    this.setNote({
      params: {
        visit_id: this.visitId,
      },
    });
  },

};
</script>

<style scoped>

</style>
