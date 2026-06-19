/**
 * Created by: jjoek
 * On:  24 Jun, 2021
 */
import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './NotifcationsRepository';

export default class Notifications extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.configs = null;
    }

    async markAllNotificationsAsRead() {

        const response = await this.form.submit('post', route('api.system.notifications.mark-all-as-read'))

        if(response) {
            flash(response);

            return response;
        }
    }

    async deleteAllNotifications () {
        const response = await this.form.submit('delete', route('api.system.notifications.delete-all'));

        if(response) {
            flash(response);

            return response;
        }
    }


    async markNotificationAsRead (notification_id) {
        const response = await this.form.submit('post', route('api.system.notifications.mark-as-read', notification_id));

        if(response) {
            flash(response);
            return response;
        }
    }

    async deleteNotification(notification_id) {
        const response = await  this.form.submit('delete', route('api.system.notifications.delete', notification_id))

        if(response) {
            flash(response);
            return response;
        }
    }
}
