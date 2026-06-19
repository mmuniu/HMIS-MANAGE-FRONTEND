import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./DoctorNoteRepository";
import { _ } from "vue-underscore";

export default class DoctorNote extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /**
     * Save patient vitals into the database
     */
    save() {
        const data = this.getFieldsExcept(["form"]);


        this.form.submit("post", "/api/evaluation/doctor-notes", data).then((response) => {
            flash(response);
        });
    }
    saveCounsel(data){
        // const data = this.getFieldsExcept(["form"]);


        this.form.submit("post", "/api/evaluation/doctor-notes/saveCounsel", data).then((response) => {
            flash(response);
        });

    }

    
    saveRecordFollowUp(data){
        // const data = this.getFieldsExcept(["form"]);


        this.form.submit("post", "/api/evaluation/doctor-notes", data).then((response) => {
            flash(response);
        });

    }

    async fetchAllNotes(user_id,visit_id) {

        try {

            const NotesData = {
                user: user_id,
                visit_id: visit_id
            };
            const response = await this.form.submit("post", "/api/evaluation/fetch-previous-doctor-notes", NotesData);
            return response;
        } catch (error) {
            console.error("Error fetching all notes:", error);
            throw error; // Re-throw the error if needed
        }
    }


     async fetchFollowUps(visit_id) {

        try {



            const response = await this.form.submit("get", `/api/reception/followUps?visit_id=${visit_id}`);
            return response;
        } catch (error) {
            console.error("Error fetching follow ups:", error);
            throw error; // Re-throw the error if needed
        }
    }
    async logViews(data){
        const logs_data = {
            user: data.doctor,
            note_id: data.note_id,
            visit_id: data.visit_id
        };

        await this.form.submit("post", "/api/evaluation/doctor-note-log-views", logs_data).then((response) => {
            return (response);
        });
    }

    async fetchPreviousDoctorNotes(){
      
       await  this.form.submit("get", "/api/evaluation/fetch-previous-doctor-notes").then((response) => {
            return (response);
        });
    
    }

    async fetchCurrentlyLoggedInUser() {
        try {
          const response = await this.form.submit("get", "/api/evaluation/fetch-currently-logged-in-user");
          return response; // Ensure this returns the desired data (e.g., the user ID)
        } catch (error) {
          console.error("Error fetching currently logged-in user:", error);
          throw error; // Re-throw the error if needed
        }
      }
      
   
    /*
     * Instantiates the values of the vitals given having a visit that already exists
     */
    populate(notes, user_id ) {
                    console.log("user")     
                    console.log(user_id)
        
     
        // Check if the user_id matches the notes' user.id
        if (user_id !== null && notes.user !== user_id) {
            return; 
        }
    
        // Proceed to populate the object if the IDs match or user_id is not provided
        _.each(notes, (value, index) => {
            if (this.hasOwnProperty(index)) {
                this[index] = value;
            }
        });
    }
    

    
   

     
    async fetchNextSteps(visit_id) {
        const data = {
            visit: visit_id
        };
    
        try {
            const response = await this.form.submit("post", "/api/evaluation/fetch-doctor-notes-next-steps", data);
            return response; 
        } catch (error) {
            console.error("Error in fetchNextSteps:", error);
            return null; 
        }
    }
    

    
    
    

    async fetchCounselling(val) {
        const data = {
            visit: val.visit_id
        };
    
        try {
            const response = await this.form.submit("post", "/api/evaluation/fetch-counselling-notes", data);
            console.log("API Response:", response); // Debugging: Ensure API response is received
            return response; // ✅ Ensure response is returned
        } catch (error) {
            console.error("Error in fetchCounselling:", error);
            return null; // ✅ Return null instead of undefined on error
        }
    }
    
}
