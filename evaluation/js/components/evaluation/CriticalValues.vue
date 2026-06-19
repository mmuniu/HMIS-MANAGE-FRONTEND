<template>
  <div class="box">
    <div class="box-body">
      <form @submit.prevent="submitForm">
        <div class="row">
          <div class="col-md-4">
            <label>Parent Procedure *</label>
            <v-autocomplete
                color="black"
                class="black--text"
                v-model="form.parent_procedure_id"
                :items="proceduresArray"
                item-text="name"
                item-value="id"
                label="Choose..."
                flat clearable
                @click:clear="parentProcedureSelectionCleared()"
                :searchable="true"
            >
            </v-autocomplete>
            <span v-if="errors.parent_procedure_id" class="help-block">{{ errors.procedure_id[0] }}</span>
          </div>
          <div class="col-md-4">
              <label>Procedure *</label>
              <v-autocomplete
                        color="black"
                        class="black--text"
                        v-model="form.procedure_id"
                        :items="proceduresArray"
                        item-text="name"
                        item-value="id"
                        label="Choose..."
                        flat clearable
                        @click:clear="procedureSelectionCleared()"
                        :searchable="true"
              >
              </v-autocomplete>
              <span v-if="errors.procedure_id" class="help-block">{{ errors.procedure_id[0] }}</span>
          </div>
          <div class="col-md-4 form-group">
            <label>Critical When</label>
            <select v-model="form.lg_type" class="form-control">
              <option value="" disabled>Choose...</option>
              <option v-for="(label, key) in types" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
            <span v-if="errors.lg_type" class="help-block">{{ errors.lg_type[0] }}</span>
          </div>

        </div>
        <div class="row">
          <div class="col-md-4 form-group">
            <label>Gender(Optional)</label>
            <select v-model="form.gender" class="form-control">
              <option value="" disabled>Choose...</option>
              <option v-for="(label, key) in gender" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
            <span v-if="errors.gender" class="help-block">{{ errors.gender[0] }}</span>
          </div>
          <div class="col-md-4">
            <div class="form-group">
              <label>Critical Value</label>
              <input type="text" v-model="form.critical_value" class="form-control" placeholder="Critical Value">
              <span v-if="errors.critical_value" class="help-block">{{ errors.critical_value[0] }}</span>
            </div>
          </div>

          <div class="col-md-4 form-group">
            <v-select label="Age Group" :items="ageGroups.data" item-text="range" item-value="id"
                      v-model="form.age_group_id" outline
            ></v-select>
            <span v-if="errors.age_group_id" class="help-block">{{ errors.age_group_id[0] }}</span>
          </div>
        </div>
        <div class="box-footer">
          <div class="pull-right">
            <button type="submit" id="submit_critical_values" class="btn btn-primary">
              <i class="fa fa-save"></i> Save
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import {mapActions, mapGetters} from "vuex";

export default {
    props: {
        procedures: {
            required: true,
        },
        types: {
            required: true,
        },
        item: {
          type: Object,
        },
      age_groups:{
        type: Object,
      },
      gender:{
        type: Object,
      }
    },
    data() {
        return {
            form: {
                id: '',
                procedure_id: '',
                type: '',
                lg_type:'',
                critical_value: '',
                age:'',
              age_group_id:null,
              gender:''
            },
            errors: {},
            criticalValueTypes: {},
            proceduresArray: [],
        };
    },
    methods: {
        submitForm() {

          if(this.form.lg_type === '<' ||this.form.lg_type === '>' ){
            this.form.type= 'less_greater'
          }

            axios.post('/evaluation/setup/lab/critical_values', this.form)
                .then((response) => {
                    // Handle successful response

                  location.reload();
                })
                .catch((error) => {
                    if (error.response && error.response.data) {
                        this.errors = error.response.data.errors;
                    }
                });
        },
      ...mapActions([
        'setAgeGroups', 'setReferenceRanges', 'setLabTestTitles',
      ]),
      procedureSelectionCleared(){
          this.form.procedure_id =null
      },
      parentProcedureSelectionCleared(){
        this.form.parent_procedure_id =null
      },
      convertProceduresToArray() {
        this.proceduresArray = Object.entries(this.procedures).map(([key, value]) => ({
          id: parseInt(key),
          name: value,
        }));
      },
    },
    mounted() {
        this.convertProceduresToArray();
        this.setAgeGroups();

    },
    watch: {
        item: {
            immediate: true,
            handler(newValue) {
                this.form = {
                    ...this.form,
                    ...newValue,
                      procedure_id: newValue.procedure ? parseInt(newValue.procedure) : '',
                  parent_procedure_id: newValue.parent_procedure_id ? parseInt(newValue.parent_procedure_id) : '',


                };
            },
        },
    },
  computed: {
    ...mapGetters({
      ageGroups: 'getAgeGroups',
    })
  }
};
</script>

<style scoped>
.help-block {
  color: red;
}
</style>
