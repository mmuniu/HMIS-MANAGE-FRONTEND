/**
 * Created by PhpStorm.
 * User: jjoek
 * Date: 2019-10-24
 * Time: 11:56
 */

import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './OrganizationRepository';

export default class Organization extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /**
     * save a new rebate
     */
    save() {
        const formData = this.prepareDataFormData();

        this.form.submit('post', route('api.settings.organization.store').relative(),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }).then((response) => {
            flash(response);

            window.location.reload();
        });
    }

    prepareDataFormData() {
        const formData = new FormData();

        formData.append('name', this.name);
        formData.append('postal_address', this.postal_address);
        formData.append('telephone', this.telephone);
        formData.append('mobile', this.mobile);
        formData.append('email', this.email);
        formData.append('fax', this.fax);
        formData.append('country', this.country);
        formData.append('town', this.town);
        formData.append('street', this.street);
        formData.append('building', this.building);
        formData.append('office_number', this.office_number);
        formData.append('pin', this.pin);
        formData.append('logo', this.logo);
        formData.append('is_letterhead', this.is_letterhead);

        return formData;
    }

    /**
     * save a new rebate
     */
    update() {
        const formData = this.prepareDataFormData();

        this.form.submit('post', route('api.settings.organization.update').relative(),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }).then((response) => {
            flash(response);

            window.location.reload();
        });
    }

    assemble(organization) {
        this.name = organization.name;
        this.postal_address = organization.postal_address;
        this.telephone = organization.telephone;
        this.mobile = organization.mobile;
        this.email = organization.email;
        this.fax = organization.fax;
        this.country = organization.country;
        this.town =organization.town;
        this.street = organization.street;
        this.building = organization.building;
        this.office_number = organization.office_number;
        this.pin = organization.pin;
        this.logo = organization.logo;
        this.is_letterhead = organization.is_letterhead;
    }
}
