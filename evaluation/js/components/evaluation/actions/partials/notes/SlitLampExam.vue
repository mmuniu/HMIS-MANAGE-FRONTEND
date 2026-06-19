<template>
  <div>
    <v-card-title>
      <span>External eye exam</span>
    </v-card-title>

    <v-card-text>
      <v-row>
        <v-col cols="4">&nbsp;</v-col>
        <v-col cols="4" style="font-weight: bold"> OD WNL </v-col>
        <v-col cols="4" style="font-weight: bold"> OS WNL </v-col>
      </v-row>
      <div>
        <v-row>
          <v-col cols="4">
            <span class="ml-4" style="font-weight: bold">EOMM</span>
          </v-col>
          <v-col cols="4">
            <input
                label="Type"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.eomm.od_wnl"
            />
          </v-col>
          <v-col cols="4">
            <input
                label="Type"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.eomm.os_wnl"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <span class="ml-4" style="font-weight: bold">Stereopsis</span>
          </v-col>
          <v-col cols="8">
            <input
                label="Type"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.stereopsis.od_wnl"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <span class="ml-4" style="font-weight: bold">Cover test</span>
          </v-col>
          <v-col cols="4">
            <input
                label="Type"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.cover_test.od_wnl"
            />
          </v-col>
          <v-col cols="4">
            <input
                label="Type"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.cover_test.os_wnl"
            />
          </v-col>
        </v-row>
      </div>
    </v-card-text>

    <v-card-title>
      <span>Slit Lamp Exam</span>


      <v-col cols="8" style="margin-top:15px">
        <v-radio-group  @change="setAllToNormal">
          <v-radio label="Set All to Normal" value="normal"></v-radio>
        </v-radio-group>
      </v-col>

    </v-card-title>



    <v-card-text>
      <div>
        <v-row>
          <v-col cols="4">
            <span class="font-weight-bold" style="font-weight: bold"
            >ADNEXA/LIDS</span
            >
          </v-col>

          <v-col cols="4"> </v-col>
          <v-col cols="4"> </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <span class="ml-4" style="font-weight: bold">Lids</span>
          </v-col>
          <v-col cols="4">
            <v-select
                :items="[
                'Normal',
                'Chalazion',
                'Stye',
                'Ptosis',
                'Entropion',
                'Ectropion',
                'Distichiasis',
                'Edema',
                'Hyper pigmented',
                'Others(type)',
              ]"
                multiple
                @update:modelValue="handleSelection('lids', 'od_wnl')"

                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.lids.od_wnl"
                dense
                label="Type"
            >
            </v-select>
            <input
                v-if="ophthalmologist.slit_lamp_exam.lids.od_wnl.includes('Others(type)')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.lids.od_wnl_other"
            />
          </v-col>
          <v-col cols="4">
            <v-select
                :items="[
                'Normal',
                'Chalazion',
                'Stye',
                'Ptosis',
                'Entropion',
                'Ectropion',
                'Distichiasis',
                'Edema',
                'Hyper pigmented',
                'Others',
              ]"
                multiple
                @update:modelValue="handleSelection('lids', 'os_wnl')"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.lids.os_wnl"
                dense
                label="Type"
            >
            </v-select>
            <input
                v-if="ophthalmologist.slit_lamp_exam.lids.os_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.lids.os_wnl_other"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="4">
            <span class="font-weight-bold spans">CONJUCTIVA</span>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <span class="ml-4 spans">Bulbar</span>
          </v-col>
          <v-col cols="4">
            <v-select
                :items="[
                'Normal',
                'Injected',
                'Hyper pigmented',
                'Pterygium',
                'Pinguecula',
                'Others',
              ]"
                multiple
                @update:modelValue="handleSelection('bulbar', 'od_wnl')"

                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.bulbar.od_wnl"
                dense
                label="Type"
            >
            </v-select>
            <input
                v-if="ophthalmologist.slit_lamp_exam.bulbar.od_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.bulbar.od_wnl_other"
            />
          </v-col>
          <v-col cols="4">
            <v-select
                :items="[
                'Normal',
                'Injected',
                'Hyper pigmented',
                'Pterygium',
                'Pinguecula',
                'Others',
              ]"
                multiple

                @change="ophthalmologist.save()"
                @update:modelValue="handleSelection('bulbar', 'os_wnl')"

                v-model="ophthalmologist.slit_lamp_exam.bulbar.os_wnl"
                dense
                label="Type"
            >
            </v-select>
            <input
                v-if="ophthalmologist.slit_lamp_exam.bulbar.os_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.bulbar.os_wnl_other"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <span class="ml-4 spans">Palperbral</span>
          </v-col>
          <v-col cols="4">
            <v-select
                :items="[
                'Normal',
                'micropapillae',
                'macropapillae',
                'Cobble stones',
                'Concretions',
                'Foreign body',
                'Others',
              ]"

                @change="ophthalmologist.save()"
                @update:modelValue="handleSelection('palperbral', 'od_wnl')"

                v-model="ophthalmologist.slit_lamp_exam.palperbral.od_wnl"
                dense
                multiple
                label="Type"
            >
            </v-select>
            <input
                v-if="
                ophthalmologist.slit_lamp_exam.palperbral.od_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.palperbral.od_wnl_other"
            />
          </v-col>
          <v-col cols="4">
            <v-select
                :items="[
                'Normal',
                  'micropapillae',
                'macropapillae',
                'Cobble stones',
                'Concretions',
                'Foreign body',
                'Others',
              ]"
                @change="ophthalmologist.save()"
                @update:modelValue="handleSelection('palperbral', 'os_wnl')"

                v-model="ophthalmologist.slit_lamp_exam.palperbral.os_wnl"
                dense
                label="Type"
                multiple
            >
            </v-select>
            <input
                v-if="
                ophthalmologist.slit_lamp_exam.palperbral.os_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.palperbral.os_wnl_other"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <span class="font-weight-bold spans">CORNEA</span>
          </v-col>
          <v-col cols="4">
            <v-select
                :items="['Normal', 'Scar', 'Ulcer', 'Haze', 'Pannus', 'Others']"
                @change="ophthalmologist.save()"
                @update:modelValue="handleSelection('cornea', 'od_wnl')"

                v-model="ophthalmologist.slit_lamp_exam.cornea.od_wnl"
                dense
                label="Type"
                multiple
            >
            </v-select>
            <input
                v-if="ophthalmologist.slit_lamp_exam.cornea.od_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.cornea.od_wnl_other"
            />
          </v-col>
          <v-col cols="4">
            <v-select
                :items="['Normal', 'Scar', 'Ulcer', 'Haze', 'Pannus', 'Others']"
                @change="ophthalmologist.save()"
                multiple
                @update:modelValue="handleSelection('cornea', 'os_wnl')"

                v-model="ophthalmologist.slit_lamp_exam.cornea.os_wnl"
                dense
                label="Type"
            >
            </v-select>
            <input
                v-if="ophthalmologist.slit_lamp_exam.cornea.os_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.cornea.os_wnl_other"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <span class="font-weight-bold spans">A/C</span>
          </v-col>
          <v-col cols="4">
            <v-select
                :items="[
                'Normal',
                'Cells',
                'Flares',
                'Hypopyon',
                'Hyphema',
                'Shallow',
                'Others',
              ]"
                @change="ophthalmologist.save()"
                multiple

                v-model="ophthalmologist.slit_lamp_exam.ac.od_wnl"
                dense
                label="Type"
            >
            </v-select>
            <input
                v-if="ophthalmologist.slit_lamp_exam.ac.od_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.ac.od_wnl_other"
            />
          </v-col>
          <v-col cols="4">
            <v-select
                :items="[
                'Normal',
                'Cells',
                'Flares',
                'Hypopyon',
                'Hyphema',
                'Shallow',
                'Others',
              ]"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.ac.os_wnl"
                dense
                multiple

                label="Type"
            >
            </v-select>
            <input
                v-if="ophthalmologist.slit_lamp_exam.ac.os_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.ac.os_wnl_other"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <span class="font-weight-bold spans">PUPIL</span>
          </v-col>
          <v-col cols="4">
            <v-select
                :items="[
                'Normal',
                'Miotic',
                'Mild dilated',
                'Posterior synachiae',
                'Fibrin',
                'Others',
              ]"
                multiple

                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.pupil.od_wnl"
                dense
                label="Type"
            >
            </v-select>
            <input
                v-if="ophthalmologist.slit_lamp_exam.pupil.od_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.pupil.od_wnl_other"
            />
          </v-col>
          <v-col cols="4">
            <v-select
                :items="[
                'Normal',
                'Miotic',
                'Mild dilated',
                'Posterior synachiae',
                'Fibrin',
                'Others',
              ]"
                multiple

                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.pupil.os_wnl"
                dense
                label="Type"
            >
            </v-select>
            <input
                v-if="ophthalmologist.slit_lamp_exam.pupil.os_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.pupil.os_wnl_other"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="4">
            <span class="ml-4 spans">IRIS</span>
          </v-col>
          <v-col cols="4">
            <v-select
                :items="[
                  'Normal',
                  'Aniridia',
                  'Rubiosis',
                  'Defect',
                  'Others',
                ]"
                multiple

                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.iris.od_wnl"
                dense
                label="Type"
            >
            </v-select>
            <input
                v-if="ophthalmologist.slit_lamp_exam.iris.od_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.iris.od_wnl_other"
            />
          </v-col>
          <v-col cols="4">
            <v-select
                :items="[
                  'Normal',
                  'Aniridia',
                  'Rubiosis',
                  'Defect',
                  'Others',
                ]"
                multiple

                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.iris.os_wnl"
                dense
                label="Type"
            >
            </v-select>
            <input
                v-if="ophthalmologist.slit_lamp_exam.iris.os_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.iris.os_wnl_other"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <span class="font-weight-bold spans">LENS</span>
          </v-col>
          <v-col cols="4">
            <v-select
                :items="[
               'Normal',
                'Posterior Sub Capsular',
                'Cortical Cataract',
                'Psc+cortical cataract',
                'Pseudophakia',
                'Good pseudophakia',
                'Pseudophakia +pco',
                 'Aphakic',
                 'Others',
              ]"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.lens.od_wnl"
                dense
                multiple

                label="Type"
            >
            </v-select>
            <input
                v-if="ophthalmologist.slit_lamp_exam.lens.od_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.lens.od_wnl_other"
            />
            <!-- Sub-options for Posterior Sub Capsular -->
            <v-select
                v-if="ophthalmologist.slit_lamp_exam.lens.od_wnl.includes('Posterior Sub Capsular')"
                multiple
                :items="['Mature', 'Early']"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.lens.posterior_sub_caspular_type.od_wnl"
                dense
                label="Posterior Sub Capsular Type"
            >
            </v-select>
            <!-- Sub-options for Cortical Cataract -->
            <v-select
                v-if="ophthalmologist.slit_lamp_exam.lens.od_wnl.includes('Cortical Cataract')"
                multiple
                :items="['Mature', 'Early']"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.lens.cortical_cataract_type.od_wnl"
                dense
                label="Cortical Cataract Type"
            >
            </v-select>
            <!-- Sub-options for Psc+cortical cataract -->
            <v-select
                v-if="ophthalmologist.slit_lamp_exam.lens.od_wnl.includes('Psc+cortical cataract')"
                :items="['Mature', 'Early']"
                multiple
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.lens.psc_cortical_cataract_type.od_wnl"
                dense
                label="Psc+cortical cataract Type"
            >
            </v-select>
          </v-col>
          <v-col cols="4">
            <v-select
                :items="[
                'Normal',
                'Posterior Sub Capsular',
                'Cortical Cataract',
                'Psc+cortical cataract',
                'Pseudophakia',
                'Good pseudophakia',
                'Pseudophakia +pco',
                 'Aphakic',

                'Others',
              ]"
                multiple

                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.lens.os_wnl"
                dense
                label="Type"
            >
            </v-select>
            <input
                v-if="ophthalmologist.slit_lamp_exam.lens.os_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.lens.os_wnl_other"
            />
            <!-- Sub-options for Posterior Sub Capsular -->
            <v-select
                v-if="ophthalmologist.slit_lamp_exam.lens.os_wnl.includes('Posterior Sub Capsular')"
                :items="['Mature', 'Early']"
                multiple
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.lens.posterior_sub_caspular_type.os_wnl"
                dense
                label="Posterior Sub Capsular Type"
            >
            </v-select>
            <!-- Sub-options for Cortical Cataract -->
            <v-select
                v-if="ophthalmologist.slit_lamp_exam.lens.os_wnl.includes('Cortical Cataract')"
                :items="['Mature', 'Early']"
                multiple
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.lens.cortical_cataract_type.os_wnl"
                dense
                label="Cortical Cataract Type"
            >
            </v-select>
            <!-- Sub-options for Psc+cortical cataract -->
            <v-select
                v-if="ophthalmologist.slit_lamp_exam.lens.os_wnl.includes('Psc+cortical cataract')"
                :items="['Mature', 'Early']"
                multiple
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.lens.psc_cortical_cataract_type.os_wnl"
                dense
                label="Psc+cortical cataract Type"
            >
            </v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <span class="font-weight-bold spans">VITREOUS</span>
          </v-col>
          <v-col cols="4">
            <v-select
                :items="['Normal', 'Cells', 'Strands', 'Haemorrhage','Posterior vitreous detachment (PVD)', 'Others']"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.vitreous.od_wnl"
                dense
                multiple

                label="Type"
            >
            </v-select>
            <input
                v-if="ophthalmologist.slit_lamp_exam.vitreous.od_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.vitreous.od_wnl_other"
            />
          </v-col>
          <v-col cols="4">
            <v-select
                :items="['Normal', 'Cells', 'Strands', 'Haemorrhage','Posterior vitreous detachment (PVD)', 'Others']"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.vitreous.os_wnl"
                dense
                multiple

                label="Type"
            >
            </v-select>
            <input
                v-if="ophthalmologist.slit_lamp_exam.vitreous.os_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.vitreous.os_wnl_other"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="4">
            <span class="font-weight-bold spans">FUNDUS</span>
          </v-col>
          <v-col cols="4"> </v-col>
          <v-col cols="4"> </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <span class="ml-4 spans">C/D Ratio</span>
          </v-col>
          <v-col cols="4">
            <v-select
                :items="[0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0]"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.cd_ratio.od_wnl"
                dense
                label="Type">
            </v-select>
          </v-col>

          <v-col cols="4">
            <v-select
                :items="[0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0]"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.cd_ratio.os_wnl"
                dense
                label="Type"
            >
            </v-select>

          </v-col>

        </v-row>
        <v-row>
          <v-col cols="4">
            <span class="ml-4 spans">Appearance</span>
          </v-col>
          <v-col cols="4">
            <v-select
                :items="[
                'Normal',
                'Pale',
                'Hyperemic',
                'Blurred Margins',
                'Neovascularization',
                'Temporal',
                'Crescent',
                 'Nasal shift of vessels',
                'Others'
              ]"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.appearance.od_wnl"
                dense
                multiple
                label="Type"
            >
            </v-select>
            <input
                v-if="
                ophthalmologist.slit_lamp_exam.appearance.od_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.appearance.od_wnl_other"
            />
          </v-col>
          <v-col cols="4">
            <v-select
                :items="[
                  'Normal',
                'Pale',
                'Hyperemic',
                'Blurred Margins',
                'Neovascularization',
                'Temporal',
                'Crescent',
                 'Nasal shift of vessels',
                'Others'
              ]"
                multiple

                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.appearance.os_wnl"
                dense
                label="Type"
            >
            </v-select>
            <input
                v-if="
                ophthalmologist.slit_lamp_exam.appearance.os_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.appearance.os_wnl_other"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <span class="ml-4 spans">Nerve Fiber Layer</span>
          </v-col>
          <v-col cols="4">
            <v-select
                :items="['Normal', 'Thinned']"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.nerve_fiber_layer.od_wnl"
                dense
                multiple

                label="Type"
            >
            </v-select>
          </v-col>
          <v-col cols="4">
            <v-select
                :items="['Normal', 'Thinned']"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.nerve_fiber_layer.os_wnl"
                dense
                multiple

                label="Type"
            >
            </v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <span class="ml-4 spans">Macula</span>
          </v-col>
          <v-col cols="4">
            <v-select
                :items="[
                'Normal',
                'Dull reflex',
                'Hole',
                'Scar',
                'Exudates',
                'Haemorrhage',
                'Membrane',
                'Others',
              ]"
                multiple

                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.macula.od_wnl"
                dense
                label="Type"
            >
            </v-select>
            <input
                v-if="ophthalmologist.slit_lamp_exam.macula.od_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.macula.od_wnl_other"
            />
          </v-col>
          <v-col cols="4">
            <v-select
                :items="[
                'Normal',
                'Dull reflex',
                'Hole',
                'Scar',
                'Exudates',
                'Haemorrhage',
                'Membrane',
                'Others',
              ]"
                multiple

                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.macula.os_wnl"
                dense
                label="Type"
            >
            </v-select>
            <input
                v-if="ophthalmologist.slit_lamp_exam.macula.os_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.macula.os_wnl_other"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="4">
            <span class="ml-4 spans">Retinal Periphery</span>
          </v-col>

          <v-col cols="4">
            <v-select
                :items="[
                'Normal',
                'Degeneration',
                'Holes(State O Clock)',
                'Haemorrhages',
                'Exudates',
                'Cotton wool spots',
                'Neovascularization',
                'Others',
              ]"
                multiple

                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.periphery.od_wnl"
                dense
                label="Type"
            >
            </v-select>
            <v-select
                v-if="
                ophthalmologist.slit_lamp_exam.periphery.od_wnl =='Holes(State O Clock)'"
                :items="holesOClock"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.periphery.od_wnl_clock"
                dense
                label="o'clock"
            >
            </v-select>
            <input
                v-if="
                ophthalmologist.slit_lamp_exam.periphery.od_wnl.includes('Others')"
                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.periphery.od_wnl_other"
            />
          </v-col>
          <v-col cols="4">
            <v-select
                :items="[
                'Normal',
                'Degeneration',
                'Holes(State O Clock)',
                'Haemorrhages',
                'Exudates',
                'Cotton wool spots',
                'Neovascularization',
                'Others',
              ]"
                multiple

                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.periphery.os_wnl"
                dense
                label="Type"
            >
            </v-select>
            <v-select
                v-if="
                ophthalmologist.slit_lamp_exam.periphery.os_wnl ===
                'Holes(State O Clock)'
              "
                :items="holesOClock"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.periphery.os_wnl_clock"
                dense
                label="o'clock"
            >
            </v-select>
            <input
                v-if="
                ophthalmologist.slit_lamp_exam.periphery.os_wnl.includes('Others')"

                style="width: 90%"
                @change="ophthalmologist.save()"
                v-model="ophthalmologist.slit_lamp_exam.periphery.os_wnl_other"
            />
          </v-col>
        </v-row>

        <v-row>
          <icd10 :visit-id="this.$route.params.visitId"></icd10>
          <br /><br />
        </v-row>
        <v-row>
          <div v-if="msetting('evaluation.write_in_diagnosis')" class="mt-2">
            <v-combobox
                outlined
                v-model="ophthalmologist.notes.diagnosis"
                persistent-hint
                hint="Press tab after typing the diagnosis. (please only use this option when you can't find the diagnosis in the icd10 list)"
                :return-object="false"
                :items="[]"
                multiple chips
                @change="ophthalmologist.saveNotes()"
                label="Type in diagnosis"
            >
              <template v-slot:selection="slitLampData">
                <v-chip color="teal" :key="JSON.stringify(slitLampData.item)">
                  {{ slitLampData.item }}
                </v-chip>
              </template>
            </v-combobox>
          </div>
          <v-textarea
              label="Plan of Treatment / Management"
              v-model="ophthalmologist.notes.treatment_plan"
              rows="3"
              outlined
              @change="ophthalmologist.saveNotes()"
          >
          </v-textarea>
        </v-row>
      </div>
    </v-card-text>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Ophthalmologist from '@evaluation/libs/Ophthalmologist/Ophthalmologist';
