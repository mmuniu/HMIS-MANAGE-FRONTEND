import SocketIoClient from "./SocketClient";

export default class ClientSubscriber {

    constructor() {
        this.socketIoClient = new SocketIoClient();
    }

    /**
     * initiation: call up and setup listeners
     */
    init () {
        const channel = window.location.href.split("/")[2].split('.')[0] + '-notification';

        console.log(channel);

        this.socketIoClient.connectTo(channel, this.listenForResultsPosted);
    }

    listenForResultsPosted (data)
    {
        const wrapper_el = document.getElementById('user-notifications-list');

        if(wrapper_el) {
            const html = '<div class="user-notification"><a href="' + data.message.link +'">\n' +
                '                                <div>\n' +
                '                                    <div style="font-size: 14px; font-weight: bold">' + data.message.title + '</div>\n' +
                '                                    \n' +
                '                                    <div>' + data.message.message + '</div>\n' +
                '\n' +
                '                                    <div style="font-size: 11px; display: flex; font-style: italic; justify-content: space-between; width: 300px">\n' +
                '                                        <div>' + data.message.period + '</div>\n' +
                '                                        <div style="padding-right: 20px">' + data.message.type + '</div>\n' +
                '                                    </div>\n' +
                '                                </div>\n' +
                '                            </a></div>\n';

            wrapper_el.insertAdjacentHTML('afterbegin', html);

            //counter
            const nconter = document.getElementById('notifications-counter');

            if (nconter) {
                nconter.innerText = parseInt(nconter.innerText) + 1;
                nconter.classList.add('badge-num');
            }
        }
    }
}
