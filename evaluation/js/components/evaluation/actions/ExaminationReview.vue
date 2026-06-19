<template>
    <collabmed-loading v-if="loading"></collabmed-loading>
    <div v-else>
        <v-card flat class="px-3">
            <v-card-text>
                <div v-for="(val, field) in examinationReview.getFieldsExcept(['form', 'visit_id', 'detailed_exam'])">
                    <h4 class="font-weight-bold">{{ toPresentableFormat(field) }}</h4>

                    <v-row>
                        <v-col cols="3" v-for="(value, key) in examinationReview[field]" :key="'g' + key">

                            <!-- if has type means its just a one level instance -->
                            <div v-if="examinationReview[field][key].type">
                                <v-text-field
                                        class="mx-3"
                                        @change="examinationReview.saveData(field)"
                                        :label="toPresentableFormat(key)"
                                        v-model="examinationReview[field][key].value"
                                        v-if="examinationReview[field][key].type === 'text'"
                                >
                                </v-text-field>

                                <v-switch
                                        v-model="examinationReview[field][key].value"
                                        class="mx-3"
                                        v-if="examinationReview[field][key].type === 'bool'"
                                        @change="examinationReview.saveData(field)"
                                        :label="toPresentableFormat(key)"
                                >
                                </v-switch>

                                <v-select v-model="examinationReview[field][key].value"
                                          class="mx-3"
                                          v-if="examinationReview[field][key].type === 'select'"
                                          :items="examinationReview[field][key].options"
                                          @change="examinationReview.saveData(field)"
                                          :label="toPresentableFormat(key)"
                                ></v-select>

                                <v-textarea v-model="examinationReview[field][key].value"
                                            class="mx-3"
                                            v-if="examinationReview[field][key].type === 'textarea'"
                                            @change="examinationReview.saveData(field)"
                                            :label="toPresentableFormat(key)"
                                >
                                </v-textarea>
                            </div>


                            <!--has a level 2 in it -->
                            <div v-else>
                                <div>
                                    <h5>{{ toPresentableFormat(key) }}</h5>
                                </div>

                                <div v-for="(lv2Val, lv2Key) in examinationReview[field][key]" :key="'lv2' + lv2Key">
                                    <div>
                                        <v-text-field
                                                class="mx-3"
                                                @change="examinationReview.saveData(field)"
                                                :label="toPresentableFormat(lv2Key)"
                                                v-model="examinationReview[field][key][lv2Key].value"
                                                v-if="examinationReview[field][key][lv2Key].type === 'text'"
                                        >
                                        </v-text-field>

                                        <v-switch
                                                v-model="examinationReview[field][key][lv2Key].value"
                                                class="mx-3"
                                                v-if="examinationReview[field][key][lv2Key].type === 'bool'"
                                                @change="examinationReview.saveData(field)"
                                                :label="toPresentableFormat(lv2Key)"
                                        >
                                        </v-switch>

                                        <v-select v-model="examinationReview[field][key][lv2Key].value"
                                                  class="mx-3"
                                                  v-if="examinationReview[field][key][lv2Key].type === 'select'"
                                                  :items="examinationReview[field][key][lv2Key].options"
                                                  @change="examinationReview.saveData(field)"
                                                  :label="toPresentableFormat(lv2Key)"
                                        ></v-select>

                                        <v-textarea v-model="examinationReview[field][key][lv2Key].value"
                                                    class="mx-3"
                                                    v-if="examinationReview[field][key][lv2Key].type === 'textarea'"
                                                    @change="examinationReview.saveData(field)"
                                                    :label="toPresentableFormat(lv2Key)"
                                        >
                                        </v-textarea>
                                    </div>
                                </div>
                            </div>
                        </v-col>
                    </v-row>


                </div>


                <!-- detailed physical exam -->
                <div>
                    <h6>Click on any of the buttons below to perform detailed physical exam</h6>

                    <v-row>
                        <v-col cols="3"
                               v-for="(value, field) in examinationReview.detailed_exam" :key="'pd' + field">

                            <v-dialog
                                    v-model="$data[field + '_dialog']"
                                    persistent
                                    max-width="1200"
                            >
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn v-bind="attrs"
                                            v-on="on"
                                            small outlined rounded>
                                        {{ toPresentableFormat(field) }}
                                    </v-btn>
                                </template>
                                <v-card>
                                    <v-card-title class="headline primary white--text">
                                        {{ toPresentableFormat(field) }}
                                        <v-spacer/>

                                        <v-btn small class="red--text" icon @click="$data[field + '_dialog'] = false">
                                            <v-icon small color="red" class="red--text">close</v-icon>
                                        </v-btn>
                                    </v-card-title>

                                    <v-card-text>
                                        <div  v-for="(lval, lkey) in examinationReview.detailed_exam[field]" :key="lkey">

                                            <h5 class="font-weight-bold">{{ toPresentableFormat(lkey) }}</h5>

                                            <!-- notes -->
                                            <div  v-if="examinationReview.detailed_exam[field][lkey].type">
                                                <v-textarea v-model="examinationReview.detailed_exam[field][lkey].value"
                                                            class="mx-3"
                                                            v-if="examinationReview.detailed_exam[field][lkey].type === 'textarea'"
                                                            @change="examinationReview.saveData('detailed_exam', field)"
                                                >
                                                </v-textarea>

                                                <div  v-if="examinationReview.detailed_exam[field][lkey].type === 'multiselect'">
                                                    <v-row v-for="(val, key) in examinationReview.detailed_exam[field][lkey].keys"
                                                           :key="'m' + key"
                                                    >
                                                        <v-col :cols="examinationReview.detailed_exam[field][lkey].size"
                                                               v-for="(elemValue, elem) in examinationReview.detailed_exam[field][lkey].keys[key]"
                                                               :key="'mk' + elem + key"
                                                        >
                                                            <v-select v-model="examinationReview.detailed_exam[field][lkey].keys[key][elem].value"
                                                                      class="mx-3"
                                                                      v-if="examinationReview.detailed_exam[field][lkey].keys[key][elem].type === 'select'"
                                                                      :items="examinationReview.detailed_exam[field][lkey].keys[key][elem].options"
                                                                      @change="examinationReview.saveData('detailed_exam', field)"
                                                                      :label="toPresentableFormat(elem)"
                                                            ></v-select>

                                                            <v-text-field
                                                                    class="mx-3"
                                                                    @change="examinationReview.saveData('detailed_exam', field)"
                                                                    :label="toPresentableFormat(elem)"
                                                                    v-model="examinationReview.detailed_exam[field][lkey].keys[key][elem].value"
                                                                    v-if="examinationReview.detailed_exam[field][lkey].keys[key][elem].type === 'text'"
                                                            >
                                                            </v-text-field>
                                                        </v-col>
                                                        <v-col cols="1">
                                                            <v-btn small icon>
                                                                <v-icon small
                                                                        color="error"
                                                                        @click="examinationReview.removeitem(val, lkey)">
                                                                    delete
                                                                </v-icon>
                                                            </v-btn>
                                                        </v-col>
                                                    </v-row>
                                                    <v-row>
                                                        <v-col>
                                                            <v-btn outlined
                                                                   small
                                                                   rounded
                                                                   color="primary"
                                                                   @click="examinationReview.addSegment(lkey)"
                                                            >
                                                                add <v-icon small>add</v-icon>
                                                            </v-btn>
                                                        </v-col>
                                                    </v-row>
                                                </div>
                                            </div>

                                            <v-row class="ml-6" v-else>
                                                <v-col cols="3"
                                                       v-for="(value, key) in examinationReview.detailed_exam[field][lkey]"
                                                       :key="'pdlv1' + key">

                                                    <div v-if="examinationReview.detailed_exam[field][lkey][key]">
                                                        <!-- if has type means its just a one level instance -->
                                                        <div v-if="examinationReview.detailed_exam[field][lkey][key].type">
                                                            <v-text-field
                                                                    class="mx-3"
                                                                    @change="examinationReview.saveData('detailed_exam', field)"
                                                                    :label="toPresentableFormat(key)"
                                                                    v-model="examinationReview.detailed_exam[field][lkey][key].value"
                                                                    v-if="examinationReview.detailed_exam[field][lkey][key].type === 'text'"
                                                            >
                                                            </v-text-field>

                                                            <v-switch
                                                                    v-model="examinationReview.detailed_exam[field][lkey][key].value"
                                                                    class="mx-3"
                                                                    v-if="examinationReview.detailed_exam[field][lkey][key].type === 'bool'"
                                                                    @change="examinationReview.saveData('detailed_exam', field)"
                                                                    :label="toPresentableFormat(key)"
                                                            >
                                                            </v-switch>

                                                            <v-select v-model="examinationReview.detailed_exam[field][lkey][key].value"
                                                                      class="mx-3"
                                                                      v-if="examinationReview.detailed_exam[field][lkey][key].type === 'select'"
                                                                      :items="examinationReview.detailed_exam[field][lkey][key].options"
                                                                      @change="examinationReview.saveData('detailed_exam', field)"
                                                                      :label="toPresentableFormat(key)"
                                                            ></v-select>

                                                            <v-textarea v-model="examinationReview.detailed_exam[field][lkey][key].value"
                                                                        class="mx-3"
                                                                        v-if="examinationReview.detailed_exam[field][lkey][key].type === 'textarea'"
                                                                        @change="examinationReview.saveData('detailed_exam', field)"
                                                                        :label="toPresentableFormat(key)"
                                                            >
                                                            </v-textarea>
                                                        </div>


                                                        <!--has a level 2 in it -->
                                                        <div v-else>
                                                            <div>
                                                                <h5>{{ toPresentableFormat(key) }}</h5>
                                                            </div>

                                                            <div v-for="(lv2Val, lv2Key) in examinationReview.detailed_exam[field][lkey][key]" :key="'pdlv2' + lv2Key">
                                                                <div v-if="examinationReview.detailed_exam[field][lkey][key][lv2Key]">
                                                                    <v-text-field
                                                                            class="mx-3"
                                                                            @change="examinationReview.saveData('detailed_exam', field)"
                                                                            :label="toPresentableFormat(lv2Key)"
                                                                            v-model="examinationReview.detailed_exam[field][lkey][key][lv2Key].value"
                                                                            v-if="examinationReview.detailed_exam[field][lkey][key][lv2Key].type === 'text'"
                                                                    >
                                                                    </v-text-field>

                                                                    <v-switch
                                                                            v-model="examinationReview.detailed_exam[field][lkey][key][lv2Key].value"
                                                                            class="mx-3"
                                                                            v-if="examinationReview.detailed_exam[field][lkey][key][lv2Key].type === 'bool'"
                                                                            @change="examinationReview.saveData('detailed_exam', field)"
                                                                            :label="toPresentableFormat(lv2Key)"
                                                                    >
                                                                    </v-switch>

                                                                    <v-select v-model="examinationReview.detailed_exam[field][lkey][key][lv2Key].value"
                                                                              class="mx-3"
                                                                              v-if="examinationReview.detailed_exam[field][lkey][key][lv2Key].type === 'select'"
                                                                              :items="examinationReview.detailed_exam[field][lkey][key][lv2Key].options"
                                                                              @change="examinationReview.saveData('detailed_exam', field)"
                                                                              :label="toPresentableFormat(lv2Key)"
                                                                    ></v-select>

                                                                    <v-textarea v-model="examinationReview.detailed_exam[field][lkey][key][lv2Key].value"
                                                                                class="mx-3"
                                                                                v-if="examinationReview.detailed_exam[field][lkey][key][lv2Key].type === 'textarea'"
                                                                                @change="examinationReview.saveData('detailed_exam', field)"
                                                                                :label="toPresentableFormat(lv2Key)"
                                                                    >
                                                                    </v-textarea>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </v-col>
                                            </v-row>
                                        </div>
                                    </v-card-text>

                                    <v-card-actions>
                                        <div class="caption gray--text">The data is automatically saved, you need not to worry. </div>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </v-col>
                    </v-row>
                </div>
            </v-card-text>
        </v-card>
    </div>
</template>
<script>
    import { mapActions, mapGetters } from "vuex";
    import ExaminationReview from "@evaluation/libs/examination_review/ExaminationReview";

    export default {
        data: () => ({
            loading: false,
            cardiovascular_examination_dialog: false,
            respiratory_examination_dialog: false,
            nervous_system_examination_dialog: false,
            gastrointestinal_examination_dialog: false,
            examinationReview: new ExaminationReview(),
        }),

        computed: {
            ...mapGetters({
                review: 'getExaminationReview'
            }),
        },

        watch: {
            review (val) {
                this.loading = false;

                this.examinationReview.assemble(val);
            }
        },


        methods: {
            ...mapActions([
                'setExaminationReview'
            ]),

            toPresentableFormat (stringType) {
                if(stringType)
                {
                    const type = stringType.replace(/_/g, " ");

                    return type.charAt(0).toUpperCase() + type.slice(1)

                } else {
                    return 'none';
                }
            },

            init() {
                this.setExaminationReview({
                    params: {
                        visit_id: this.$route.params.visitId
                    }
                })
            }
        },

        mounted () {
            this.examinationReview.visit_id = this.$route.params.visitId;
            this.init();
        }
    }
</script>
