/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-05-19
 * Time: 11:11
 */


import Base from "@app/libs/Base";
import Form from "@app/libs/Form";

import { fields } from "./SchemeRepository";

export default class Scheme extends Base {
    constructor() {
        super(fields);  

        this.form = new Form(fields);

        this.saved = false;

        this.schemes = null;

        this.selected = null;

        this.duplicated = false;
    }

    saveScheme() {
        const data = this.getFields(["scheme_data"]);

        return this.form.submit("post", route("api.settings.schemes.store").relative(), data).then((response) => {
            flash(response);

            this.resetSchemeInfo();
        });
    }

    updateScheme() {
        const data = this.getFields(["scheme_data"]);

        return this.form.submit("post", route("api.settings.schemes.update", this.scheme_data.scheme_id).relative(), data).then((response) => {
            flash(response);

            this.resetSchemeInfo();
        });
    }

    changeStatus(scheme_id) {
        this.form.submit("post", route("api.settings.schemes.changeStatus", scheme_id).relative()).then((response) => {
            flash(response);

            this.resetSchemeInfo();

            window.location.reload();
        });
    }

    async requiresPreauth(scheme_id, type, item) {
        const response = await this.form.submit("post", route("api.settings.schemes.requires_preauth", [scheme_id, type]), item);

        if (response) {
            flash(response);

            return response;
        }
    }

    /**
     * get all schemes
     */
    find(id) {
        this.form.submit("get", route("api.settings.schemes.show", id).relative()).then((response) => {
            this.selected = response.data;

            this.scheme_id = response.data.id;
        });
    }

    /**
     * save an Exclusion
     */
    saveExclusion() {
        const data = this.getFields(["exclusions", "scheme_id"]);

        this.saved = false;

        this.form.submit("post", route("api.settings.schemes.store.exclusions").relative(), data).then((response) => {
            this.selected = response.data;

            this.saved = true;

            flash({ message: "Exclusion saved!", alert: "success" });
        });
    }

    /**
     * update an exclusion
     */
    updateExclusion() {
        const data = this.editedExclusion;

        this.saved = false;

        this.form.submit("put", route("api.settings.schemes.update.exclusion", data.id).relative(), data).then((response) => {
            this.selected = response.data;

            this.saved = true;

            flash({ message: "Exclusion updated!", alert: "success" });
        });
    }

    /**
     * duplicate a scheme's exclusions
     */
    saveDuplicateSchemeExclusions() {
        const data = this.duplicatedSchemeExclusions;

        this.duplicated = false;

        this.form.submit("post", route("api.settings.schemes.store.duplicate-scheme-exclusions").relative(), data).then((response) => {
            this.duplicated = true;

            flash({ message: "Scheme Exclusion Duplication Success!", alert: "success" });
            flash({ message: "Redirecting ...", alert: "info" });
        });
    }

    resetEditedExclusionData() {
        this.editedExclusion.facility_id = null;
        this.editedExclusion.scheme_id = null;
        this.editedExclusion.id = null;
        this.editedExclusion.price = 0;
        this.editedExclusion.friendly_name = null;
    }

    resetDuplicatedSchemeExclusions() {
        this.duplicatedSchemeExclusions.scheme_id = null;
        this.duplicatedSchemeExclusions.exclusions = [];
    }

    resetSchemeInfo() {
        this.scheme_data.company = null;
        this.scheme_data.name = null;
        this.scheme_data.type_id = null;
        this.scheme_data.amount = null;
        this.scheme_data.attention = null;
        // this.scheme_data.effective_date = '';
        // this.scheme_data.expiry_date = null;
        this.scheme_data.smart_enabled = false;
        this.scheme_data.age_range = null;
        this.scheme_data.age_restricted = false;
        this.scheme_data.gender_restricted = false;
        this.scheme_data.gender = null;
        this.scheme_data.policy_number_compulsory = null;
    }


    recordExclusionAndPricing(data) {
        this.form.submit("post", route("api.settings.schemes.record-exclusion").relative(), data).then((response) => {
            flash(response);
        });
    }

    uploadExcel(type) {
        const formData = this.prepareDataFormData(type);

        for (let pair of formData.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }

        return this.form.submit("post", route("api.settings.upload-excel-exclusions").relative(),
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }).then((response) => {
            flash(response);
        });
    }

    prepareDataFormData(type) {
        const formData = new FormData();

        formData.append("excel_doc", this.excel);
        formData.append("scheme_id", this.scheme_id);
        formData.append("type", type);

        return formData;
    }
}

