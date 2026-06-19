/**
 * Created by: jjoek
 * On:  05 Dec, 2020
 */
export const fields = {
    general_exam: {
        patient_condition: {
            type: 'text',
            value: null
        },
        pallor: {
            type: 'bool',
            value: false,
        },
        jaundice: {
            type: 'bool',
            value: false
        },
        central_cyanosis: {
            type: 'bool',
            value: false
        },
        lymphadenopathy: {
            condition: {
                type: 'bool',
                value: false
            },
            location: {
                type: 'text',
                value: null
            }
        },
        edema: {
            sacral: {
                type: 'bool',
                value: false,
            },
            limb: {
                type: 'bool',
                value: false
            }
        },
        notes: {
            type: 'textarea',
            value: null
        }
    },

    physical_exam: {
        heent: {
            type: 'select',
            value: null,
            options: [
                'No abnormalities',
                'Exudate',
                'Bleeding',
                'Other'
            ]
        },
        neurological: {
            type: 'select',
            value: null,
            options: [
                'C-Spine precautions',
                'Awake',
                'Alert',
                'Orient. X3'
            ]
        },
        respiratory: {
            airway: {
                type: 'select',
                value: null,
                options: [
                    'Patent',
                    'Stridor',
                    'Obstructed'
                ]
            },
            respiration_rate: {
                type: 'select',
                value: null,
                options: [
                    'Normal',
                    'Dyspnea',
                    'Tachypnea',
                    'Shallow',
                    'Apnea'
                ]
            },
            breath_sounds: {
                type: 'select',
                value: null,
                options: [
                    'Not ausculated',
                    'clear',
                    'Wheezes',
                    'Crackles',
                    'Diminished',
                    'Absent'
                ]
            },
        },
        cardiovascular: {
            jvp: {
                type: 'text',
                value: null
            },
            general_appearance: {
                type: 'text',
                value: null,
            },

        }
    },

    detailed_exam: {
        cardiovascular_examination: {
            inspection: {
                pallor: {
                    type: 'bool',
                    value: false
                },
                cyanosis: {
                    type: 'bool',
                    value: false
                },
                finger_clubbing: {
                    type: 'bool',
                    value: false
                },
                splinter_haemorrhage: {
                    type: 'bool',
                    value: false
                },
                oslers_nodes: {
                    type: 'bool',
                    value: false
                },
                roth_spots: {
                    type: 'bool',
                    value: false
                },
                janeway_lessions: {
                    type: 'bool',
                    value: false
                },
                coldness_of_extremities: {
                    type: 'bool',
                    value: false
                },
                pyrexia: {
                    type: 'bool',
                    value: false
                },
                oedema: {
                    type: 'bool',
                    value: false
                },
            },

            auscultation: {
                systolic_clicks: {
                    type: 'bool',
                    value: false
                },
                opening_snap: {
                    type: 'bool',
                    value: false
                },
                hearth_murmur: {
                    type: 'text',
                    value: null
                },
                friction_rub: {
                    type: 'bool',
                    value: false
                }
            },

            pulses: {
                blood_pressure: {
                    systolic: {
                        type: 'text',
                        value: null
                    },
                    diastolic: {
                        type: 'text',
                        value: null
                    },
                },
                jugular_venous_pressure: {
                    type: 'text',
                    value: null
                },
                location_of_the_apex_beat: {
                    type: 'text',
                    value: null
                },
            },

            notes: {
                type: 'textarea',
                value: null
            }
        },

        respiratory_examination: {
            inspection: {
                clubbing: {
                    Type: 'bool',
                    value: false
                },
                pallor: {
                    type: 'bool',
                    value: false
                },
                central_cyanosis: {
                    type: 'bool',
                    value: false
                },
                peripheral_cynanosis: {
                    type: 'bool',
                    value: false
                },
                use_of_unnecessary_muscles_of_respiration: {
                    type: 'bool',
                    value: false
                },
                flairing_of_ala_nasae: {
                    type: 'bool',
                    value: false
                },
                wheezing: {
                    type: 'bool',
                    value: false
                },
                stridor: {
                    type: 'bool',
                    value: false
                },
                shape_of_chest: {
                    intercostal_recession: {
                        type: 'bool',
                        value: false
                    },
                    scoliosis: {
                        type: 'bool',
                        value: false
                    },
                    flattening: {
                        type: 'bool',
                        value: false
                    },
                    over_inflation: {
                        type: 'bool',
                        value: false
                    },
                },
                chest_movements: {
                    type: 'text',
                    value: null
                }
            },
            palpation: {
                position_of_the_trachea: {
                    type: 'text',
                    value: null
                },
                position_of_the_apex_beat: {
                    type: 'text',
                    value: null
                },
                swelling: {
                    condition: {
                        type: 'bool',
                        value: false
                    },
                    location: {
                        type: 'text',
                        value: null
                    }
                },
                tenderness: {
                    condition: {
                        type: 'bool',
                        value: false
                    },
                    location: {
                        type: 'text',
                        value: null
                    }
                },
                chest_expansion: {
                    type: 'text',
                    value: null
                }
            },
            percussion: {
                resonance: {
                    type: 'text',
                    value: null
                },
                dullness: {
                    type: 'bool',
                    value: false
                }
            },
            auscultation: {
                air_entry: {
                    type: 'text',
                    value: null
                },
                vesicular_breath_sounds: {
                    type: 'bool',
                    value: false
                },
                bronchial_breath_sounds: {
                    type: 'bool',
                    value: false
                },
                vocal_fremitus: {
                    type: 'text',
                    value: null
                },
                pleural_rub: false,
                crackles: false,
                chest_expansion: null
            },
            notes: {
                type: 'textarea',
                value: null
            }
        },

        nervous_system_examination: {
            head: {
                orifices: {
                    eyes: null,
                    ears: null,
                    nose: null,
                    mouth: null,
                },
                mass: false,
            },
            neck: {
                stiff: false,
                kernigs_sign: null
            },
            spine: {
                curvature: null,
                tenderness: false,
                mass: false,
                orientation: {
                    time: {
                        type: 'text',
                        value: null
                    },
                    place: {
                        type: 'text',
                        value: null
                    },
                    person: {
                        type: 'text',
                        value: null
                    },
                    intelligence: {
                        type: 'text',
                        value: null
                    }
                },
                memory: {
                    registration: {
                        type: 'text',
                        value: null
                    },
                    short_term: {
                        type: 'text',
                        value: null
                    },
                    remote: {
                        type: 'text',
                        value: null
                    }
                },
                speech: {
                    type: 'text',
                    value: null
                },
                graphaesthesia: {
                    type: 'text',
                    value: null
                },
                steriognosis: {
                    type: 'text',
                    value: null
                },
                double_stimulation: {
                    type: 'text',
                    value: null
                },
                assessment_of_neglect: {
                    type: 'text',
                    value: null
                },
            },
            glasgow_coma_scale: {
                eyes: {
                    type: 'text',
                    value: null
                },
                verbal: {
                    type: 'text',
                    value: null
                },
                motor: {
                    type: 'text',
                    value: null
                }
            },
            granial_nerves: {
                olfactory: {
                    type: 'text',
                    value: null
                },
                optic: {
                    type: 'text',
                    value: null
                },
                occulomotor: {
                    type: 'text',
                    value: null
                },
                trochlear: {
                    type: 'text',
                    value: null
                },
                trigeminal: {
                    type: 'text',
                    value: null
                },
                abducens: {
                    type: 'text',
                    value: null
                },
                facial: {
                    type: 'text',
                    value: null
                },
                vestibulo_cochular: {
                    type: 'text',
                    value: null
                },
                glasopharyngeal: {
                    type: 'text',
                    value: null
                },
                vagus: {
                    type: 'text',
                    value: null
                },
                hypoglossal: {
                    type: 'text',
                    value: null
                },
                spinal_accessory: {
                    type: 'text',
                    value: null
                },
            },
            motor_coordination: {
                finger_nose_test: {
                    type: 'text',
                    vakue: null
                },
                rapid_alternating_movement: {
                    type: 'text',
                    vakue: null
                },
                heel_sheen_test: {
                    type: 'text',
                    value: null
                },
                tandem_walkin_test: {
                    type: 'text',
                    value: null
                },
                tibutations: false,
                rombhergs_test: {
                    type: 'text',
                    value: null
                },
                gait: {
                    type: 'text',
                    value: null
                }
            },
            reflexes: {
                jaw_jerk: {
                    type: 'text',
                    value: null
                },
                biceps_tendon: {
                    type: 'text',
                    value: null
                },
                supinator_jerk: {
                    type: 'text',
                    value: null
                },
                ankle_jerk: {
                    type: 'text',
                    value: null
                },
                superfacial_abdominal_reflex: {
                    type: 'text',
                    value: null
                },
                triceps_tendon: {
                    type: 'text',
                    value: null
                },
                brachio_radialis: {
                    type: 'text',
                    value: null
                },
                knee_jerk: {
                    type: 'text',
                    value: null
                },
                plantar_reflex: {
                    type: 'text',
                    value: null
                },
                cremasteric_reflex: {
                    type: 'text',
                    value: null
                },
            },
            motor_system: {},
            sensory_system: {},
        },

        gastrointestinal_examination: {
            inspection: {
                generalisded_distension: {
                    type: 'bool',
                    value: false
                },
                localised_distension: {
                    type: 'bool',
                    value: false
                },
                scaphoid_distension: {
                    type: 'bool',
                    value: false
                },
                umbilicus: {
                    type: 'text',
                    value: null
                },
                movement_of_the_abdominal_wall: {
                    symmetrical_with_respiration: {
                        type: 'bool',
                        value: false
                    },
                    absent: {
                        type: 'bool',
                        value: false
                    },
                    diminished: {
                        type: 'bool',
                        value: false
                    },
                    visible_preistalsis: {
                        type: 'bool',
                        value: false
                    },
                    pulstation: {
                        type: 'bool',
                        value: false
                    },
                },
                skin_and_surface_of_abdomen: {
                    striae: {
                        type: 'bool',
                        value: false
                    },
                    scars: {
                        type: 'bool',
                        value: false
                    },
                    distension_of_veins: {
                        type: 'bool',
                        value: false
                    },
                    pigmentation: {
                        type: 'bool',
                        value: false
                    },
                    wheezing: {
                        type: 'bool',
                        value: false
                    },
                },
                groin_if_male: {
                    testis: {
                        wheezing: {
                            type: 'bool',
                            value: false
                        },
                        position: {
                            type: 'text',
                            value: null
                        },
                        size: {
                            type: 'text',
                            value: null
                        },
                    },
                    hair_distribution: {
                        type: 'text',
                        value: null
                    },
                    lymphadenopathy: {
                        type: 'bool',
                        value: false
                    }
                },
                groin_if_female: {
                    hair_distribution: {
                        type: 'bool',
                        value: false
                    },
                    lymphadenopathy: {
                        type: 'bool',
                        value: false
                    },
                    swellings: {
                        type: 'bool',
                        value: false
                    },
                    tenderness: {
                        type: 'bool',
                        value: false
                    },
                    bruit: {
                        type: 'bool',
                        value: false
                    },
                },
                anus_and_rectum: {
                    pruritus: {
                        type: 'bool',
                        value: false
                    },
                    warts: {
                        type: 'bool',
                        value: false
                    },
                    sinus: {
                        type: 'bool',
                        value: false
                    },
                    issue: {
                        type: 'bool',
                        value: false
                    },
                    abscess: {
                        type: 'bool',
                        value: false
                    },
                    haemorrhoids: {
                        type: 'bool',
                        value: false
                    },
                    ulcer: {
                        type: 'bool',
                        value: false
                    }
                },
                palpation: {
                    shifting_dullness: {
                        type: 'bool',
                        value: false
                    },
                    wheezing: {
                        type: 'bool',
                        value: false
                    },
                    fluid_thrill: {
                        type: 'bool',
                        value: false
                    },
                    organomegally: {
                        left_kidney: {
                            type: 'text',
                            value: null
                        },
                        spleen: {
                            type: 'text',
                            value: null
                        },
                        right_kidney: {
                            type: 'text',
                            value: null
                        },
                        liver: {
                            type: 'text',
                            value: null
                        },
                        gall_bladder: {
                            type: 'text',
                            value: null
                        },
                        urinary_bladder: {
                            type: 'text',
                            value: null
                        },
                    }
                },
                notes: {
                    type: 'text',
                    value: null
                },
            }
        },
    }
}
