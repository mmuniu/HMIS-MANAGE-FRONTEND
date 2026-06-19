/**
 * Created by: jjoek
 * On:  03 Oct, 2021
 */
import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./PackageRepository";

export default class Package extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    async save () {
        const data = this.getFields();

        let response = await this.form.submit("post", route("api.evaluation.packages.store"), data);

        if(response) {
            flash(response);
        }
    }

    async deletePackage (item) {
        console.log(item);
        let response = await this.form.submit("delete", route("api.evaluation.packages.delete", item.id))

        flash(response);
    }

    assemble (item) {
        this.package.id = item.id;
        this.package.name = item.name;
        this.package.active = item.active;

        let self = this;

        item.details.forEach((proc) => {
            if(proc.type === 'procedures') {

            }

            if(proc.type === 'drugs') {

            }

            if(proc.type === 'consumables') {

            }
        });
    }
}
