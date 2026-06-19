<template>
  <div class="mt-4">
    <button @click="download('excel')"
      class="v-btn v-btn--small theme--light primary v-btn v-btn--contained theme--light v-size--default primary">
      Excel
    </button>
    <!-- 
    <button @click="download('pdf')"
      class="v-btn v-btn--small theme--light primary v-btn v-btn--contained theme--light v-size--default primary">
      Download PDF
    </button>
    <button @click="download('csv')"
      class="v-btn v-btn--small theme--light primary v-btn v-btn--contained theme--light v-size--default primary">
      Download CSV
    </button> -->

    <!-- Reusable Excel export component -->
    <download-excel ref="excel" :data="preparedData" :fields="excelFields" :name="`${reportTitle}.xlsx`"
      :worksheet="reportTitle"></download-excel>
  </div>
</template>

<script>
// import { saveAs } from 'file-saver';
// import jsPDF from 'jspdf';
import 'jspdf-autotable';
import JsonExcel from "vue-json-excel";

export default {
  name: 'DownloadReport',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    reportTitle: {
      type: String,
      default: 'Report'
    },
    totalRow: {   // Accept totalRow as a flat object
      type: Object,
      default: () => {}
    },
    excelFields: {  // Accept excelFields as a flat object
      type: Object,
      default: () => {}
    }
  },
  components: {
    downloadExcel: JsonExcel
  },
  computed: {
    // Prepare data for download, including the totalRow if it exists
    preparedData() {
      let data = Array.isArray(this.data) ? this.data : [];
      if (this.totalRow && Object.keys(this.totalRow).length > 0) {
        data.push(this.totalRow);  // Append totalRow if it exists
      }
      return data;
    }
  },
  methods: {
    // Download method to switch between file types
    download(type) {
      switch (type) {
        case 'excel':
          this.downloadExcelFile();
        //   break;
        // case 'pdf':
        //   this.downloadPdfFile();
        //   break;
        // case 'csv':
        //   this.downloadCsvFile();
        //   break;
        default:
          console.error('Unknown download type');
      }
    },

    // Method to handle Excel download
    downloadExcelFile() {
      this.$refs.excel.generate();  // Trigger Excel export via vue-json-excel component
    },

    // // Method to handle PDF download
    // downloadPdfFile() {
    //   const doc = new jsPDF();
    //   doc.setFontSize(18);
    //   doc.text(this.reportTitle, 14, 10);
    //   doc.setFontSize(12);

    //   const tableData = this.preparedData;
    //   doc.autoTable({
    //     head: [Object.values(this.excelFields)],  // Use excelFields values for the header
    //     body: tableData.map(row => Object.keys(this.excelFields).map(field => row[field] || '')),
    //     startY: 20,
    //   });

    //   const pdfFile = doc.output('blob');
    //   saveAs(pdfFile, `${this.reportTitle}.pdf`);
    // },

    // // Method to handle CSV download
    // downloadCsvFile() {
    //   const data = this.preparedData;
    //   const rows = data.map(row => Object.keys(this.excelFields).map(field => row[field] || ''));

    //   const headers = Object.values(this.excelFields).join(',');
    //   const csvContent = rows.map(row => row.join(',')).join('\n');
    //   const preparedCsv = `${headers}\n${csvContent}`;

    //   const csvFile = new Blob([preparedCsv], { type: 'text/csv;charset=utf-8;' });
    //   saveAs(csvFile, `${this.reportTitle}.csv`);
    // }
  }
};
</script>