import OphthalmologistObj from '@evaluation/libs/Ophthalmologist/Ophthalmologist';
// :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]"

export default {
  data: () => ({
    ophthalmologist: new Ophthalmologist(),
    holesOClock: [
      '1 o\'clock',
      '2 o\'clock',
      '3 o\'clock',
      '4 o\'clock',
      '5 o\'clock',
      '6 o\'clock',
      '7 o\'clock',
      '8 o\'clock',
      '9 o\'clock',
      '10 o\'clock',
      '11 o\'clock',
      '12 o\'clock',
    ],
  }),

  computed: {
  },

  watch: {

  },

  methods: {
    ...mapActions([]),

    init() {

    },
    handleSelection(section, side) {
      let selected = this.ophthalmologist.slit_lamp_exam[section][side];

      console.log(selected)
      if (selected.includes("Normal")) {
        // If "Normal" is selected, clear all other selections
        this.ophthalmologist.slit_lamp_exam[section][side] = ["Normal"];
      } else {
        // Ensure "Normal" is removed when other options are selected
        this.ophthalmologist.slit_lamp_exam[section][side] = selected.filter(
            (item) => item !== "Normal"
        );
      }

      this.ophthalmologist.save(); // Call save after updating
    },
    setAllToNormal() {
      const fields = [
        "palperbral",
        "cornea",
        "ac",
        "lids",
        "bulbar",
        "pupil",
        "lens",
        "appearance",
        "nerve_fiber_layer",
        "macula",
        "iris",
        "periphery",
        "vitreous"
      ];

      fields.forEach((field) => {
        ["od_wnl", "os_wnl"].forEach((side) => {
          let currentValue = this.ophthalmologist.slit_lamp_exam[field][side];

          // Ensure it's an array before modifying
          if (!Array.isArray(currentValue)) {
            currentValue = [];
          }

          // Add 'Normal' only if it's not already selected
          if (!currentValue.includes("Normal")) {
            currentValue.push("Normal");
          }

          this.ophthalmologist.slit_lamp_exam[field][side] = currentValue;
        });
      });

      this.ophthalmologist.save();
    },

    async fetchSlitLampData(){

      try{
        const params = {
          visit_id: this.$route.params.visitId, // Getting visitId from the route params
        };

        // Assuming refraction.fetchRefractionData is an API call that takes params
        const response = await this.ophthalmologist.fetchSlitLampData( params );let data = response.data;

        // Populate the model with the fetched data
        if (data) {
          let slitLampData = data;
          const convertToArray = (value) => Array.isArray(value) ? value : value ? [value] : [];

          this.ophthalmologist.slit_lamp_exam.eomm.od_wnl = convertToArray(slitLampData.eomm.od_wnl);
          this.ophthalmologist.slit_lamp_exam.eomm.os_wnl = convertToArray(slitLampData.eomm.os_wnl);

          this.ophthalmologist.slit_lamp_exam.stereopsis.od_wnl = convertToArray(slitLampData.stereopsis.od_wnl);
          this.ophthalmologist.slit_lamp_exam.cover_test.od_wnl = convertToArray(slitLampData.cover_test.od_wnl);
          this.ophthalmologist.slit_lamp_exam.cover_test.os_wnl = convertToArray(slitLampData.cover_test.os_wnl);

          this.ophthalmologist.slit_lamp_exam.appearance.od_wnl = convertToArray(slitLampData.appearance.od_wnl);
          this.ophthalmologist.slit_lamp_exam.appearance.os_wnl = convertToArray(slitLampData.appearance.os_wnl);


          // Populate other details if available
          if (slitLampData.lids.od_wnl === 'Others(type)') {
            this.ophthalmologist.slit_lamp_exam.lids.od_wnl_other = slitLampData.lids.od_wnl_other;
          }

          if (slitLampData.lids.os_wnl === 'Others') {
            this.ophthalmologist.slit_lamp_exam.lids.os_wnl_other = slitLampData.lids.os_wnl_other;
          }


          // Populate Bulbar data
          this.ophthalmologist.slit_lamp_exam.bulbar.od_wnl = convertToArray(slitLampData.bulbar.od_wnl);
          this.ophthalmologist.slit_lamp_exam.bulbar.os_wnl = convertToArray(slitLampData.bulbar.os_wnl);

          if (this.ophthalmologist.slit_lamp_exam.bulbar.od_wnl.includes('Others')) {
            this.ophthalmologist.slit_lamp_exam.bulbar.od_wnl_other = slitLampData.bulbar.od_wnl_other;
          }
          if (this.ophthalmologist.slit_lamp_exam.bulbar.os_wnl.includes('Others')) {
            this.ophthalmologist.slit_lamp_exam.bulbar.os_wnl_other = slitLampData.bulbar.os_wnl_other;
          }

          // Populate Palperbral data
          this.ophthalmologist.slit_lamp_exam.palperbral.od_wnl = convertToArray(slitLampData.palperbral.od_wnl);
          this.ophthalmologist.slit_lamp_exam.palperbral.os_wnl = convertToArray(slitLampData.palperbral.os_wnl);

          if (this.ophthalmologist.slit_lamp_exam.palperbral.od_wnl.includes('Others')) {
            this.ophthalmologist.slit_lamp_exam.palperbral.od_wnl_other = slitLampData.palperbral.od_wnl_other;
          }
          if (this.ophthalmologist.slit_lamp_exam.palperbral.os_wnl.includes('Others')) {
            this.ophthalmologist.slit_lamp_exam.palperbral.os_wnl_other = slitLampData.palperbral.os_wnl_other;
          }

          // Populate Cornea data
          this.ophthalmologist.slit_lamp_exam.cornea.od_wnl = convertToArray(slitLampData.cornea.od_wnl);
          this.ophthalmologist.slit_lamp_exam.cornea.os_wnl = convertToArray(slitLampData.cornea.os_wnl);


          if (this.ophthalmologist.slit_lamp_exam.cornea.od_wnl.includes('Others')) {
            this.ophthalmologist.slit_lamp_exam.cornea.od_wnl_other = slitLampData.cornea.od_wnl_other;
          }
          if (this.ophthalmologist.slit_lamp_exam.cornea.os_wnl.includes('Others')) {
            this.ophthalmologist.slit_lamp_exam.cornea.os_wnl_other = slitLampData.cornea.os_wnl_other;
          }

          // Populate A/C data
          this.ophthalmologist.slit_lamp_exam.ac.od_wnl = convertToArray(slitLampData.ac.od_wnl);
          this.ophthalmologist.slit_lamp_exam.ac.os_wnl = convertToArray(slitLampData.ac.os_wnl);

          if (this.ophthalmologist.slit_lamp_exam.ac.od_wnl.includes('Others')) {
            this.ophthalmologist.slit_lamp_exam.ac.od_wnl_other = slitLampData.ac.od_wnl_other;
          }
          if (this.ophthalmologist.slit_lamp_exam.ac.os_wnl.includes('Others')) {
            this.ophthalmologist.slit_lamp_exam.ac.os_wnl_other = slitLampData.ac.os_wnl_other;
          }


          // Populate Pupil data
          this.ophthalmologist.slit_lamp_exam.pupil.od_wnl = convertToArray(slitLampData.pupil.od_wnl);
          this.ophthalmologist.slit_lamp_exam.pupil.os_wnl = convertToArray(slitLampData.pupil.os_wnl);

          if (this.ophthalmologist.slit_lamp_exam.pupil.od_wnl.includes('Others')) {
            this.ophthalmologist.slit_lamp_exam.pupil.od_wnl_other = slitLampData.pupil.od_wnl_other;
          }
          if (this.ophthalmologist.slit_lamp_exam.pupil.os_wnl.includes('Others')) {
            this.ophthalmologist.slit_lamp_exam.pupil.os_wnl_other = slitLampData.pupil.os_wnl_other;
          }

          // Populate Lens data
          this.ophthalmologist.slit_lamp_exam.lens.od_wnl = convertToArray(slitLampData.lens.od_wnl);
          this.ophthalmologist.slit_lamp_exam.lens.os_wnl = convertToArray(slitLampData.lens.os_wnl);
          console.log("slitLampData.lens")

          console.log(slitLampData.lens)
          // Populate Lens  posterior_sub_caspular_type data
          // Access these fields from the root level of slitLampData as shown in the JSON output
          this.ophthalmologist.slit_lamp_exam.lens.posterior_sub_caspular_type.od_wnl = convertToArray(slitLampData.lens.posterior_sub_caspular_type?.od_wnl || []);
          this.ophthalmologist.slit_lamp_exam.lens.posterior_sub_caspular_type.os_wnl = convertToArray(slitLampData.lens.posterior_sub_caspular_type?.os_wnl || []);

          this.ophthalmologist.slit_lamp_exam.lens.cortical_cataract_type.od_wnl = convertToArray(slitLampData.lens.cortical_cataract_type?.od_wnl || []);
          this.ophthalmologist.slit_lamp_exam.lens.cortical_cataract_type.os_wnl = convertToArray(slitLampData.lens.cortical_cataract_type?.os_wnl || []);

          this.ophthalmologist.slit_lamp_exam.lens.psc_cortical_cataract_type.od_wnl = convertToArray(slitLampData.lens.psc_cortical_cataract_type?.od_wnl || []);
          this.ophthalmologist.slit_lamp_exam.lens.psc_cortical_cataract_type.os_wnl = convertToArray(slitLampData.lens.psc_cortical_cataract_type?.os_wnl || []);


          if (this.ophthalmologist.slit_lamp_exam.lens.od_wnl.includes('Others')) {
            this.ophthalmologist.slit_lamp_exam.lens.od_wnl_other = slitLampData.lens.od_wnl_other;
          }
          if (this.ophthalmologist.slit_lamp_exam.lens.os_wnl.includes('Others')) {
            this.ophthalmologist.slit_lamp_exam.lens.os_wnl_other = slitLampData.lens.os_wnl_other;
          }

          // Populate Vitreous OD and OS
          this.ophthalmologist.slit_lamp_exam.vitreous.od_wnl = convertToArray(slitLampData.vitreous?.od_wnl);
          this.ophthalmologist.slit_lamp_exam.vitreous.os_wnl = convertToArray(slitLampData.vitreous?.os_wnl);

          if (this.ophthalmologist.slit_lamp_exam.vitreous.od_wnl.includes('Others')) {
            this.ophthalmologist.slit_lamp_exam.vitreous.od_wnl_other = slitLampData.vitreous?.od_wnl_other || '';
          }
          if (this.ophthalmologist.slit_lamp_exam.vitreous.os_wnl.includes('Others')) {
            this.ophthalmologist.slit_lamp_exam.vitreous.os_wnl_other = slitLampData.vitreous?.os_wnl_other || '';
          }

          // Populate Lids data
          this.ophthalmologist.slit_lamp_exam.lids.od_wnl = convertToArray(slitLampData.lids?.od_wnl);
          this.ophthalmologist.slit_lamp_exam.lids.os_wnl = convertToArray(slitLampData.lids?.os_wnl);
          this.ophthalmologist.slit_lamp_exam.lids.od_wnl_other = slitLampData.lids?.od_wnl_other || '';
          this.ophthalmologist.slit_lamp_exam.lids.os_wnl_other = slitLampData.lids?.os_wnl_other || '';

          // Populate C/D Ratio data
          this.ophthalmologist.slit_lamp_exam.cd_ratio.od_wnl = convertToArray(slitLampData.cd_ratio?.od_wnl);
          this.ophthalmologist.slit_lamp_exam.cd_ratio.os_wnl = convertToArray(slitLampData.cd_ratio?.os_wnl);

          // Populate Nerve Fiber Layer data
          this.ophthalmologist.slit_lamp_exam.nerve_fiber_layer.od_wnl = convertToArray(slitLampData.nerve_fiber_layer?.od_wnl);
          this.ophthalmologist.slit_lamp_exam.nerve_fiber_layer.os_wnl = convertToArray(slitLampData.nerve_fiber_layer?.os_wnl);

          // Populate Macula data
          this.ophthalmologist.slit_lamp_exam.macula.od_wnl = convertToArray(slitLampData.macula?.od_wnl);
          this.ophthalmologist.slit_lamp_exam.macula.os_wnl = convertToArray(slitLampData.macula?.os_wnl);
          this.ophthalmologist.slit_lamp_exam.macula.od_wnl_other = slitLampData.macula?.od_wnl_other || '';
          this.ophthalmologist.slit_lamp_exam.macula.os_wnl_other = slitLampData.macula?.os_wnl_other || '';


          // Populate Iris data
          this.ophthalmologist.slit_lamp_exam.iris.od_wnl = convertToArray(slitLampData.iris?.od_wnl);
          this.ophthalmologist.slit_lamp_exam.iris.os_wnl = convertToArray(slitLampData.iris?.os_wnl);
          this.ophthalmologist.slit_lamp_exam.iris.od_wnl_other = slitLampData.iris?.od_wnl_other || '';
          this.ophthalmologist.slit_lamp_exam.iris.os_wnl_other = slitLampData.iris?.os_wnl_other || '';


          // Populate Periphery data
          this.ophthalmologist.slit_lamp_exam.periphery.od_wnl = convertToArray(slitLampData.periphery?.od_wnl);
          this.ophthalmologist.slit_lamp_exam.periphery.os_wnl = convertToArray(slitLampData.periphery?.os_wnl);

          // Handle 'Others' input for Periphery
          this.ophthalmologist.slit_lamp_exam.periphery.od_wnl_other = slitLampData.periphery?.od_wnl_other || '';
          this.ophthalmologist.slit_lamp_exam.periphery.os_wnl_other = slitLampData.periphery?.os_wnl_other || '';

          // Handle clock selection if applicable
          this.ophthalmologist.slit_lamp_exam.periphery.od_wnl_clock = slitLampData.periphery?.od_wnl_clock || null;
          this.ophthalmologist.slit_lamp_exam.periphery.os_wnl_clock = slitLampData.periphery?.os_wnl_clock || null;

          console.log(slitLampData);
        }

      }catch (error) {
        console.error('Error fetching slit lamp data:', error);
      }
    },

    async fetchNotes() {
      try {
        const params = {
          visit_id: this.$route.params.visitId, // Getting visitId from the route params
        };
        // Assuming this.ophthalmologist.fetchNotes is an API call that takes params
        const response = await this.ophthalmologist.fetchNotes(params);

        // Check if the response has the expected structure
        if (response) {
          this.ophthalmologist.notes.diagnosis =  response.diagnosis
              ? JSON.parse(response.diagnosis)
              : [];
          this.ophthalmologist.notes.treatment_plan = response.treatment_plan || '';

        } else {
          console.warn('No notes found in the response', response);
        }
      } catch (error) {
        console.error('Error fetching slit lamp data:', error);
      }
    }

  },

  mounted() {
    this.ophthalmologist.visit_id = this.$route.params.visitId;

    this.init();
    this.fetchSlitLampData()
    this.fetchNotes()
  },
};
</script>

<style scoped>
textarea {
  padding: 0 10px;
  margin: 3px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.v-input--selection-controls {
  margin-top: 0;
  padding-top: 0;
}

input {
  padding: 0 10px;
  margin: 3px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
select {
  padding: 0 10px;
  margin: 3px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.inline-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

h6 {
  margin: 0;
}

.el-label {
  margin: 0 10px;
}

.flex-container {
  display: flex;
}

.group-header {
  font-weight: bold;
  width: 150px;
}
.group-header-iop {
  font-weight: bold;
  width: 150px;
  display: flex;
}
input {
  font-weight: bold;
}
/*span {font-weight:bold;}*/
textarea {
  font-weight: bold;
}
v-switch {
  font-weight: bold;
}
/*label {font-weight:bold;}*/
.spans {
  font-weight: bold;
}
</style>
