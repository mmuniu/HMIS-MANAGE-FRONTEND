<template>
  <div>
    <h5 class="text-h5" style="font-weight: bold; text-decoration: underline">Preliminary Exam</h5>

    <!-- Visual Acuity Section -->
     <!-- Visual Acuity Section -->
  <div class="row">
    <div class="col-lg-12">
      <span>Visual Acuity:</span>
    </div>
    <div class="col-lg-12">
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Type</th>
            <th>Eye</th>
            <th>History</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(category, categoryKey) in categories">
            <template v-if="items[categoryKey]">
              <tr v-for="eye in ['right', 'left', 'ou']" :key="`${categoryKey}-${eye}`">
                <!-- Category Name (Merged Cell) -->
                <td v-if="eye === 'right'" :rowspan="3">{{ category.title }}</td>

                <!-- Eye Type -->
                <td>{{ formatEye(eye) }}</td>

                <!-- Visual Acuity Value -->
                <td>{{ items[categoryKey][eye] || '-' }}</td>
              </tr>
            </template>
          </template>
        </tbody>

      </table>
    </div>
  </div>


    <!-- Autorefraction Section -->
    <div class="row">
      <div class="col-lg-12">
        <span>Autorefraction:</span>
      </div>
      <div class="col-lg-12">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Eye</th>
              <th>Sphere</th>
              <th>Cylinder</th>
              <th>Axis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Right Eye (RE)</td>
              <td>{{ items.autorefraction?.right?.sphere || '-' }}</td>
              <td>{{ items.autorefraction?.right?.cylinder || '-' }}</td>
              <td>{{ items.autorefraction?.right?.axis || '-' }}</td>
            </tr>
            <tr>
              <td>Left Eye (LE)</td>
              <td>{{ items.autorefraction?.left?.sphere || '-' }}</td>
              <td>{{ items.autorefraction?.left?.cylinder || '-' }}</td>
              <td>{{ items.autorefraction?.left?.axis || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Present Glasses Section -->
    <div class="row">
      <div class="col-lg-12">
        <span>Present Glasses:</span>
      </div>
      <div class="col-lg-12">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Eye</th>
              <th>Sphere</th>
              <th>Cylinder</th>
              <th>Axis</th>
              <th>Near Add</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Right Eye (RE)</td>
              <td>{{ items.present_glasses?.right?.sphere || '-' }}</td>
              <td>{{ items.present_glasses?.right?.cylinder || '-' }}</td>
              <td>{{ items.present_glasses?.right?.axis || '-' }}</td>
              <td>{{ items.present_glasses?.right?.near_add || '-' }}</td>
            </tr>
            <tr>
              <td>Left Eye (LE)</td>
              <td>{{ items.present_glasses?.left?.sphere || '-' }}</td>
              <td>{{ items.present_glasses?.left?.cylinder || '-' }}</td>
              <td>{{ items.present_glasses?.left?.axis || '-' }}</td>
              <td>{{ items.present_glasses?.left?.near_add || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Intra-Ocular Pressure (IOP) Section -->
    <div class="row">
      <div class="col-lg-12">
        <span>Intra-Ocular Pressure - IOP:</span>
      </div>
      <div class="col-lg-12">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Eye</th>
              <th>I-Care (mm/Hg)</th>
              <th>Air-Puff (mm/Hg)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Right Eye (RE)</td>
              <td>{{ items.intra_ocular_pressure?.right?.i_care || '-' }}</td>
              <td>{{ items.intra_ocular_pressure?.right?.air_puff || '-' }}</td>
            </tr>
            <tr>
              <td>Left Eye (LE)</td>
              <td>{{ items.intra_ocular_pressure?.left?.i_care || '-' }}</td>
              <td>{{ items.intra_ocular_pressure?.left?.air_puff || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="row">
      <div class="col-lg-12">
        <span><strong>Nurse Notes History:</strong></span>
      </div>
      <div class="col-lg-12">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Nurse's Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ items.final || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  props: {
    items: Object

  },
  data() {
    return {
      categories: {
        unaided_va: { title: "Unaided VA" },
        aided_spectacles_va: { title: "Aided Spectacles VA" },
        aided_contact_va: { title: "Aided Contact VA" },
        unaided_near_va: { title: "Unaided Near VA" },
        aided_near_va: { title: "Aided Near VA" },
        pinhole_va: { title: "Aided Spectacles+CI" }
      }
    };
  },
  methods: {
    formatTitle(key) {
      return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    },
    formatEye(eye) {
      return eye === "right" ? "Right Eye (RE)" : eye === "left" ? "Left Eye (LE)" : "Both Eyes (OU)";
    }
  }
};
</script>

<style scoped>
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th, .table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.table th {
  background-color: #f2f2f2;
}
</style>
