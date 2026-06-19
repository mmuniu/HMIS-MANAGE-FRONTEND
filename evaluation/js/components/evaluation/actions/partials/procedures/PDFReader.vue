<template>
  <div>
    <v-card>
      <v-card-title class="headline primary" primary-title>
        <span class="font-weight-bold white--text">PDF Viewer</span>
        <v-btn icon dark @click.native="pdfReadStatus = false" absolute right>
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>
<v-card-text style="overflow-y: auto; max-height: 500px;">
  <pdf :src="pdfUrl"></pdf>
</v-card-text>
    </v-card>
  </div>
</template>

<script>
import pdf from "vue-pdf";

export default {
  components: { pdf },
  data() {
    return {
      showModal: false,
      pdfUrl: "/Deck.pdf", // Change this to your PDF path
    };
  },
};
</script>

<style>
/* Basic Modal Styling */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  width: 80%;
  max-width: 800px;
  height: 80%;
  overflow: auto;
}
</style>
