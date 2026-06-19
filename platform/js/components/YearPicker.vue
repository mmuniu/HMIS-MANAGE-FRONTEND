<template>
  <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y max-width="290px">
    <template v-slot:activator="{ on }">
      <v-text-field :value="displayValue" label="Select Year" readonly outlined v-on="on"></v-text-field>
    </template>

    <v-card>
      <v-card-title class="headline">
        {{ currentDecadeRange }}
      </v-card-title>

      <v-card-actions>
        <v-btn text @click="handlePreviousDecade">
          <v-icon>chevron_left</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn text @click="handleNextDecade">
          <v-icon>chevron_right</v-icon>
        </v-btn>
      </v-card-actions>

      <v-card-text>
        <v-container grid-list-md pa-0>
          <v-layout wrap>
            <v-flex v-for="year in visibleYears" :key="year" xs3 class="text-xs-center">
              <v-btn text :color="year === internalValue ? 'primary' : ''" @click="selectYear(year)" class="year-btn">
                {{ year }}
              </v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: null,
    },
    decadeStart: {
      type: Number,
      default: null,
    }
  },

  data() {
    return {
      menu: false,
      internalValue: null,
      localDecadeStart: null,
    };
  },

  computed: {
    displayValue() {
      return this.internalValue ? this.internalValue.toString() : '';
    },

    visibleYears() {
      if (!this.localDecadeStart) return [];
      const years = [];
      for (let i = this.localDecadeStart; i < this.localDecadeStart + 20; i++) {
        years.push(i);
      }
      return years;
    },

    currentDecadeRange() {
      return this.localDecadeStart ? `${this.localDecadeStart} - ${this.localDecadeStart + 19}` : '';
    }
  },

  mounted() {
    const currentYear = new Date().getFullYear();
    this.internalValue = this.value !== null ? this.value : currentYear;
    this.localDecadeStart = this.decadeStart !== null 
      ? this.decadeStart 
      : Math.floor(this.internalValue / 10) * 10 - 10;
    
    if (this.value === null) {
      this.$emit('input', this.internalValue);
      console.log('YearPicker: Emitting default year', this.internalValue);
    }
  },

  methods: {
    selectYear(year) {
      this.internalValue = year;
      this.menu = false;
      this.$emit('input', year);
    },

    handlePreviousDecade() {
      this.localDecadeStart -= 10;
      this.$emit('update:decadeStart', this.localDecadeStart);
    },

    handleNextDecade() {
      this.localDecadeStart += 10;
      this.$emit('update:decadeStart', this.localDecadeStart);
    }
  },

  watch: {
    value(newVal) {
      if (newVal !== null && newVal !== this.internalValue) {
        this.internalValue = newVal;
        if (newVal < this.localDecadeStart || newVal >= this.localDecadeStart + 20) {
          this.localDecadeStart = Math.floor(newVal / 10) * 10 - 10;
          this.$emit('update:decadeStart', this.localDecadeStart);
        }
      }
    },
    
    decadeStart(newVal) {
      if (newVal !== null && newVal !== this.localDecadeStart) {
        this.localDecadeStart = newVal;
      }
    }
  }
};
</script>

<style scoped>
.year-btn {
  min-width: 0;
  width: 100%;
  margin: 0;
  padding: 0;
  height: 36px;
}

.headline {
  justify-content: center;
  padding-bottom: 0;
}
</style>