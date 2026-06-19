import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import Search from "@app/libs/Search";
import { fields } from "./Moh705Repository";
import { _ } from "vue-underscore";

export default class Moh705 extends Base {
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
        let url = "/api/evaluation/variation705/diseases";
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
        let url = "/api/evaluation/variation705/diseases";
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

    insertPatientMoh705Condition(variation, visit) {
        const data = {
            data: {
                variation_id: variation.id,
                visit_id: visit,
            },
        };

        this.form.submit("post", "/api/evaluation/variation705/index_moh", data).then((response) => {
            flash(response);
        });
    }

    deletePatientMoh705Condition(variation, visit) {
        const data = {
            data: {
                variation_id: variation.variation.id,
                visit_id: visit,
            },
        };

        this.form.submit("patch", "/api/evaluation/variation705/note", data).then((response) => {
            flash(response);
        });
    }
}
