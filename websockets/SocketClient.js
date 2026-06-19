 /**
 * Created by: jjoek
 * On:  21 Jun, 2021
 */
 let config = require('./config.json')

 export default class SocketIoClient {

     constructor() {
         let url = window.location.href.split("/")[2];
         const envConfig = process.env.NODE_ENV.trim() !== 'production' ? config.dev : config.prod;

         if(url.split('.').length > 2) {
            this.hostInUse = '//' + url.split('.')[1] + '.' + url.split('.')[2];
         } else {
            this.hostInUse = '//' + url + ':' + envConfig.port;
         }

         this.socket = this.initiateIoConnection();
         this.intervalID ;
         this.reconnectCount = 0;
     }


     initiateIoConnection() {
         if(window.localStorage.getItem('immigrant') !== null) {
             return io.connect(this.hostInUse, {
                 transports: [ 'websocket' ],
                 'forceNew':true,
                 withCredentials: true,
                 secure: false,
                 rejectUnauthorized: false,
                 reconnect: false,
                 'try multiple transports': false,
                 auth: {
                     token: JSON.parse(window.localStorage.getItem('immigrant')).access_token
                 }
             })
         }
     }

     /**
      * @param channel
      * @param callBackAction
      */
     connectTo(channel, callBackAction) {

         const uidentifier = document.getElementById("uidentifier");

         if(window.localStorage.getItem('immigrant') !== null && uidentifier) {
             const self = this;

             self.socket.on('connect', () => {

                 self.socket.emit('subscribe', {
                     channel: channel,
                     customId: uidentifier.innerText
                 });
             });

             self.socket.on('disconnect', function () {
                 console.log('disconnect');
                 //Retry reconnecting every 10 seconds
                 self.intervalID = setInterval(self.tryReconnect, 3000);
             });

             self.socket.on('error', function (err) {
                 console.log('error: ' + err);
             });

             // call callback when any action is observed
             self.socket.on(channel,  (data) => {
                 callBackAction(data);
             });
         }
     }


     /**
      * Implement our own reconnection feature.
      * When the server goes down we make a dummy HTTP-get call to index.html every 4-5 seconds.
      * If the call succeeds, we know that (Express) server sets ***jsessionid*** ,
      * so only then we try socket.io reconnect.
      */
     tryReconnect  () {
         const self = this;

         ++self.reconnectCount;

         if (self.reconnectCount === 5) {

             clearInterval(self.intervalID);
         }

         let t = window.location.href.split(window.location.pathname);
         t.pop();
         let d =  t.join("/") + "/" + "/";

         try {
             let results = fetch(d)
                 .then((resp) => resp.json())
                 .then((data) => {
                     return data;
                 })
                 .catch(function (error) {
                     console.log(error);
                 });

             results.then((result) => {
                 io.connect(self.hostInUse, {
                     reconnect: false,
                     'try multiple transports': false
                 });
                 clearInterval(self.intervalID);
             })
         }catch (e) {
             console.log("http request failed (probably server not up yet)");
         }
     };
 }
