 <template>
    <div>
      <maternity-report-filters :obj="obj" @filter="performFilter" @export="exportToExcel"></maternity-report-filters>

      <v-card>
            <v-card-title height="23">
              <h4>Maternity Report</h4>
            </v-card-title>
            <div class="container">
              <table class="maternity-report-table">
                <thead>
                  <tr>
                    <th>PARTICULARS</th>
                    <th v-for="month in months" :key="month.key">{{ month.label }}</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in formattedData" :key="index">
                    <td>{{ row.particular }}</td>
                    <td v-for="month in months" :key="month.key">{{ row.monthly[month.key] }}</td>
                    <td>{{ row.total }}</td>
                  </tr>

                </tbody>
              </table>
            </div>

            <div class="container">
                <h4 style="margin-top: 30px;">Admissions by Whom</h4>
                <table class="maternity-report-table">
                  <thead>
                    <tr>
                      <th>PARTICULARS</th>
                      <th v-for="month in months" :key="month.key">{{ month.label }}</th>
                      <th>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, index) in formattedByWhom" :key="'by-whom-' + index">
                      <td>{{ row.particular }}</td>
                      <td v-for="month in months" :key="month.key">{{ row.monthly[month.key] }}</td>
                      <td>{{ row.total }}</td>
                    </tr>
                  </tbody>
                </table>
            </div>

          </v-card>
      </div>
</template>

  <script>
  import axios from 'axios';
  import * as XLSX from 'xlsx';
  import { saveAs } from 'file-saver';
  import Filters from './Filters';
  import { reportsMixin } from "@reports/libs/reportsMixin";

  export default {
    name: 'MaternityPlainReport',
    mixins: [
      reportsMixin,
    ],
    components: {
      "maternity-report-filters": Filters,
    },
    data() {
      return {
        months: [
        { key: 'jan', label: 'January' },
        { key: 'feb', label: 'February' },
        { key: 'mar', label: 'March' },
        { key: 'apr', label: 'April' },
        { key: 'may', label: 'May' },
        { key: 'jun', label: 'June' },
        { key: 'jul', label: 'July' },
        { key: 'aug', label: 'August' },
        { key: 'sep', label: 'September' },
        { key: 'oct', label: 'October' },
        { key: 'nov', label: 'November' },
        { key: 'dec', label: 'December' }
      ],
        rawData: [],
        rawByWhom: [],
        page: 1,
        labelMap: {
          total_deliveries: 'Deliveries',
          normal_deliveries: 'Normal Deliveries',
          caesarian_sections: 'Caesarian Section',
          elective_cs: 'Elective C/S',
          emergency_cs: 'Emergency C/S',
          doctor_assisted: 'Doctor Assisted Deliveries',
          midwife_assisted: 'Midwife Assisted Deliveries',
          vacuum_deliveries: 'Vacuum Deliveries',
          breech_deliveries: 'Breech Deliveries',
          epidural: 'Epidural Anaesthesia',
          pre_eclampsia: 'Pre Eclampsia',
          aph: 'APH',
          vbac: 'VBAC',
          lamaz_classes: 'LAMAZ CLASSES',
          pph: 'PPH',
        }
      };
    },

    computed: {
      formattedData() {
        return this.rawData.map(row => {
          const formattedRow = {
            particular: row.particular,
            total: parseInt(row.total) || 0,
            monthly: {}
          };
          this.months.forEach(month => {
            formattedRow.monthly[month.key] = parseInt(row[month.key]) || 0;
          });
          return formattedRow;
        });
      },
      formattedByWhom() {
        return this.rawByWhom.map(row => {
          const formattedRow = {
            particular: row.particular,
            total: parseInt(row.total) || 0,
            monthly: {}
          };
          this.months.forEach(month => {
            formattedRow.monthly[month.key] = parseInt(row[month.key]) || 0;
          });
          return formattedRow;
        });
      },

    },

    watch: {
      page() {
        this.fetchData();
      }
    },

    mounted() {
      this.fetchData();
    },

    methods: {
      async fetchData() {
        await axios.get(`/api/reports/fetch-maternity-report?page=${this.page}`)
          .then(response => {
            this.rawData = response.data.maternity_summary || [];
            this.rawByWhom = response.data.by_whom_summary || [];

          })
          .catch(error => {
            console.error('Fetch maternity error:', error);
          });
      },
      exportToExcel() {
      const wb = XLSX.utils.book_new();

      const summarySheetData = [
        ['PARTICULARS', ...this.months.map(m => m.label), 'TOTAL'],
        ...this.formattedData.map(row => [
          row.particular,
          ...this.months.map(m => row.monthly[m.key]),
          row.total
        ])
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(summarySheetData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Maternity Summary');

      const byWhomSheetData = [
        ['PARTICULARS', ...this.months.map(m => m.label), 'TOTAL'],
        ...this.formattedByWhom.map(row => [
          row.particular,
          ...this.months.map(m => row.monthly[m.key]),
          row.total
        ])
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(byWhomSheetData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Deliveries by Whom');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'Maternity_Report.xlsx');
    },
       performFilter() {
    const date = this.obj.filters.date;

         const queryParams = new URLSearchParams({
           page: this.page,
           date
         }).toString();
         fetch(`/api/reports/fetch-maternity-report?${queryParams}`)
             .then(response => response.json())
             .then(data => {
               this.rawData = data.maternity_summary || [];
               this.rawByWhom = data.by_whom_summary || [];
             })
             .catch(error => {
               console.error('API error:', error);
             });


  }
    }
  };
  </script>

  <style scoped>
  .maternity-report-table {
    width: 100%;
    border-collapse: collapse;
  }
  .maternity-report-table th,
  .maternity-report-table td {
    border: 1px solid #ccc;
    padding: 6px 10px;
    text-align: center;
  }
  .maternity-report-table th {
    background-color: #f0f0f0;
  }
  .pagination {
    margin-top: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  </style>
