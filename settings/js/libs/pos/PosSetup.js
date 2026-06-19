import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./PosSetupRepository";

export default class PosSetup extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.updating = false;
    }

    savePosDetails() {
        const data = this.getFields();

        this.form.submit("post", route("api.settings.setup.pos.store"), data).then((response) => {
            flash(response);

            window.location.reload();
        });
    }

    updatePosDetails() {
        const data = this.getFields();

        this.form.submit("patch", route("api.settings.setup.pos.update", this.id), data).then((response) => {
            flash(response);

            window.location.reload();
        });
    }

    updatePos(item) {
        this.display_name = item.display_name,
        this.slug = item.slug,
        this.store_id = item.store_id,
        this.facility_id = item.facility_id,
        this.is_pharmacy = item.is_pharmacy,
        this.has_stocks = item.has_stocks,
        this.active = item.active,
        this.icon = item.icon,
         this.is_custom =item.is_custom,
        this.updating = true,
        this.customer_type =  JSON.parse(item.customer_type),
        this.pos_type =  item.pos_type,
        this.service_types =  JSON.parse(item.service_types),
        this.allows_credit =  item.allows_credit,
        this.id = item.id
    }

    deletePos(id) {
        this.form.submit("delete", route("api.inventory.setup.points-of-sale.destroy", id)).then((response) => {
            flash(response);
        });
    }
}
