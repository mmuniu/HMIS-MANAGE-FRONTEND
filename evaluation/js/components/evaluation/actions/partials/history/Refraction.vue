<!-- RefractionExam.vue -->
<template>
    <div>


     <!-- Subjective Refraction -->
<div class="p-4">
  <h2 class="font-bold text-lg underline">Subjective Refraction</h2>

  <table class="table table-bordered text-center">
    <thead class="table-light">
      <tr>
        <th></th>
        <th>Sphere</th>
        <th>Cylinder</th>
        <th>Axis</th>
        <th>BCVA</th>
        <th>Duochrome</th>
        <th>Near Add</th>
        <th>Prism Horizontal</th>
        <th>Base Direction</th>
        <th>Prism Vertical</th>
        <th>Base Direction</th>
      </tr>
    </thead>
    <tbody>
      <template v-for="(subjective, index) in items.subjective?.data || []" >
        <!-- RE (Right Eye) -->
        <tr :key="index">
          <td class="fw-bold">RE:</td>
          <td><input disabled type="text" class="form-control" v-model="subjective.right.sphere"></td>
          <td><input disabled type="text" class="form-control" v-model="subjective.right.cylinder"></td>
          <td><input disabled type="text" class="form-control" v-model="subjective.right.axis"></td>
          <td><input disabled type="text" class="form-control" v-model="subjective.right.bcva"></td>
          <td>
            <div class="d-flex justify-content-center">
              <input disabled type="checkbox" class="form-check-input me-2" v-model="subjective.right.duochrome" :checked="subjective.right.duochrome === 'red'" value="red">
              <input disabled type="checkbox" class="form-check-input" v-model="subjective.right.duochrome" :checked="subjective.right.duochrome === 'green'" value="green">
            </div>
          </td>
          <td><input disabled type="text" class="form-control" v-model="subjective.right.near_add"></td>
          <td><input disabled type="text" class="form-control" v-model="subjective.right.prism_horizontal"></td>
          <td><input disabled type="text" class="form-control" v-model="subjective.right.horizontal_base_direction"></td>
          <td><input disabled type="text" class="form-control" v-model="subjective.right.prism_vertical"></td>
          <td><input disabled type="text" class="form-control" v-model="subjective.right.vertical_base_direction"></td>
        </tr>
  
        <!-- LE (Left Eye) -->
        <tr>
          <td class="fw-bold">LE:</td>
          <td><input disabled type="text" class="form-control" v-model="subjective.left.sphere"></td>
          <td><input disabled type="text" class="form-control" v-model="subjective.left.cylinder"></td>
          <td><input disabled type="text" class="form-control" v-model="subjective.left.axis"></td>
          <td><input disabled type="text" class="form-control" v-model="subjective.left.bcva"></td>
          <td>
            <div class="d-flex justify-content-center">
              <div
                class="shaded-checkbox me-2"
                v-if="subjective.right.duochrome === 'red'"
              ></div>
              <div
                class="shaded-checkbox"
                v-if="subjective.right.duochrome === 'green'"
              ></div>
            </div>
          </td>
          <td><input disabled type="text" class="form-control" v-model="subjective.left.near_add"></td>
          <td><input disabled type="text" class="form-control" v-model="subjective.left.prism_horizontal"></td>
          <td><input disabled type="text" class="form-control" v-model="subjective.left.horizontal_base_direction"></td>
          <td><input disabled type="text" class="form-control" v-model="subjective.left.prism_vertical"></td>
          <td><input disabled type="text" class="form-control" v-model="subjective.left.vertical_base_direction"></td>
        </tr>
  
        <!-- OU (Both Eyes) -->
        <tr>
          <td class="fw-bold">OU:</td>
          <td colspan="3"></td> <!-- Empty cells for Sphere, Cylinder, and Axis -->
          <td><input disabled type="text" class="form-control" v-model="subjective.ou.bcva"></td>
          <td>
            <div class="d-flex justify-content-center">
              <input disabled type="checkbox" class="form-check-input me-2" v-model="subjective.ou.duochrome" :checked="subjective.ou.duochrome === 'red'" value="red">
              <input disabled type="checkbox" class="form-check-input" v-model="subjective.ou.duochrome" :checked="subjective.ou.duochrome === 'green'" value="green">
            </div>
          </td>
          <td colspan="5"></td> <!-- Empty cells for Near Add, Prism, and Base Direction -->
        </tr>
      </template>
    </tbody>
  </table>
  
</div>

