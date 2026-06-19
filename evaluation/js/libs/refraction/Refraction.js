/**
 * Created by: jjoek
 * On:  08 May, 2021
 */
import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./RefractionRepository";

export default class Refraction extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    async save() {
        
        const data = this.getFields();

        const response = this.form.submit('post', route('api.evaluation.refraction.store'), data)
            .then((data) => {
                flash(data);
            })

    }
    async fetchPreviousUploads(id){
        try {


           
            const response = await this.form.submit("get", `/api/evaluation/refraction/external-prescriptions?refraction_id=${id}`);
            return response;
        } catch (error) {
            console.error("Error fetching external prescriptions:", error);
            throw error;
        }
    }

    async savePrescription() {
        if (!this.prescriptionFile) {
          alert("Please upload a prescription file first.");
          return;
        }
    
        // Prepare form data for API request
        let formData = new FormData();
        formData.append("prescriptionFile[]", this.prescriptionFile);
        formData.append("prescriptionFileName", this.prescriptionFileName);
        formData.append("visit_id", this.visit_id); 
        formData.append('refraction_id',this.id);

    
        try {
          // Send API request to store prescription separately
          const response = await axios.post(route("api.evaluation.refraction.store-external-prescriptions"), formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          this.saveSuccess = true;

          flash (response);
        } catch (error) {
          console.error("Error saving prescription:", error);
          alert("Failed to save prescription. Please try again.");
        }
      }

    async fetchRefractionData(val){
    
        try {
            // Make a GET request with visit_id as a query parameter
            const response = await this.form.submit("get", `/api/evaluation/refraction?visit_id=${val}`);
            
            // Merge the fetched data with the existing refraction object
        
            return response;
        } catch (error) {
            console.error('Error fetching refraction data:', error);
        }
    }

    assemble(val) {
        for (var key in val) {
            if (val.hasOwnProperty(key)) {
                this[key] = val[key]
            }
        }
    }

    markAsFinal () {
        this.subjective.final = true;
        this.eyewear_prescription = this.subjective.data[this.subjective.data.length - 1];
        this.save();
    }

    removeItem (index) {
        this.subjective.data.splice(index, 1);
        this.save();
    }

    addSubjective () {
        this.subjective.data.push({
            right: {
                sphere: null,
                cylinder: null,
                axis: null,
                near_add: null,
                duochrome: null,
                bcva: null,
                prism_horizontal: null,
                horizontal_base_direction: null,
                prism_vertical: null,
                vertical_base_direction: null
            },
            left: {
                sphere: null,
                cylinder: null,
                axis: null,
                near_add: null,
                duochrome: null,
                bcva: null,
                prism_horizontal: null,
                horizontal_base_direction: null,
                prism_vertical: null,
                vertical_base_direction: null
            },
            by: null,
        })
    }
}
