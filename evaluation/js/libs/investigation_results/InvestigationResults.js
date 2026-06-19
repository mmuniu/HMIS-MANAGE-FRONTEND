import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './InvestigationResultsRepository';
import { _ } from 'vue-underscore';
export default class InvestigationResults extends Base {
    constructor() {
        super(fields);
        this.form = new Form(fields);
    }
    /*
    * post patient test results
    * */
    async saveResult(investigation) {
        const formData = new FormData();
      
        // Add standard investigation data
        formData.append('investigation', investigation.investigation_id);
        formData.append('comments', investigation.comment);
        formData.append('results', JSON.stringify(this.cherryPickResults(investigation)));
      
        // Check if a file is uploaded, and include it in the form data
     
        if (investigation.uploadedFiles && investigation.uploadedFiles.length > 0) {
            investigation.uploadedFiles.forEach(file => {
              formData.append('files[]', file);  // Append each file as 'files[]'
            });
          }
      
        // Send the form data to the API endpoint

        try {
            // Use axios directly to POST multipart/form-data
            const response = await axios.post('/api/evaluation/investigationResults/store', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response) {
                flash(response);
                return response;
            }
        } catch (error) {
            console.error('Error saving result:', error.response || error);
            flash({ message: 'An error occurred while saving results', alert: 'error' });
            throw error;
        }
      }

      async submitReviewInvestigation(investigation) {

        const data = {
            investigation_id: investigation,
            review_comments: this.review_comments,
        };

        const response = await this.form.submit('post', '/api/evaluation/investigationResults/review', data);
        if (response) {
            flash(response);
            return response;
        }
    }
      
    async updateReceiveSampleStatus(investigation) {
        const data = {
            investigation_id: investigation.investigation_id,
        };
        const response = await this.form.submit('post', '/api/evaluation/investigationResults/updateReceiveStatus', data);
        if (response) {
            flash(response);
            return response;
        }
    }
    /*
    * save machine result
    * */
    async saveMachineResult(investigation) {
        const response = await this.form.submit('post', '/api/evaluation/investigationResults/save-machine_result', investigation);
        if (response) {
            flash(response);
            window.location.reload();
            return response;
        }
    }
    /*
    * change result status  (approved, pending, published, retracted, etc)
    * */
    async updateStatus(investigation, status) {
        const data = {
            status: status,
            investigation_id: investigation,
            rejection_reason: this.rejection_reason,
            retraction_reason: this.rejection_reason,
        };
        const response = await this.form.submit('post', `/api/evaluation/investigationResults/updateStatus/${investigation}`, data);
        if (response) {
            return response;
        }
    }
    /*
    * save the changes made on the previously posted results
    * */
    async updateEditedResult() {
        const response = await this.form.submit('post', '/api/evaluation/investigationResults/update-results', this.resultBeingEdited);
        if (response) {
            return response;
        }
    }
    /*
    * print one
    * */
    printOne(investigation_id, visit_id, withoutLetterHead, download = false) {
        let url = `/evaluation/print/lab/results/one/${investigation_id}/${visit_id}?`;
        if (download) {
            url += 'download=1';
        }
        if (withoutLetterHead) {
            url += '&withoutLetterHead=1';
        }
        window.open(url, '_blank');
    }
    /*
    * print all investigations in the visit
    * */
    printAll(visit_id, withoutLetterHead) {
        if (withoutLetterHead) {
            window.open(`/evaluation/print/lab/results/${visit_id}/?withoutLetterHead=1`);
        } else {
            window.open(`/evaluation/print/lab/results/${visit_id}`);
        }
    }
    async cancelInvestigation(investigation) {
        const data = {
            id: investigation,
        };
        const response = await this.form.submit('patch', '/api/evaluation/investigations/destroy', data);
        if (response) {
            flash(response);
            window.location.reload();
        }
    }

