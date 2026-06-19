import { shallowMount } from '@vue/test-utils';
import ProductForm from './ProductForm.vue';

describe('ProductForm.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(ProductForm, {
      data() {
        return {
          barcode: '',
          scannedBarcode: '',
        };
      },
      methods: {
        msetting(key) {
          if (key === 'reception.checkin_to_roles') {
            return true;
          }
          return false;
        },
      },
    });
  });

  it('renders barcode input when msetting is true', () => {
    expect(wrapper.find('input[type="text"][label="Scan Barcode"]').exists()).toBe(true);
  });

  it('does not render barcode input when msetting is false', async () => {
    wrapper.setMethods({
      msetting(key) {
        return false;
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('input[type="text"][label="Scan Barcode"]').exists()).toBe(false);
  });

  it('updates scannedBarcode on handleBarcodeScan', () => {
    wrapper.setData({ barcode: '123456789' });
    wrapper.vm.handleBarcodeScan();
    expect(wrapper.vm.scannedBarcode).toBe('123456789');
    expect(wrapper.vm.barcode).toBe('');
  });

  it('clears scannedBarcode after 2 seconds', (done) => {
    jest.useFakeTimers();
    wrapper.setData({ barcode: '123456789' });
    wrapper.vm.handleBarcodeScan();
    expect(wrapper.vm.scannedBarcode).toBe('123456789');
    jest.advanceTimersByTime(2000);
    setTimeout(() => {
      expect(wrapper.vm.scannedBarcode).toBe('');
      done();
    }, 0);
  });
});
