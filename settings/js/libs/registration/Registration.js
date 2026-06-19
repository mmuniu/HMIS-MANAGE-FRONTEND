
import Base from '@app/libs/Base';
import Form from '@app/libs/Form';

import { fields } from './RegistrationRepository';

export default class Scheme extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.saved = false;

        this.schemes = null;

        this.selected = null;

        this.duplicated = false;
    }

    async fetchSettings() {
        let response;
        try {
            response = await this.form.submit('get', route('api.settings.setup.registration.get').relative());
            if (response) {
                return response;
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    }

    async saveRegistration(fieldData) {
        // Gather field data
        const fieldsData = this.getFieldsData(fieldData);

        const data = {
            fields: fieldsData,
        };

        // Send data to the backend
        const response = await this.form.submit('post', route('api.settings.setup.registration.store').relative(), data);
        if (response) {
            flash(response);

            return response;
        }
    }

    getFieldsData(formFieldData) {
        // Gather data from visibilitySettings and mandatorySettings
        // console.log(fieldData)
        const fieldsData = [];

        // Loop through visibilitySettings to gather data
        for (const fieldName in formFieldData.visibilitySettings) {
            // Retrieve the value of is_visible and is_mandatory
            const isVisible = formFieldData.visibilitySettings[fieldName];
            const isMandatory = formFieldData.mandatorySettings[fieldName];

            // Check if is_mandatory is null or empty, then set it to false
            const visible = isVisible !== null && isVisible !== undefined && !!isVisible;
            const mandatory = isMandatory !== null && isMandatory !== undefined && !!isMandatory;

            fieldsData.push({
                field_name: fieldName,
                section: this.getFieldSection(fieldName),
                is_visible: isVisible,
                is_mandatory: mandatory,
            });
        }

        // Loop through mandatorySettings to gather data
        // for (const fieldName in formFieldData.mandatorySettings) {
        //     fieldsData.push({
        //         field_name: fieldName,
        //         section: this.getFieldSection(fieldName),
        //         is_visible: !!formFieldData.visibilitySettings[fieldName], // Convert to boolean
        //         is_mandatory: !!formFieldData.mandatorySettings[fieldName], // Convert to boolean
        //     });
        // }

        return fieldsData;
    }

    getFieldSection(fieldName) {
        if (fieldName.startsWith('chief_')) {
            return 'chief_information';
        } else if (fieldName === 'mobile' || fieldName === 'secondary_number' ||fieldName === 'email_address'||fieldName === 'secondary_email_address'||fieldName === 'telephone'|| fieldName === 'nationality' ||
            fieldName === 'subcounty_of_residence' || fieldName === 'village' || fieldName === 'town' || fieldName === 'home' || fieldName === 'postal_code' || fieldName === 'other_details') {
            return 'contact_information';
        } else {
            return 'patient_profile';
        }
    }
}

