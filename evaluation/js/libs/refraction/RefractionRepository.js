/**
 * Created by: jjoek
 * On:  08 May, 2021
 */
export const fields = {
  visit_id: null,
  prescriptionFile: null,
  prescriptionFileName: null,
  aided_contact_va: {
      left: null,
      right: null,
      ou: null
  },
    presenting: {
      right: {
        near: '',
        sphere: '',
        cylinder: '',
        axis: '',
        va: '',
        nva: '',
        int_add: '',
        h_prism: '',
        type: '',
        v_prism: '',
        bvd: ''
      },
      left: {
        near: '',
        sphere: '',
        cylinder: '',
        axis: '',
        va: '',
        nva: '',
        int_add: '',
        h_prism: '',
        type: '',
        v_prism: '',
        bvd: ''
      }
    },
  aided_spectacles_va: {
      left: null,
      right: null,
      ou: null
  },
  aided_va: {
      left: null,
      right: null,
      ou: null
  },
  unaided_va: {
      left: null,
      right: null,
      ou: null
  },
  pinhole_va: {
      left: null,
      right: null,
      ou: null
  },
  unaided_near_va: {
      left: null,
      right: null,
      ou: null
  },
  aided_near_va: {
      left: null,
      right: null,
      ou: null
  },
  iop: {
      od: null,
      os: null
  },

  subjective: {
      data: [
          {
              right: {
                  sphere: null,
                  cylinder: null,
                  axis: null,
                  near_add: null,
                  duochrome: null,
                  bcva: null,
                  prism_horizontal: null,
                  horizontal_base_direction: null,
                  prism_vertical: null,
                  vertical_base_direction: null
              },
              left: {
                  sphere: null,
                  cylinder: null,
                  axis: null,
                  near_add: null,
                  duochrome: null,
                  bcva: null,
                  prism_horizontal: null,
                  horizontal_base_direction: null,
                  prism_vertical: null,
                  vertical_base_direction: null
              },
              ou: {
                  sphere: null,
                  cylinder: null,
                  axis: null,
                  near_add: null,
                  duochrome: null,
                  bcva: null,
                  prism_horizontal: null,
                  horizontal_base_direction: null,
                  prism_vertical: null,
                  vertical_base_direction: null
              },
              doctors_instructions:null,
              by: null
          }
      ],
      final: false
  },

  objective_refraction: {
      retinoscopy: {
          type: null, // dry or wet
          wet_type: null,
          right: {
              sphere: null,
              cylinder: null,
              axis: null
          },
          left: {
              sphere: null,
              cylinder: null,
              axis: null
          }
      }
  },

  autorefraction: {
      right: {
          sphere: null,
          cylinder: null,
          axis: null
      },
      left: {
          sphere: null,
          cylinder: null,
          axis: null
      }
  },
  present_glasses: {
      right: {
          sphere: null,
          cylinder: null,
          axis: null
      },
      left: {
          sphere: null,
          cylinder: null,
          axis: null
      }
  },
  intra_ocular_pressure: {
      right: {
          i_care: null,
          air_puff: null,
      },
      left: {
          i_care: null,
          air_puff: null
      }
  },

  eyewear_prescription: {
      right: {
          sphere: null,
          cylinder: null,
          axis: null,
          near_add: null,
          prism_horizontal: null,
          horizontal_base_direction: null,
          prism_vertical: null,
          vertical_base_direction: null
      },
      left: {
          sphere: null,
          cylinder: null,
          axis: null,
          near_add: null,
          prism_horizontal: null,
          horizontal_base_direction: null,
          prism_vertical: null,
          vertical_base_direction: null
      },
      ou: {
          sphere: null,
          cylinder: null,
          axis: null,
          near_add: null,
          prism_horizontal: null,
          horizontal_base_direction: null,
          prism_vertical: null,
          vertical_base_direction: null
      }
  },

}
