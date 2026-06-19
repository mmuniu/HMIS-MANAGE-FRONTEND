/**
 * Created by: jjoek
 * On:  05 Dec, 2020
 */
import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from './ExaminationReviewRepository';
import presentingComplaints from "@evaluation/libs/presenting_complaints/PresentingComplaints";

export default class ExaminationReview extends Base
{
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.visit_id = null;
    }

    /*
    * save data
    * */
    async saveData(type, detailed_key = null) {

      console.log("detailed_key:"+detailed_key);

        if(detailed_key) {
            var data = {
                detailed_key: true,
                [detailed_key]: this.detailed_exam[detailed_key]
            }
        } else {
            var data = this.onlyGet([type]);
        }


        const jaudince = data[Object.keys(data)[0]][Object.keys(data[Object.keys(data)[0]])[3]]['value'];

        if(jaudince == true)
        {


          const presentingData = {
            symptom: 'Jaundice'
          };

          // presentingComplaints.saveData(presentingData);



          const response_presenting =  await this.form.submit('post', route('api.evaluation.presenting_complaints.jaundice', this.visit_id), presentingData);
              flash(response_presenting);

              const response =  await this.form.submit('post', route('api.evaluation.examination_review.store', this.visit_id), data);

              if(response) {
                  flash(response);


                  return response;
              }

      }
      else
      {
        const response =  await this.form.submit('post', route('api.evaluation.examination_review.store', this.visit_id), data);

        if(response) {
            flash(response);


            return response;
        }
      }


    }

    /**
     * add in multiselect option values
     */
    addSegment (field) {
        if(field === 'motor_system') {
            this.detailed_exam.nervous_system_examination.motor_system.keys.push(
                {
                    muscle: {
                        type: 'select',
                        value: null,
                        options: [
                            'pectorals (pecs)', 'biceps', 'trapezius', 'deltoids (delts)', 'latissimus dorsi (lats)',
                            'rectus abdominus (abs)', 'obliques', 'erector spinae', 'adductors', 'quadriceps (quads)',
                            'gastocenemius', 'rhomboids', 'triceps', 'gluteals (glutels)', 'soleus'
                        ]
                    },
                    bulk: {
                        type: 'select',
                        value: null,
                        options: [
                            'Normal',
                            'abnormal'
                        ]
                    },
                    Tone: {
                        type: 'text',
                        value: null,
                    },
                    power: {
                        type: 'select',
                        value: null,
                        options: [1, 2, 3, 4, 5]
                    }
                }
            )
        }

        if(field === 'sensory_system') {
            this.detailed_exam.nervous_system_examination.sensory_system.keys.push( {
                segment: {
                    type: 'select',
                    value: null,
                    options: ['C', 'T', 'S', 'L']
                },
                segment_number: {
                    type: 'text',
                    value: false,
                },
                temp: {
                    type: 'text',
                    value: false,
                },
                pain: {
                    type: 'text',
                    value: false,
                },
                f_touch: {
                    type: 'text',
                    value: false,
                }
            })
        }
    }

    /**
     * remove item, from multiselect
     */
    removeitem(index, field) {
        if(field === 'motor_system') {
            this.detailed_exam.nervous_system_examination.motor_system.keys.splice(index, 1);
        }

        if(field === 'sensory_system') {
            this.detailed_exam.nervous_system_examination.sensory_system.keys.splice(index, 1);
        }
    }

    /**
     * update fields
     * @param val
     */
    assemble(val) {
        if(val.details) {
            _.each(val.details, (value, field) => {
                if(value !== null && this.detailed_exam.hasOwnProperty(field) && field !== 'visit_id') {
                    for(var key in this.detailed_exam[field]) {
                        if(this.detailed_exam[field].hasOwnProperty(key)) {
                            this.detailed_exam[field][key] = val.details[field][key];
                        }
                    }
                }
            })
        }
        if(val.general_exam) {
            this.general_exam = val.general_exam;
        }
        if(val.physical_exam) {
            this.physical_exam = val.physical_exam;
        }
    }
}