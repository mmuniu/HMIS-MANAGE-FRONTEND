<!-- this is some kind of dosh 13 form breakdown -->
<template>
    <collabmed-loading v-if="loading"></collabmed-loading>
    <div v-else>
        <v-card flat class="px-3">

            <v-card-title>
                <h4 style="text-decoration: underline"
                    class="pt-6 pl-2"> Systems Review </h4>
                <v-spacer/>
               <!-- <v-btn small color="primary" @click="printForm()">
                    print form
                </v-btn>-->
            </v-card-title>

            <div class="mx-4">

                <!-- residence -->
                <v-row>
                    <v-col cols="4">
                        <v-select :items="residence_types"
                                  @change="systemsReview.saveData('residence')"
                                  label="Where do you currently reside"
                                  v-model="systemsReview.residence"
                        ></v-select>
                    </v-col>
                </v-row>

                <!-- lists -->
                <v-row>
                    <v-col cols="5"
                           class="mr-10"
                           v-for="(key, index) in listOne"
                           :key="key">

                        <h4 style="text-transform : capitalize">{{ toPresentableFormat(key) }}:</h4>

                        <v-row>
                            <v-col :cols="systemsReview[key][type].hasOwnProperty('value') ? '6' : '4'"
                                   v-for="(value, type, index) in systemsReview[key]"
                                   :key="type">

                                <!-- list objects only-->
                                <span v-if="typeof value === 'object' && value !== null">
                        <span v-if="systemsReview[key][type].hasOwnProperty('status')">
                            <v-switch :label="toPresentableFormat(type)"
                                      @change="systemsReview.saveData(key)"
                                      v-model="systemsReview[key][type].status">
                            </v-switch>

                            <br v-if="systemsReview[key][type].status"/>

                            <v-text-field
                                    class="mx-3"
                                    @change="systemsReview.saveData(key)"
                                    v-if="systemsReview[key][type].status"
                                    :label="systemsReview[key][type].label"
                                    v-model="systemsReview[key][type].value">
                            </v-text-field>
                        </span>

                        <span v-else>
                            <v-text-field
                                    class="mx-3"
                                    @change="systemsReview.saveData(key)"
                                    :label="toPresentableFormat(type)"
                                    v-model="systemsReview[key][type].value">
                            </v-text-field>
                        </span>
                    </span>

                                <!-- non object lists -->
                                <span v-else>
                        <v-switch :label="toPresentableFormat(type)"
                                  @change="systemsReview.saveData(key)"
                                  v-model="systemsReview[key][type]">
                        </v-switch>
                    </span>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>

                <v-divider/>

                <!-- blood thinners -->
                <v-row>
                    <v-col cols="6">
                        <v-switch label="Are you taking any blood thinners (Coumadin, Warfarin, Plavix, Pletal, Pradaxa, etc.)"
                                  @change="systemsReview.saveData('blood_thinners')"
                                  v-model="systemsReview.blood_thinners"
                                  ></v-switch>
                    </v-col>
                    <v-col cols="6">
                        <div>
                            <v-combobox
                                    outlined
                                    @change="systemsReview.saveData('current_medications')"
                                    v-model="systemsReview.current_medications"
                                    persistent-hint
                                    hint="Press tab after typing the diagnosis"
                                    :return-object="false"
                                    :items="[]"
                                    multiple chips
                                    label="Current medication - please list all over prescriptions and over the counter medicines including does"
                            >
                                <template v-slot:selection="data">
                                    <v-chip color="teal" :key="JSON.stringify(data.item)">
                                        {{ data.item }}
                                    </v-chip>
                                </template>
                            </v-combobox>
                        </div>
                    </v-col>
                </v-row>


                <!-- medical and surgical histories -->
                <v-row>
                    <v-col cols="5"
                           class="mr-10"
                           v-for="(key, index) in listTwo"
                           :key="key">

                        <h4 style="text-transform : capitalize">{{ toPresentableFormat(key) }}:</h4>

                        <v-row>
                            <v-col :cols="systemsReview[key][type].hasOwnProperty('value') ? '6' : '4'"
                                   v-for="(value, type, index) in systemsReview[key]"
                                   :key="type">

                                <!-- list objects only-->
                                <span v-if="typeof value === 'object' && value !== null">
                        <span v-if="systemsReview[key][type].hasOwnProperty('status')">
                            <v-switch :label="toPresentableFormat(type)"
                                      @change="systemsReview.saveData(key)"
                                      v-model="systemsReview[key][type].status">
                            </v-switch>

                            <br v-if="systemsReview[key][type].status"/>

                            <v-text-field
                                    class="mx-3"
                                    @change="systemsReview.saveData(key)"
                                    v-if="systemsReview[key][type].status"
                                    :label="systemsReview[key][type].label"
                                    v-model="systemsReview[key][type].value">
                            </v-text-field>
                        </span>

                        <span v-else>
                            <v-text-field
                                    class="mx-3"
                                    @change="systemsReview.saveData(key)"
                                    :label="toPresentableFormat(type)"
                                    v-model="systemsReview[key][type].value">
                            </v-text-field>
                        </span>
                    </span>

                                <!-- non object lists -->
                                <span v-else>
                        <v-switch :label="toPresentableFormat(type)"
                                  @change="systemsReview.saveData(key)"
                                  v-model="systemsReview[key][type]">
                        </v-switch>
                    </span>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>


                <!-- hospitalizations -->
                <v-divider/>
                <v-textarea v-model="systemsReview.hospitalizations"
                            @change="systemsReview.saveData('hospitalizations')"
                            label="Hospitalizations (non-surgical)"
                ></v-textarea>

                <!-- family history-->
                <v-row>
                    <v-col cols="12"
                           class="mr-10"
                           v-for="(key, index) in ['family_medical_history']"
                           :key="key">

                        <h4 style="text-transform : capitalize">{{ toPresentableFormat(key) }}:</h4>

                        <v-row>
                            <v-col :cols="systemsReview[key][type].hasOwnProperty('value') ? '6' : '4'"
                                   v-for="(value, type, index) in systemsReview[key]"
                                   :key="type">

                                <!-- list objects only-->
                                <span v-if="typeof value === 'object' && value !== null">
                        <span v-if="systemsReview[key][type].hasOwnProperty('status')">
                            <v-switch :label="toPresentableFormat(type)"
                                      @change="systemsReview.saveData(key)"
                                      v-model="systemsReview[key][type].status">
                            </v-switch>

                            <br v-if="systemsReview[key][type].status"/>

                            <v-text-field
                                    class="mx-3"
                                    @change="systemsReview.saveData(key)"
                                    v-if="systemsReview[key][type].status"
                                    :label="systemsReview[key][type].label"
                                    v-model="systemsReview[key][type].value">
                            </v-text-field>
                        </span>

                        <span v-else>
                            <v-text-field
                                    class="mx-3"
                                    @change="systemsReview.saveData(key)"
                                    :label="toPresentableFormat(type)"
                                    v-model="systemsReview[key][type].value">
                            </v-text-field>
                        </span>
                    </span>

                                <!-- non object lists -->
                                <span v-else>
                        <v-switch :label="toPresentableFormat(type)"
                                  @change="systemsReview.saveData(key)"
                                  v-model="systemsReview[key][type]">
                        </v-switch>
                    </span>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>


                <v-row>
                    <v-col cols="12">
                        <h4>Social History:</h4>
                    </v-col>

                    <v-col cols="6">
                        <v-select
                                @change="systemsReview.saveData('social_history')"
                                :items="['Single', 'Married', 'Separated', 'Divorced', 'Widowed']"
                                v-model="systemsReview.social_history.marital_status"
                                label="Marital status"
                                ></v-select>
                    </v-col>

                    <v-col cols="6">
                        <v-switch label="Children"
                                  @change="systemsReview.saveData('social_history')"
                                  v-model="systemsReview.social_history.children.status">
                        </v-switch>

                        <v-text-field
                                class="mx-3"
                                @change="systemsReview.saveData('social_history')"
                                v-if="systemsReview.social_history.children.status"
                                label="How many ?"
                                v-model="systemsReview.social_history.children.details">
                        </v-text-field>
                    </v-col>

                    <v-col cols="6">
                        <v-switch label="Use of alcohol"
                                  @change="systemsReview.saveData('social_history')"
                                  v-model="systemsReview.social_history.use_of_alcohol.status">
                        </v-switch>

                        <v-text-field
                                class="mx-3"
                                @change="systemsReview.saveData('social_history')"
                                v-if="systemsReview.social_history.use_of_alcohol.status"
                                label="How much ?"
                                v-model="systemsReview.social_history.use_of_alcohol.details">
                        </v-text-field>
                    </v-col>

                    <v-col cols="6">

                        <v-select :items="['Never', 'Quit', 'Yes']"
                                  @change="systemsReview.saveData('social_history')"
                                  v-model="systemsReview.social_history.use_of_tobacco.status"
                                  label="Use of tobacco"
                        ></v-select>

                        <v-text-field
                                class="mx-3"
                                @change="systemsReview.saveData('social_history')"
                                v-if="systemsReview.social_history.use_of_tobacco.status === 'Yes'"
                                label="How much ?"
                                v-model="systemsReview.social_history.use_of_tobacco.details">
                        </v-text-field>
                    </v-col>

                    <v-col cols="12">

                        <v-divider/>

                        <v-textarea v-model="systemsReview.social_history.employer_and_occupation"
                                    @change="systemsReview.saveData('social_history')"
                                    label="Employer and occupations"
                        ></v-textarea>
                    </v-col>
                </v-row>

            </div>
        </v-card>
    </div>
