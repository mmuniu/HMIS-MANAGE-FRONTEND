<template>
  <v-btn class="v-btn v-btn--small theme--light primary" @click="exportPdf" target="_blank">Pdf</v-btn>
</template>
<script>
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default {

  props: {
    headers: {
      type: Array,
    },
    data: {
      type: Array,
    },
    filename: {
      type: String,
    },
    title: {
      type: String,
    },
    extratitle: {
      type: Object,
    },

  },

  methods: {
    exportPdf() {
      const header = this.filename;
      const doc = new jsPDF('p', 'pt');

      // Define the lines of text for the report headers
      let startY = 0;
      let totalHeight = 0;
      let lineHeight = 0;

      if (this.extratitle) {
        const facilityText = this.extratitle.facility ? `(${this.extratitle.facility})` : '';
        const cashierText = this.extratitle.cashier ? `(${this.extratitle.cashier})` : '';

        const reportHeaders = [
          this.extratitle.main_facility_title || '', // Include main facility name if it exists, otherwise an empty string
          'Cashiers summary report',
          `For all facilities ${facilityText}`,
          `For all cashiers ${cashierText}`,
          `For the period ${this.extratitle.start_date} to ${this.extratitle.end_date}`,
        ];
        // Calculate line height and total height of all report headers
        lineHeight = 20; // Adjust as needed
        totalHeight = reportHeaders.length * lineHeight;

        // Calculate the vertical position to center the report headers on the page
        startY = 50;

        // Add each line of the report headers to the PDF
        reportHeaders.forEach((line, index) => {
          const textWidth = doc.getStringUnitWidth(line) * doc.internal.getFontSize();
          const x = (doc.internal.pageSize.width - textWidth) / 2;
          const y = startY + index * lineHeight;
          doc.setFontSize(13);
          if (index === 0) {
            doc.setFontStyle('bold');
            doc.text(`${this.extratitle.facility}`, x, y);
            // doc.setFontStyle('normal');
            // doc.text('Cashiers summary report', x, y + lineHeight);
          } else {
            doc.setFontStyle('normal');
            doc.text(line, x, y);
          }
        });
      }

      // Add regular title headers
      const title = [];
      this.headers.forEach((d) => {
        title.push(d.text);
      });

      // Extract data and calculate total amount
      const bd = this.data.map(function(obj) {
        return Object.keys(obj).map(function(key) {
          return obj[key];
        });
      });


      // Calculate total amount
      const totalAmount = bd.reduce((total, current) => total + parseFloat(current[1].replace(',', '')), 0); // Assuming the amount is always in the second position

      // Append total row to data
      const totalRow = ['Total', totalAmount.toFixed(2), '']; // Assuming the amount is always in the second position
      bd.push(totalRow);


      // Generate PDF with table
      doc.autoTable(title, bd, {
        startY: startY + totalHeight + 20, // Add spacing below the report headers
        style: { fillColor: [100, 255, 255] },
        columnStyles: {
          id: { fillColor: 255 },
        },
        margin: { top: 60 },
        didDrawPage: (data) => {
          doc.setFont('times');
          doc.setFontSize(13);
          doc.text('', 190, 30);
        },
      });

      // Save PDF
      doc.save(this.filename + '.pdf');
    },


  },
};
</script>
