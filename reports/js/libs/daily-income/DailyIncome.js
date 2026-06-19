import Base from "@app/libs/Base";
import Form from "@app/libs/Form";


export default class DailyIncome extends Base {
    constructor() {
        super({});

        this.form = new Form({});

        this.results = false;
    }

    /**
     * Get daily income
     */
    get() {
        this.form.submit("get", route("api.reports.finance.daily-income").relative()).then((response) => {
            this.results = response;
        });
    }
}
