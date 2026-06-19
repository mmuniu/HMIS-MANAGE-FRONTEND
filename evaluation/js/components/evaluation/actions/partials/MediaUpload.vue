<template>
  <div>
    <vueDropzone ref="myVueDropzone" id="dropzone" :options="dropzoneOptions"></vueDropzone>
    <div class="opt-drawing-canvas">
      Canvas for Image Detailing
      <canvas id="drawCanvas" width="800" height="600" style="border:1px solid #000;"></canvas>
    </div>
    <div class="imageInputContainer">X
      <input type="file" id="ophthalmologyImageInput" accept="image/*" >
    </div>
    <div class="edit-button-container" v-if="uploaded">
      <button @click.prevent="saveOphthalmologyDrawingImage(canvas,visitId)" class="purple v-btn v-btn--is-elevated v-btn--has-bg theme--dark v-size--default primary">Save Image</button>
      <button id="undoOptButton" class="undo-opt-image-button purple v-btn v-btn--is-elevated v-btn--has-bg theme--dark v-size--default primary" @click.prevent="undoCanvas">Undo</button>
      <button id="redoOptButton" class="redo-opt-image-button purple v-btn v-btn--is-elevated v-btn--has-bg theme--dark v-size--default success" @click.prevent="redoCanvas">Redo</button>
    </div>
  </div>
</template>

<script>

import vue2Dropzone from 'vue2-dropzone';
import 'vue2-dropzone/dist/vue2Dropzone.min.css';
import { fabric } from 'fabric';
import Form from "@app/libs/Form";
import OphthalmologistObj from '@evaluation/libs/Ophthalmologist/Ophthalmologist';

export default {
  name: 'MediaUpload',
  components: {
    vueDropzone: vue2Dropzone,
  },
  props: {
    visitId: {
      type: String,
    },
  },

  data: function() {
    return {
      dropzoneOptions: {
        url: 'https://httpbin.org/post',
        thumbnailWidth: 150,
        maxFilesize: 0.5,
        headers: { 'My-Awesome-Header': 'header value' },
      },
      canvas:null,
      uploaded:false,
      undoCanvasStack: [],
      redoCanvasStack: [],
      form: new Form(),
      ophthalmologist: new OphthalmologistObj(),

    };
  },
  methods: {
    initOphthalmologyCanvas() {
      this.canvas = new fabric.Canvas('drawCanvas');
      this.canvas.on('mouse:up', () => {
        this.saveCanvasState();
      });
      const ophthalmologyImageInput = document.getElementById('ophthalmologyImageInput');

      ophthalmologyImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        this.uploaded = true;
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;

          img.onload = () => {
            const fabricImage = new fabric.Image(img);
            this.canvas.setWidth(img.width);
            this.canvas.setHeight(img.height);
            this.canvas.add(fabricImage);
          };
        };

        reader.readAsDataURL(file);
      });

      this.canvas.isDrawingMode = true;
      this.canvas.freeDrawingBrush.color = '#000000';
      this.canvas.freeDrawingBrush.width = 5;
    },
    saveCanvasState() {
      const json = JSON.stringify(this.canvas);
      this.undoCanvasStack.push(json);
      this.redoCanvasStack.length = 0; // Clear redo stack when a new action is performed
    },
    undoCanvas(){
      if (this.undoCanvasStack.length > 1) {
        this.redoCanvasStack.push(this.undoCanvasStack.pop());
        const json = this.undoCanvasStack[this.undoCanvasStack.length - 1];
        this.canvas.loadFromJSON(json, () => {
          this.canvas.renderAll();
        });
      }
    },
    redoCanvas(){
      if (this.redoCanvasStack.length > 0) {
        const json = this.redoCanvasStack.pop();
        this.undoCanvasStack.push(json);
        this.canvas.loadFromJSON(json, () => {
          this.canvas.renderAll();
        });
      }
    },
    clearImageInputField() {
      // Clear the file input field by setting its value to an empty string
      const imageFileInput = document.getElementById('ophthalmologyImageInput');
      if (imageFileInput) {
        imageFileInput.value = '';
      }
    },
    resetCanvas() {
      this.canvas.clear(); // Clear all objects on the canvas
      this.canvas.isDrawingMode = true; // Set drawing mode
      this.canvas.freeDrawingBrush.color = '#000000';
      this.canvas.freeDrawingBrush.width = 5;

      // Clear undo/redo stacks
      this.undoCanvasStack = [];
      this.redoCanvasStack = [];
      this.clearImageInputField();

      // Additional setup if needed
    },
    async saveOphthalmologyDrawingImage(canvas,visitId) {


      const imgData = canvas.toDataURL({
        format: 'jpeg', // Choose the format (png, jpeg, etc.)
        quality: 0.8,   // Choose the image quality (0 to 1)
      });

      const fileName = this.extractFileNameFromImgData(imgData);


      const data = {
        imageData: imgData,
        visit_id: visitId,
        file_name: fileName
      };


      const response = await this.form.submit(
          'post',
          route('api.evaluation.specialist.process', [
            'ophthalmologist',
            'saveOphthalmologyImage',
          ]),
          data,
      );

      if(response) {
        flash(response);
        this.resetCanvas();
        this.uploaded = false;

        return response;
      }

    },

    // Function to extract the filename from the imgData
    extractFileNameFromImgData(imgData) {
      // Assuming imgData is in the format "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQE..."
      const matches = imgData.match(/^data:image\/(\w+);base64,/);
      const extension = matches ? matches[1] : 'jpeg';

      // Generate a unique filename
      const uniqueFileName = `image_${Date.now()}.${extension}`;

      return uniqueFileName;
    }

  },
  mounted() {
    this.initOphthalmologyCanvas();
  },
};
</script>

<style scoped>

.opt-drawing-canvas{
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
}
.edit-button-container {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 10px;
}
.imageInputContainer {
  display:flex;
  justify-content: center;
}
#undoOptButton{
  background-color: orange !important;
}
</style>