</template>
<script>
    import { mapActions, mapGetters } from "vuex";
    import SystemsReview from "@evaluation/libs/systems_review/SystemsReview";

    export default {
        data: () => ({
            loading: false,
            systemsReview: new SystemsReview(),
        }),

        computed: {
            ...mapGetters({
                review: 'getSystemsReview'
            }),

            residence_types () {
                return [
                    'Independently',
                    'In assisted facility',
                    'In a Nursing home'
                ]
            },

            listOne () {
                return [
                    'gastrointestinal', 'heent', 'cardiovascular', 'respiratory',
                    'neurological', 'dermatology', 'musculoskeletal', 'psychiatric',
                    'constitutional', 'genitourinary',
                ]
            },

            listTwo () {
                return [
                    'medical_history', 'surgical_history',
                ]
            }
        },

        watch: {
            review (val) {
                this.loading = false;

                this.systemsReview.assemble(val);
            }
        },


        methods: {
            ...mapActions([
                'setSystemsReview'
            ]),

            toPresentableFormat (stringType) {
                const type = stringType.replace(/_/g, " ");

                return type.charAt(0).toUpperCase() + type.slice(1)
            },

            init() {
                this.setSystemsReview({
                    params: {
                        visit_id: this.$route.params.visitId
                    }
                })
                console.log(this.systemsReview.visit_id);
            }
        },

        mounted () {
            this.systemsReview.visit_id = this.$route.params.visitId;
            this.init()
            document.querySelectorAll('.v-messages').forEach(e => e.remove());
        }
    }
</script>
<style scoped>
    label {
        font-weight: 400;
    }

    .v-input--selection-controls {
        margin-top: 0;
        padding-top: 0;
    }
</style>
