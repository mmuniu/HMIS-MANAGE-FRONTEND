import Base from "@app/libs/Base";
import Form from "@app/libs/Form";

const fields = {};

export default class History extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.visits = [];

        this.patient_id = null;

        this.meta = null,

            this.loading = true;
    }

    getPatientId(visit_id, page) {
        this.form.submit("get", `/api/evaluation/treatment/get-patient-id/${visit_id}`).then((response) => {
            this.patient_id = response;

            // fetch the notes now
            this.get(visit_id, page);

            this.loading = false;
        });
    }

    ocular_getPatientId(visit_id, page) {
        this.form.submit("get", `/api/evaluation/treatment/get-patient-id/${visit_id}`).then((response) => {
            this.patient_id = response;
            // fetch the notes now
            this.ocular_get(visit_id, page);
            this.loading = false;
        });
    }

    async fetchOutPatientNotesVisit(id){
        try {
            return await this.form.submit("get", `/api/evaluation/fetch-outpatient-notes-views/${id}`);
        } catch (error) {
            console.error("Error fetching outpatient notes:", error);
            throw error;
        }

    }

    async fetchDoctorNotesLogs(id){
        try{

            return await this.form.submit("get", `/api/evaluation/fetch-doctor-notes-log/${id}`);

        }catch(error){

            console.error("Error fetching outpatient notes:", error);
            throw error;
        }
    }


    async fetchNurseNotesLogs(id){
        try {
            const response = await this.form.submit("get", `/api/evaluation/fetch-nurse-notes-log/${id}`);
            return response;
        } catch (error) {
            console.error("Error fetching nurse notes", error);
            throw error;
        }

    }


    async fetchPrescriptionLogs(id){
        try {
            const response = await this.form.submit("get", `/api/evaluation/fetch-prescription-view-logs/${id}`);
            return response;
        } catch (error) {
            console.error("Error fetching prescription logs:", error);
            throw error;
        }

    }

    
    async fetchInvestigationResultViewLogs(id){
       try{
        const response = await this.form.submit("get", `/api/evaluation/fetch-investigation-result-view-logs/${id}`);
            return response;
       }catch(error){
        console.error("Error fetching investigation result logs:", error);
        throw error;
       
       }
    }

    async fetchInvestigationResultViewLogs(id){
        try{
         const response = await this.form.submit("get", `/api/evaluation/fetch-investigation-result-view-logs/${id}`);
             return response;
        }catch(error){
         console.error("Error fetching investigation result logs:", error);
         throw error;
        
        }
     }
     async fetchInpatientHistoryViewLogs(id){
        try{
         const response = await this.form.submit("get", `/api/evaluation/fetch-inpatient-history-view-logs/${id}`);
             return response;
        }catch(error){
         console.error("Error fetching inpatient history view  logs:", error);
         throw error;
        
        }
     }
 
 




    



    updateOutpatientHistoryViewCount(id){
        this.form.submit("post", `/api/evaluation/treatment/update-outpatient-history-view-count/${id}`).then((response) => {
            // console.log(response);
        });
    }
    /**
     * initial fetch
     * @param visit_id
     * @param page
     */
    fetch(visit_id = null, page = 1) {
        if (! this.patient_id) {
            this.getPatientId(visit_id, page);
        } else {
            this.get(visit_id, page);
        }
    }

    ocular_fetch(visit_id = null, page = 1) {
        if (! this.patient_id) {
            this.ocular_getPatientId(visit_id, page);
        } else {
            this.ocular_get(visit_id, page);
        }
    }

    /**
     * successive gets/clicks
     * remove visit_id
     * `/api/evaluation/history/${this.patient_id}/${visit_id}?page=${page}`
     * @param visit_id
     * @param page
     *
     */
    get(visit_id = "", page=1) {
        this.loading = true;

        this.form.submit("get", `/api/evaluation/history/${this.patient_id}?page=${page}`).then((response) => {
            this.visits = response.data;
            // console.log(this.visits);

            this.meta = response.meta;

            this.loading = false;
        });
    }


    ocular_get(visit_id = null, page=1) {
        this.loading = true;

        this.form.submit("get", `/api/evaluation/ocular_history/${this.patient_id}?page=${page}`).then((response) => {
            this.visits = response.data;
            this.meta = response.meta;
            this.loading = false;
        });
    }
}
