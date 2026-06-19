/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 22/09/2019
 * Time: 18:16
 */


import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import Search from "@app/libs/Search";

import { fields } from "./ReportRepository";

export default class Report extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.search = new Search([]);

        this.reportData = [];
    }

    /*
     * Get report
     */
    get(module, decoratorKey, page = 1, data = null) {
        let params = "";

        if (data) {
            _.forEach(data, function(value, key) {
                if (value) {
                    params += "&" + key + "=" + value;
                }
            });
        }

        this.form.submit("get", route("api.reports.index", [module, decoratorKey]).relative() + `?page=${page}` + params ).then((response) => {
            this.reportData = response;
        });
    }

    /*
     * perform filter
     */
    performFilter(module, decoratorKey, page = 1, filters = null) {
        const data = filters ? filters : this.getFields("filters").filters;

        this.loading = true;

        this.form.submit("post", route("api.reports.filter", [module, decoratorKey]).relative() + `?page=${page}`, data).then((response) => {
            this.reportData = response;

            this.loading = false;
        });
    }
};

