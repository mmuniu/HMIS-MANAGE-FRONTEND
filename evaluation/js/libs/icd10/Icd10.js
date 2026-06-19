import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import Search from "@app/libs/Search";
import { fields } from "./Icd10Repository";
import { _ } from "vue-underscore";

export default class Icd10 extends Base {
    constructor() {
        super(fields);

        this.search = new Search();

        this.type = null;

        this.variations = [];

        this.variation = null;

        this.form = new Form(fields);
    }

    /*
     * Search by Name
     */
    searchByName() {
        let url = "/api/evaluation/icd10/variation";
        url = `${url}`;

        if (this.search.term) {
            url = `${url}?name=${this.search.term}`;
        }

        _.debounce(this.fetch(url), 700);
    }

    /*
     * Search by Code
     */
    searchByCode() {
        let url = "/api/evaluation/icd10/variation";
        url = `${url}`;

        if (this.search.term) {
            url = `${url}?code=${this.search.term}`;
        }
        _.debounce(this.fetch(url), 700);
    }
    /*
     * fetch the variation from the database
     */
    fetch(url) {
        this.search.loading = "blue";

        this.form.submit("get", url).then((types) => {
            // if(types)
            // {
            this.search.results = types.data;

            this.search.loading = false;

            if (this.search.results.length == 0) {
                this.search.noData = "Sorry! no results matched your search";
            }

            this.form.submitted = false;
            //  }
        });
    }

    insertPatientId10Condition(variation, visit) {
      const data = {
        data: {
            variation_id: variation.id,
            visit_id: visit,
        },
    };



        this.form.submit("post", "/api/evaluation/icd10/note", data).then((response) => {
            flash(response);
        });
    }

    deletePatientId10Condition(variation, visit) {
        const data = {
            data: {
                variation_id: variation.id,
                visit_id: visit,
            },
        };

        this.form.submit("patch", "/api/evaluation/icd10/note", data).then((response) => {
            flash(response);
        });
    }
}
