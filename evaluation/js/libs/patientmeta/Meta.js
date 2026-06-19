/**
 * Created by PhpStorm.
 * User: Lexx YungCarter
 * Date: 07/11/2018
 * Time: 11:27
 * Project: platform
 */
import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./MetaRepository";

export default class Meta extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    get(patientId) {
        this.form.submit("get", route("api.evaluation.patient-meta.index", patientId)).then((response) => {
            this.populate(response.data);
        });
    }

    save(patientId) {
        const data = this.getFieldsExcept(["form"]);

        this.form.submit("post", route("api.evaluation.patient-meta.store", patientId), data).then((response) => {
            flash({ message: "Saved", alert: "success" });

            this.populate(response.data);
        });
    }
    
    getImmunizationHistory(patientId){
        const ImmunizationHistory = this.form.submit("get", route("api.evaluation.immunization-history.index", patientId)).then((response) => {
            this.populate(response.data);
        });

        return ImmunizationHistory;
    }

    populate(data) {
        if (data) {
            this.allergies = data.allergies;
            this.blood_group = data.blood_group;
            this.chronic_illnesses = data.chronic_illnesses;
            this.food_allergies = data.food_allergies;
            this.drug_allergies = data.drug_allergies;
            this.hiv_status = data.hiv_status;
            this.rhesus_factor = data.rhesus_factor;
            this.medical_history = data.medical_history;
            this.family_history = data.family_history;
            this.social_history = data.social_history;
            this.ocular_history= data.ocular_history;
            this.last_updated_by = data.last_updated_by ? data.last_updated_by.full_name : "";
            this.vaccination_history = data.vaccination_history;
        }
    }
}
