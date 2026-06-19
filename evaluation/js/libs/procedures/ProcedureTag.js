import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import Search from '@app/libs/Search';
import { fields } from './procedureTagRepository';
import { _ } from 'vue-underscore';

export default class Procedure extends Base {
    constructor() {
        super(fields);

        this.search = new Search();

        this.form = new Form(fields);

        this.orderedProcedures = {};

        this.stop_investigation_reason = null;

        this.selected = null;
    }



    /*
     * Send the details of a new procedure to the backend API form storage
     */
    async store() {
        const data = this.getFieldsExcept();

        const url = route('api.evaluation.procedure.store.tags');

        const response = await this.form.submit('post', url, data);

        console.log(response)

        this.setFields(fields);

        flash(response);
    }



    async storeTitle() {
      const data = this.getFieldsExcept();

      data['tag'] = 'default';


      const url = route('api.evaluation.procedure.store.tags');

      const response = await this.form.submit('post', url, data);

      console.log(response)

      this.setFields(fields);

      flash(response);
  }






}
