<template>
  <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y max-width="290px">
    <template v-slot:activator="{ on }">
      <v-text-field :value="selectedYearMonthDisplay" label="Select Year and Month" readonly outlined v-on="on"></v-text-field>
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
          <!-- Desktop Layout -->
          <v-layout row wrap class="desktop-layout">
            <v-flex xs6>
              <v-subheader>Years</v-subheader>
              <v-layout wrap>
                <v-flex v-for="year in visibleYears" :key="year" xs4 class="text-xs-center">
                  <v-btn text :color="year === internalYear ? 'primary' : ''" @click="selectYear(year)" class="year-btn">
                    {{ year }}
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-flex>
            
            <v-flex xs6>
              <v-subheader>Months</v-subheader>
              <v-layout wrap>
                <v-flex v-for="(month, index) in months" :key="index" xs4 class="text-xs-center">
                  <v-btn text :color="index + 1 === internalMonth ? 'primary' : ''" @click="selectMonth(index + 1)" class="month-btn">
                    {{ month }}
                  </v-btn>
                </v-flex>
              </v-layout>
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
      type: String,
      default: null,
    },
    decadeStart: {
      type: Number,
      default: null,
    },
  },

  data() {
    return {
      menu: false,
      internalYear: null,
      internalMonth: null,
      localDecadeStart: null,
      months: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ],
    };
  },

  computed: {
    visibleYears() {
      if (!this.localDecadeStart) return [];
      const years = [];
      for (let i = this.localDecadeStart; i < this.localDecadeStart + 10; i++) {
        years.push(i);
      }
      return years;
    },

    currentDecadeRange() {
      return this.localDecadeStart ? `${this.localDecadeStart} - ${this.localDecadeStart + 9}` : '';
    },

    selectedYearMonthDisplay() {
      if (!this.internalYear || !this.internalMonth) return '';
      return `${this.internalYear}-${this.internalMonth < 10 ? '0' + this.internalMonth : this.internalMonth}`;
    },
  },

  mounted() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Parse initial value or use current date
    if (this.value) {
      const [year, month] = this.value.split('-');
      this.internalYear = parseInt(year, 10);
      this.internalMonth = parseInt(month, 10);
    } else {
      this.internalYear = currentYear;
      this.internalMonth = currentMonth;
      this.emitSelection(); // Emit default value
    }

    // Set decade start
    this.localDecadeStart = this.decadeStart !== null 
      ? this.decadeStart 
      : Math.floor(this.internalYear / 10) * 10;
  },

  methods: {
    selectYear(year) {
      this.internalYear = year;
      this.menu = true;
      this.emitSelection();
    },

    selectMonth(month) {
      this.internalMonth = month;
      this.menu = false;
      this.emitSelection();
    },

    emitSelection() {
      const value = `${this.internalYear}-${this.internalMonth < 10 ? '0' + this.internalMonth : this.internalMonth}`;
      this.$emit('input', value);
    },

    handlePreviousDecade() {
      this.localDecadeStart -= 10;
      this.$emit('update:decadeStart', this.localDecadeStart);
    },

    handleNextDecade() {
      this.localDecadeStart += 10;
      this.$emit('update:decadeStart', this.localDecadeStart);
    },
  },

  watch: {
    value(newVal) {
      if (newVal && newVal !== this.selectedYearMonthDisplay) {
        const [year, month] = newVal.split('-');
        this.internalYear = parseInt(year, 10);
        this.internalMonth = parseInt(month, 10);
        
        if (this.internalYear < this.localDecadeStart || this.internalYear >= this.localDecadeStart + 10) {
          this.localDecadeStart = Math.floor(this.internalYear / 10) * 10;
          this.$emit('update:decadeStart', this.localDecadeStart);
        }
      }
    },
    
    decadeStart(newVal) {
      if (newVal !== null && newVal !== this.localDecadeStart) {
        this.localDecadeStart = newVal;
      }
    }
  },
};
</script>

<style scoped>
.year-btn, .month-btn {
  min-width: 0;
  width: 100%;
  margin: 0;
  padding: 0 4px;
  height: 36px;
  font-size: 12px;
}

.headline {
  justify-content: center;
  padding-bottom: 0;
}

.v-subheader {
  padding-left: 0;
  justify-content: center;
}

@media (max-width: 600px) {
  .mobile-layout {
    display: flex !important;
  }
  .desktop-layout {
    display: none !important;
  }
}

@media (min-width: 601px) {
  .mobile-layout {
    display: none !important;
  }
  .desktop-layout {
    display: flex !important;
  }
}
</style>