    async fetchReviewedInvestigation(result){
        const response = await this.form.submit('get', `/api/evaluation/investigationResults/fetch-reviewed-investigation/${result}`);
        if (response) {
            return response;
        }
    }
    /*
    * revert results and start again
    * */
    revertResults(investigation) {
        window.open(`/evaluation/lab/result/revert/${investigation}`, '_self');
    }
    /*
    * pick out subtests with results
    * */
    cherryPickResults(investigation) {
        // has template
        if (_.has(investigation, 'subtests')) {
            const results = _.map(investigation.subtests, function(grouped) { // titles first
                return _.map(grouped, function(subtest) {
                    if (subtest.result) {
                        const result = subtest.second_value ? [subtest.result, subtest.second_value] : subtest.result;
                        return [
                            subtest.subtest_id,
                            result,
                            subtest.title,
                        ];
                    } else {
                        return null;
                    }
                });
            });
            const filtered = results.map((group) => group.filter((el) => el != null));
            const data = _.filter(filtered, function(group) {
                return group.length > 0;
            });
            return _.flatten(data, true);
        } else {
            return [
                investigation.procedure_id,
                investigation.result,
            ];
        }
    }
    /*
    * place the tests and subtests to store, (patient_tests)
    * */
    assemble(investigations) {
        const tests = this.patient_tests;
    
        // Initialize procedure_info once
        this.procedure_info = {}; // Ensure this is an object or array
    
        // Use arrow function to maintain `this` context
        _.each(investigations.data, (item) => {
            // procedures with templates
            if (!_.isEmpty(item.sub_tests)) {
                const test = {
                    test: item.procedure_name,
                    investigation_id: item.id,
                    run_no: item.run_no,
                    is_paid: item.is_paid,
                    can_be_offered: item.can_be_offered,
                    procedure_id: item.procedure_id,
                    subtests: _.groupBy(item.sub_tests, 'title'),
                    comment: null,
                };
    
                const check = _.find(tests, (val) => {
                    return val.investigation_id === test.investigation_id;
                });
    
                if (!check) {
                    tests.push(test);
            
                    this.procedure_info[item.id] = this.procedureInfo(item); // Store unique info
                }
                // console.log(`Stored procedure info for ID ${item.id}:`, this.procedure_info[item.id]);
            } else {
                /* procedures without templates */
                const test = {
                    test: item.procedure_name,
                    investigation_id: item.id,
                    run_no: item.run_no,
                    procedure_id: item.procedure_id,
                    input_type: item.input_type,
                    less_greater: false,
                    lab_result_options: item.lab_result_options,
                    result: item.default_result ? item.default_result : null,
                    is_paid: item.is_paid,
                    can_be_offered: item.can_be_offered,
                    comment: null,
                };
    
                const check = _.find(tests, (val) => {
                    return val.investigation_id === test.investigation_id;
                });
    
                if (!check) {
                    tests.push(test);
                    this.procedure_info[item.id] = this.procedureInfo(item); // Store unique info
                    // console.log(`Stored procedure info for ID ${item.id}:`, this.procedure_info[item.id]);
                }
            }
        });
    }
    
    procedureInfo(item) {
        // console.log("procedure info")
        // console.log(item)
        return {
            investigation_id: item.id, // Store the investigation ID
            details: [
                { title: 'Requested By: ', value: item.user.full_name },
                { title: 'Instructions: ', value: item.reasons ? item.reasons : 'No instructions provided' },
                { title: 'Price: ', value: item.price },
                { title: 'Units performed: ', value: item.ordered },
                { title: 'Discount: ', value: item.discount },
                { title: 'Charges: ', value: item.amount },
                { title: 'Date: ', value: item.created_at },
            ],
        };
    }
    institutionSelected() {
        this.emailing_partial.institution_staff = this.emailing_partial.selected_institution.staff;
    }
    staffSelected() {
        if (this.email.recipients.indexOf(this.emailing_partial.selected_doctor.email) === -1 && this.emailing_partial.selected_doctor.email) {
            this.email.recipients.push(this.emailing_partial.selected_doctor.email);
            this.emailing_partial.selected_institution = null;
            this.emailing_partial.selected_doctor = null;
            this.emailing_partial.institution_staff = null;
            this.emailing_partial.emailToDoctorInInstitution = false;
        } else {
            flash({
                message: 'Email already added or doesn\'t exist',
                alert: 'error',
            });
        }
    }
    addExtraEmail() {
        if (this.email.recipients.indexOf(this.emailing_partial.extra_personnel) === -1 && this.emailing_partial.extra_personnel) {
            this.email.recipients.push(this.emailing_partial.extra_personnel);
            this.emailing_partial.extra_personnel = null;
        } else {
            flash({
                message: 'Email already added or doesn\'t exist',
                alert: 'error',
            });
        }
    }
    addInstitutionToMailing() {
        if (this.email.recipients.indexOf(this.emailing_partial.selected_institution.email) === -1 && this.emailing_partial.selected_institution.email) {
            this.email.recipients.push(this.emailing_partial.selected_institution.email);
            this.emailing_partial.selected_institution = null;
            this.emailing_partial.selected_doctor = null;
            this.emailing_partial.institution_staff = null;
            this.emailing_partial.emailToDoctorInInstitution = false;
        } else {
            flash({
                message: 'Email already added or doesn\'t exist',
                alert: 'error',
            });
        }
    }
    emailInvestigationResult(investigation_id, visit_id, withoutletterhead) {
        this.email_result_dialog = true;
        this.email.investigation_id = investigation_id;
        this.email.visit_id = visit_id;
        this.email.withoutLetterHead = withoutletterhead;
    }
    removeEmail(email) {
        const index = this.email.recipients.indexOf(email);
        if (index !== -1) this.email.recipients.splice(index, 1);
    }
    emailResult() {
        this.loading = true;
        return this.form.submit('post', '/api/evaluation/investigationResults/email-results', this.email).then((response) => {
            flash(response);
            this.email_result_dialog = false;
            this.loading = false;
        });
    }
    /*
    * fetch results analytics
    * */
    async fetchAnalytics(data) {
        const response = this.form.submit('post', '/api/evaluation/investigationResults/fetch-analytics', data);
        if (response) {
            return response;
        }
    }
}