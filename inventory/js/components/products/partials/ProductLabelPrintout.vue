<template>
  <v-dialog v-model="internalShow" max-width="420" persistent>
    <v-card class="pa-2">
      <v-card-title class="py-1 d-flex align-center justify-space-between">
        <span>Product Label Preview</span>
        <v-spacer></v-spacer>
        <v-btn icon small @click="close">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <!-- Printable Area -->
        <div id="printable-label" class="label-paper">
          <div class="label-content">
            <div class="product-name">{{ productName }}</div>
            <div class="product-price" v-if="hasPrice">{{ formattedPrice }}</div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer></v-spacer>
        <v-btn small color="primary" @click="printLabel">
          <v-icon left>fa-print</v-icon>
          Print
        </v-btn>
        <v-btn small color="secondary" class="ml-2" @click="printAllLabels" :disabled="!allItemsToPrint.length">
          <v-icon left>fa-print</v-icon>
          Print All
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'product-label-printout',
  props: {
    show: { type: Boolean, default: false },
    product: { type: Object, required: true },
    products: { type: Array, default: () => [] }, // Optional list for printing multiple labels
    logo: { type: String, default: null },
    currency: { type: String, default: 'KES' },
    autoPrint: { type: Boolean, default: false },
  },
  data() {
    return {
      internalShow: this.show,
    };
  },
  computed: {
    productName() {
      return (this.product && (this.product.name || this.product.item_name)) || '';
    },
    // Try common price fields used in product forms
    priceValue() {
      const p = this.product || {};
      return p.discount_price || p.selling_price || p.price || p.retail_price || null;
    },
    hasPrice() {
      return this.priceValue !== null && this.priceValue !== undefined && this.priceValue !== '';
    },
    formattedPrice() {
      try {
        const val = Number(this.priceValue);
        if (isNaN(val)) return `${this.currency} ${this.priceValue}`;
        const intVal = Math.round(val);
        const formatted = (typeof intVal.toLocaleString === 'function') ? intVal.toLocaleString() : String(intVal);
        return `${this.currency} ${formatted}`;
      } catch (e) {
        return `${this.currency} ${this.priceValue}`;
      }
    },
    logoUrl() {
      // Priority: explicit prop -> global setting if available -> fallback path
      return (
          this.logo ||
          (window.App && window.App.settings && window.App.settings.logo_url) ||
          (window.collabSettings && window.collabSettings.logo_url) ||
          '/images/logo.png'
      );
    },
    allItemsToPrint() {
      // If an explicit products array is provided, use it; otherwise default to single product if present
      if (Array.isArray(this.products) && this.products.length) return this.products;
      return this.product ? [this.product] : [];
    },
  },
  watch: {
    show(val) {
      this.internalShow = val;
      if (val && this.autoPrint) {
        this.$nextTick(() => this.printLabel());
      }
    },
    internalShow(val) {
      if (!val) this.$emit('update:show', false);
    },
  },
  methods: {
    close() {
      this.internalShow = false;
      this.$emit('close');
    },
    printLabel() {
      // Clone printable area to a new window to keep print styles isolated
      const printable = document.getElementById('printable-label');
      if (!printable) return;

      const w = window.open('', '_blank', 'width=420,height=600');
      if (!w) return;

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Label</title>
  <style>
    ${this.inlineStyles()}
  </style>
</head>
<body>
  ${printable.outerHTML}
  <script>
    window.onload = function(){
      window.focus();
      window.print();
      setTimeout(function(){ window.close(); }, 300);
    };
  <\/script>
</body>
</html>`;

      w.document.open();
      w.document.write(html);
      w.document.close();
    },
    printAllLabels() {
      const items = this.allItemsToPrint;
      if (!items.length) return;
      const w = window.open('', '_blank', 'width=420,height=800');
      if (!w) return;

      const labelsHTML = items
          .map((it, idx) => {
            const name = (it && (it.name || it.item_name)) || '';
            const priceRaw = it && (it.discount_price || it.selling_price || it.price || it.retail_price);
            const hasPrice = priceRaw !== null && priceRaw !== undefined && priceRaw !== '';
            let priceText = '';
            if (hasPrice) {
              const val = Number(priceRaw);
              priceText = isNaN(val) ? `${this.currency} ${priceRaw}` : `${this.currency} ${val.toFixed(0)}`;
            }
            return `
            <div class="label-block">
              <div class="label-paper">
                <div class="label-content">
                  <div class="product-name">${this.escapeHtml(name)}</div>
                  ${hasPrice ? `<div class="product-price">${this.escapeHtml(priceText)}</div>` : ''}
                </div>
              </div>
            </div>`;
          })
          .join('\n');

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Product Labels</title>
  <style>
    ${this.inlineStyles(true)}
  </style>
</head>
<body>
  ${labelsHTML}
  <script>
    window.onload = function(){
      window.focus();
      window.print();
      setTimeout(function(){ window.close(); }, 400);
    };
  <\/script>
</body>
</html>`;

      w.document.open();
      w.document.write(html);
      w.document.close();
    },
    inlineStyles(isBatch = false) {
      // Basic 58mm label (thermal) friendly styles
      return `
      @page { size: 58mm auto; margin: 3mm; }
      body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: black !important; }
      .label-paper { width: 100%; text-align: center; color: black !important; }
      .label-content { padding: 0 4px; color: black !important; }
      .product-name {
        font-size: 14px;
        font-weight: 700;
        line-height: 1.05;
        margin: 0; /* tight to the top edge */
        word-break: break-word;
        color: black !important;
      }
      .product-price {
        font-size: 24px;   /* Bigger than product name */
        font-weight: 800;
        line-height: 1.0;
        margin: 0; /* reduce space between name and price */
        color: black !important;
      }
      .label-block { page-break-inside: avoid; break-inside: avoid; }
      ${isBatch ? '.label-block + .label-block { page-break-before: always; margin-top: 6mm; }' : ''}

      @media print {
        .label-paper { width: 100%; }
      }
      `;
    },
    escapeHtml(text) {
      if (text === null || text === undefined) return '';
      return String(text)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
    },
  },
};
</script>

<style scoped>
.label-paper {
  border: 1px dashed #ddd;
  border-radius: 4px;
  padding: 6px;
  color: black !important;
}
.product-name { text-align: center; color: black !important; font-size: 18px; line-height: 1.1; margin-bottom: 0; }
.product-price { text-align: center; color: black !important; font-size: 24px; font-weight: 800; line-height: 1.0; margin-top: 0; }
</style>
