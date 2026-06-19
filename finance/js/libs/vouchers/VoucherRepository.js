import Base from '@app/libs/Base';
import Form from '@app/libs/Form';

const fields = [
  'code',
  'reward',
  'description',
  'status',
  'expiry_date',
  'usage_limit',
  'times_used',
  'balance',
  'customer_id',
  'condition',
];

export default class Voucher extends Base {
  constructor() {
    super(fields);

    this.form = new Form(fields);

    this.selectedVoucher = false;
  }

  find(id) {
    this.form.submit('get', route('api.finance.vouchers.show', id)).then((response) => {
      this.selectedVoucher = response.data;
    });
  }

  async createVoucher(data) {
    const response = await this.form.submit('post', route('api.finance.vouchers.store'), data);
    if (response) {
      flash(response);
      return response;
    }
  }

  async updateVoucher(id, data) {
    const response = await this.form.submit('post', route('api.finance.vouchers.update', id), data);
    if (response) {
      flash(response);
      return response;
    }
  }

  async deleteVoucher(id) {
    const response = await this.form.submit('post', route('api.finance.vouchers.destroy', id));
    if (response) {
      flash(response);
      return response;
    }
  }

  async downloadAllVouchers(data) {
    const response = await this.form.submit('post', route('api.finance.vouchers.downloadAll'), data);
    if (response) {
      flash(response);
      return response;
    }
  }
}