<!-- Objective Refraction -->
<div class="p-4">
  <h2 class="font-bold text-lg underline">Objective Refraction</h2>

  <div class="mb-3">
      <h6 class="fw-bold">Retinoscopy:</h6>
      <div class="form-check form-check-inline">
          <input disabled class="form-check-input" type="radio" v-model="items.objective_refraction.retinoscopy.type" value="dry">
          <label class="form-check-label">Dry</label>
      </div>
      <div class="form-check form-check-inline">
          <input disabled class="form-check-input" type="radio" v-model="items.objective_refraction.retinoscopy.type" value="wet">
          <label class="form-check-label">Wet</label>
      </div>
  </div>

  <div v-if="items.objective_refraction.retinoscopy.type === 'wet'" class="mb-3">
      <label class="text-muted">Please select the wet type:</label>
      <select v-model="items.objective_refraction.retinoscopy.wet_type" class="form-select w-auto">
          <option>Cyclogel</option>
          <option>Cyclogel + Atropine</option>
          <option>Atropine</option>
          <option>Tropicamide</option>
      </select>
  </div>

  <div class="table-responsive">
      <table class="table table-bordered text-center">
          <thead class="table-light">
              <tr>
                  <th></th>
                  <th>Sphere</th>
                  <th>Cylinder</th>
                  <th>Axis</th>
              </tr>
          </thead>
          <tbody>
              <tr>
                  <td class="fw-bold">RE:</td>
                  <td><input disabled type="text" class="form-control" v-model="items.objective_refraction.retinoscopy.right.sphere"></td>
                  <td><input disabled type="text" class="form-control" v-model="items.objective_refraction.retinoscopy.right.cylinder"></td>
                  <td><input disabled type="text" class="form-control" v-model="items.objective_refraction.retinoscopy.right.axis"></td>
              </tr>
              <tr>
                  <td class="fw-bold">LE:</td>
                  <td><input disabled type="text" class="form-control" v-model="items.objective_refraction.retinoscopy.left.sphere"></td>
                  <td><input disabled type="text" class="form-control" v-model="items.objective_refraction.retinoscopy.left.cylinder"></td>
                  <td><input disabled type="text" class="form-control" v-model="items.objective_refraction.retinoscopy.left.axis"></td>
              </tr>
          </tbody>
      </table>
  </div>
</div>

    
          <!-- eye wear processing -->
          <div class="p-4">
            <h2 class="text-lg font-weight-bold pl-3">Optical Prescription</h2>
            <div class="table-responsive">
              <table class="table table-bordered text-center mt-3">
                <thead class="thead-dark">
                  <tr>
                    <th></th>
                    <th>Sphere</th>
                    <th>Cylinder</th>
                    <th>Axis</th>
                    <th>Near Add</th>
                    <th>Prism Horizontal</th>
                    <th>Base Direction</th>
                    <th>Prism Vertical</th>
                    <th>Base Direction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="eye in ['right', 'left']" :key="eye">
                    <td class="font-weight-bold">{{ eye === 'right' ? 'RE:' : 'LE:' }}</td>
                    <td><input disabled type="text" class="form-control" v-model="items.eyewear_prescription[eye].sphere" /></td>
                    <td><input disabled type="text" class="form-control" v-model="items.eyewear_prescription[eye].cylinder" /></td>
                    <td><input disabled type="text" class="form-control" v-model="items.eyewear_prescription[eye].axis" /></td>
                    <td><input disabled type="text" class="form-control" v-model="items.eyewear_prescription[eye].near_add" /></td>
                    <td><input disabled type="text" class="form-control" v-model="items.eyewear_prescription[eye].prism_horizontal" /></td>
                    <td><input disabled type="text" class="form-control" v-model="items.eyewear_prescription[eye].horizontal_base_direction" /></td>
                    <td><input disabled type="text" class="form-control" v-model="items.eyewear_prescription[eye].prism_vertical" /></td>
                    <td><input disabled type="text" class="form-control" v-model="items.eyewear_prescription[eye].vertical_base_direction" /></td>
                  </tr>
                  <tr>
                    <td class="font-weight-bold">Ou:</td>
                    <td colspan="3"></td>
                    <td><input disabled type="text" class="form-control" v-model="items.eyewear_prescription.ou.near_add" /></td>
                    <td colspan="4"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
     
  
    </div>
  </template>
  
  <script>
  export default {
    name: "RefractionExam",
    props: {
      items: {
        type: Object,
        default: () => ({}),
      },
    },
    data() {
      return {
        refractionHeaders: [
          "Sphere",
          "Cylinder",
          "Axis",
          "BCVA",
          "Duochrome",
          "Near add",
          "Prism Horizontal",
          "Base direction",
          "Prism Vertical",
          "Base direction",
        ],
        fields: ['sphere', 'cylinder', 'axis', 'near_add', 'prism_horizontal', 'horizontal_base_direction', 'prism_vertical', 'vertical_base_direction'],

      };
    },
  };
  </script>
  
  <style scoped>
  .flex-container {
    display: flex;
    flex-wrap: wrap;
  }
  .group-header {
    width: 10%;
    font-weight: bold;
  }


  .shaded-checkbox {
    background-color: #d3d3d3; /* Light grey shading */
    border-radius: 4px;
    width: 20px;
    height: 20px;
    display: inline-block;
  }

</style>
  