import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./DialysisSessionRepository";

export default class DialysisSession extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Save dialysis visit and necessitate checkin to the dialysis treatment room
     */
    save() {
        const data = this.getFields();

        this.form.submit("post", "/api/dialysis/sessions", data).then(({ session }) => {
            location.href = `/dialysis/session/${session.id}/assess/machine`;
        });
    }
    

   


     fetchUsers() {
        const response =  this.form.submit('get', route('api.users.index'));
        return response.data|| []; // Ensure this returns an array
    }
}
