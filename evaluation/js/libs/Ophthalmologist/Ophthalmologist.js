/**
 * Created by: jjoek
 * On:  09 May, 2021
 */
import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './OphthalmologistRepository';
import { fabric } from 'fabric';

export default class Ophthalmologist extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

      
        // Add notes structure
        this.notes = {
            diagnosis: [],
            treatment_plan: '',
        };
    }

    async save() {
        const data = this.slit_lamp_exam;
        data.visit_id = this.visit_id;

        await this.form.submit(
            'post',
            route('api.evaluation.specialist.process', [
                'ophthalmologist',
                'storeSplitExam',
            ]),
            data,
        );
    }

    async  fetchSlitLampData(val){
    
        try {


            const response = await this.form.submit(
                'get',
                route('api.evaluation.specialist.process', [
                    'ophthalmologist',
                    'slitLampExam'
                ]),
                { visit_id: val.visit_id } 
            );
    

            return response;
        } catch (error) {
            console.error('Error fetching slit lamp data:');
        }

    }

    async  fetchSlitLampData(val){
    
        try {
            const data = {
                visit_id: val.visit_id 
            };

            const response = await this.form.submit(
                'post',
                route('api.evaluation.specialist.process', [
                    'ophthalmologist',
                    'slitLampExam'
                ]),
                data
            );
    

            return response;
        } catch (error) {
            console.error('Error fetching slit lamp data:');
        }

    }


    async  fetchNotes(val){
    
        try {
            const data = {
                visit_id: val.visit_id 
            };

            const response = await this.form.submit(
                'post',
                route('api.evaluation.specialist.process', [
                    'ophthalmologist',
                    'ophthalmologyNotes'
                ]),
                data 
            );
    

            return response;
        } catch (error) {
            console.error('Error fetching slit lamp data:');
        }

    }


    async  fetchRefractionFormData(val){
    
        try {
          
            let visitId = val

            const response = await this.form.submit(
                'get',
                route('api.evaluation.refraction.index',{visit_id:visitId}),
                data 
            );
    

            return response;
        } catch (error) {
            console.error('Error fetching refraction form data:');
        }

    }
    /**
   * save ophthalmologist notes
   * @returns {Promise<void>}
   */
    async saveNotes() {
        const data = this.notes;
        data.visit_id = this.visit_id;

        const response = await this.form.submit(
            'post',
            route('api.evaluation.specialist.process', [
                'ophthalmologist',
                'saveNotes',
            ]),
            data,
        );

        if (response) {
            flash(response);
        }
    }

    assemble(val) {
        for (const key in val) {
            if (val.hasOwnProperty(key)) {
                this.slit_lamp_exam[key] = val[key];
            }
        }
    }

    assemblePresEyewear(val) {
        for (const key in val) {
            if (val.hasOwnProperty(key)) {
                this.eyewear_pres[key] = val[key];
            }
        }
    }

    assembleNotes(val) {
        for (const key in val) {
            if (val.hasOwnProperty(key)) {
                this.notes[key] = val[key];
            }
        }
    }

    async saveEyewearPres(visit_id) {
        const data = this.eyewear_pres;
        data.visit_id = this.visit_id;

        return await this.form
            .submit(
                'post',
                route('api.evaluation.specialist.process', [
                    'ophthalmologist',
                    'prescribeEyewear',
                ]),
                {
                    data: data,
                    visit_id: visit_id ? visit_id : this.visit_id,
                },
            )
            .then((data) => {
                flash(data);

                return data;
            });
    }
 
    async fetchEyewearPres(visit_id){
        try{
            const response = await this.form.submit("get", `/api/evaluation/specialists/ophthalmologist/prescribeEyewear?visit_id=${visit_id}`);
    
            return response;
        } catch (error) {
            console.error('Error fetching refraction data:', error);
        }
    }
}
