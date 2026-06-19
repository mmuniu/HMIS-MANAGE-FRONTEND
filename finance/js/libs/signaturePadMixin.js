
export const signaturePadMixin = {
    data() {
        return {
            wsUri: 'wss://local.signotecwebsocket.de:49494',
            PEN_COLOR_GREY: '0x007f7f7f',
            PEN_COLOR_RED: '0x000000ff',
            PEN_COLOR_GREEN: '0x0000ff00',
            PEN_COLOR_BLUE: '0x00ff0000',
            PEN_COLOR_BLACK: '0x00000000',

            MODE_LIST_DEFAULT: 'Default',
            MODE_LIST_API: 'API',
        };
    },


    methods: {
        onMainWindowLoad() {
            websocket = new window.WebSocket(this.wsUri);
            websocket.onopen = function(evt) {
                this.onOpen(evt);
            };
            websocket.onclose = function(evt) {
                this.onClose(evt);
            };
            websocket.onerror = function(evt) {
                this.onError(evt);
            };
            websocket.onmessage = function(evt) {
                this.onMessage(evt);
            };

            chek_boxes_selectedElements_onchange();
            ModeListName_onchange();
        },

        onOpen(evt) {
            state.className = 'success';
            state.innerHTML = 'Connected to server ' + wsUri;
        },

        onClose(evt) {
            state.className = 'fail';
            state.innerHTML = 'Not connected';
        },

        onError(evt) {
            state.className = 'fail';
            state.innerHTML = 'Communication error';
        },

        onMessage(evt) {
            const message = evt.data;
            logMessage(message);

            const obj = JSON.parse(message);
            if (obj.TOKEN_TYPE == 'TOKEN_TYPE_SEND') {
                if (obj.TOKEN_CMD == 'TOKEN_CMD_SELECTION_CHANGE') {
                    // change selecting process
                    selection_change(obj);
                }
                if (obj.TOKEN_CMD == 'TOKEN_CMD_SELECTION_CONFIRM') {
                    // confirm selecting process
                    selection_confirm();
                }
                if (obj.TOKEN_CMD == 'TOKEN_CMD_SELECTION_CANCEL') {
                    // cancel selecting process
                    selection_cancel();
                }
                if (obj.TOKEN_CMD == 'TOKEN_CMD_SIGNATURE_CONFIRM') {
                    // confirm signing process
                    signature_confirm();
                } else if (obj.TOKEN_CMD == 'TOKEN_CMD_SIGNATURE_RETRY') {
                    // restart signing process
                    signature_retry();
                } else if (obj.TOKEN_CMD == 'TOKEN_CMD_SIGNATURE_CANCEL') {
                    // cancel signing process
                    signature_cancel();
                } else if (obj.TOKEN_CMD == 'TOKEN_CMD_SIGNATURE_POINT') {
                    var ctx = sigcanvas.getContext('2d');

                    ctx.fillStyle = '#fff';

                    switch (document.getElementById('signaturePenColorSelect').value) {
                    case PEN_COLOR_GREY:
                        ctx.strokeStyle = '#7F7F7F';
                        break;

                    case PEN_COLOR_RED:
                        ctx.strokeStyle = '#FF0000';
                        break;

                    case PEN_COLOR_GREEN:
                        ctx.strokeStyle = '#00FF00';
                        break;

                    case PEN_COLOR_BLUE:
                        ctx.strokeStyle = '#0000FF';
                        break;

                    case PEN_COLOR_BLACK:
                        ctx.strokeStyle = '#000000';
                        break;

                    default:
                        ctx.strokeStyle = '#FF0000';
                        break;
                    }

                    ctx.lineWidth = 4.5;
                    ctx.lineCap = 'round';

                    if (obj.TOKEN_PARAM_POINT.p == 0) {
                        drawStrokeStartPoint(ctx, obj.TOKEN_PARAM_POINT.x * scaleFactorX, obj.TOKEN_PARAM_POINT.y * scaleFactorY);
                    } else {
                        drawStrokePoint(ctx, obj.TOKEN_PARAM_POINT.x * scaleFactorX, obj.TOKEN_PARAM_POINT.y * scaleFactorY);
                    }
                } else if (obj.TOKEN_CMD == 'TOKEN_CMD_DISCONNECT') {
                    // the opened pad has been disconnected
                    disconnect();
                } else if (obj.TOKEN_CMD == 'TOKEN_CMD_API_SENSOR_HOT_SPOT_PRESSED') {
                    const button = obj.TOKEN_PARAM_HOTSPOT_ID;
                    switch (button) {
                    case cancelButton:
                        // cancel signing process
                        signature_cancel();
                        break;

                    case retryButton:
                        // restart signing process
                        signature_retry();
                        break;

                    case confirmButton:
                        // confirm signing process
                        signature_confirm();
                        break;

                    default:
                        alert('unknown button id: ' + button);
                    }
                } else if (obj.TOKEN_CMD == 'TOKEN_CMD_ERROR') {
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to confirm the signature. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        return;
                    }
                } else {
                    // do nothing
                }
            } else if (obj.TOKEN_TYPE == 'TOKEN_TYPE_RESPONSE') {
                if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_SELECTION_CONFIRM') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to confirm the signature. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }
                }

                if ((obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_SIGNATURE_CONFIRM') || (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_SIGNATURE_CONFIRM')) {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to confirm the signature. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }

                    signature_sign_data();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_SIGNATURE_SIGN_DATA') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to get signature SignData. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }

                    document.getElementById('SignData_0').value = obj.TOKEN_PARAM_SIGNATURE_SIGN_DATA;

                    if (!(obj.TOKEN_PARAM_CERT_ID === undefined)) {
                        document.getElementById('CertID_0').innerHTML = obj.TOKEN_PARAM_CERT_ID;
                    }

                    signature_image();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_SIGNATURE_IMAGE') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to get signature image. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }

                    document.getElementById('Signature_0').src = 'data:image/png;base64,' + obj.TOKEN_PARAM_FILE;

                    close_pad();
                } else if ((obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_SIGNATURE_RETRY') || (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_SIGNATURE_RETRY')) {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to restart signature process. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }

                    var ctx = sigcanvas.getContext('2d');
                    ctx.clearRect(0, 0, sigcanvas.width, sigcanvas.height);
                } else if ((obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_SIGNATURE_CANCEL') || (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_SIGNATURE_CANCEL')) {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to cancel signature process. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }

                    var ctx = sigcanvas.getContext('2d');
                    ctx.clearRect(0, 0, sigcanvas.width, sigcanvas.height);

                    close_pad();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_SEARCH_FOR_PADS') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('The search for pads failed. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        searchState = searchStates.setPadType;
                        openState = openStates.openPad;
                        preparationState = preparationStates.setDisplayRotation;
                        return;
                    }

                    // check for connected pads
                    if (obj.TOKEN_PARAM_CONNECTED_PADS == null) {
                        alert('No connected pads have been found.');
                        searchState = searchStates.setPadType;
                        openState = openStates.openPad;
                        preparationState = preparationStates.setDisplayRotation;
                        return;
                    }

                    // show the pads properties
                    document.getElementById('PadType_0').innerHTML = obj.TOKEN_PARAM_CONNECTED_PADS[0].TOKEN_PARAM_PAD_TYPE;
                    document.getElementById('SerialNumber_0').innerHTML = obj.TOKEN_PARAM_CONNECTED_PADS[0].TOKEN_PARAM_PAD_SERIAL_NUMBER;
                    document.getElementById('FirmwareVersion_0').innerHTML = obj.TOKEN_PARAM_CONNECTED_PADS[0].TOKEN_PARAM_PAD_FIRMWARE_VERSION;

                    if (obj.TOKEN_PARAM_CONNECTED_PADS[0].TOKEN_PARAM_PAD_CAPABILITIES & deviceCapabilities.SupportsRSA) {
                        supportsRSA = true;
                    } else {
                        supportsRSA = false;
                    }

                    if (supportsRSA) {
                        document.getElementById('RSASupport_0').innerHTML = 'Yes';
                    } else {
                        document.getElementById('RSASupport_0').innerHTML = 'No';
                    }

                    // try to open the connected pad
                    open_pad();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_OPEN_PAD') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to open pad. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        searchState = searchStates.setPadType;
                        openState = openStates.openPad;
                        preparationState = preparationStates.setDisplayRotation;
                        return;
                    }

                    // set canvas size
                    sigcanvas.width = obj.TOKEN_PARAM_PAD_DISPLAY_WIDTH;
                    sigcanvas.height = obj.TOKEN_PARAM_PAD_DISPLAY_HEIGHT;

                    // get scale factor from siganture resolution to canvas
                    scaleFactorX = obj.TOKEN_PARAM_PAD_DISPLAY_WIDTH / obj.TOKEN_PARAM_PAD_X_RESOLUTION;
                    scaleFactorY = obj.TOKEN_PARAM_PAD_DISPLAY_HEIGHT / obj.TOKEN_PARAM_PAD_Y_RESOLUTION;

                    // start the signature process
                    // signature_start();
                    selection_dialog();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_SELECTION_DIALOG') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to selection dialog process. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_SELECTION_CHANGE') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to selection dialog process. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_SELECTION_CONFIRM') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to selection dialog process. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_SELECTION_CANCEL') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to selection dialog process. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_SIGNATURE_START') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to start signature process. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }
                } else if ((obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_CLOSE_PAD') || (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_DEVICE_CLOSE')) {
                    searchState = searchStates.setPadType;
                    openState = openStates.openPad;
                    preparationState = preparationStates.setDisplayRotation;
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        // alert("Failed to close pad. Reason: " + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        console.log('Failed to close pad. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        return;
                    }
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_DEVICE_SET_COM_PORT') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to set pad type. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        searchState = searchStates.setPadType;
                        openState = openStates.openPad;
                        preparationState = preparationStates.setDisplayRotation;
                        return;
                    }

                    // search for pads
                    searchState = searchStates.search;
                    search_for_pads();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_DEVICE_GET_COUNT') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('The search for pads failed. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        // search finished, reset search state
                        searchState = searchStates.setPadType;
                        openState = openStates.openPad;
                        preparationState = preparationStates.setDisplayRotation;
                        return;
                    }

                    // check for connected pads
                    if (ret == 0) {
                        alert('No connected pads have been found.');
                        // search finished, reset search state
                        searchState = searchStates.setPadType;
                        openState = openStates.openPad;
                        preparationState = preparationStates.setDisplayRotation;
                        return;
                    }

                    // get device info
                    searchState = searchStates.getInfo;
                    search_for_pads();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_DEVICE_GET_INFO') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to get device info. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        searchState = searchStates.setPadType;
                        openState = openStates.openPad;
                        preparationState = preparationStates.setDisplayRotation;
                        return;
                    }

                    // remember pad type, get image and get button size
                    padType = parseInt(obj.TOKEN_PARAM_TYPE);
                    switch (padType) {
                    case padTypes.sigmaUSB:
                    case padTypes.sigmaSerial:
                        getBackgroundImage('Sigma.png');
                        buttonSize = 36;
                        buttonTop = 2;
                        break;

                    case padTypes.omegaUSB:
                    case padTypes.omegaSerial:
                        getBackgroundImage('Omega.png');
                        buttonSize = 48;
                        buttonTop = 4;
                        break;

                    case padTypes.gammaUSB:
                    case padTypes.gammaSerial:
                        getBackgroundImage('Gamma.png');
                        buttonSize = 48;
                        buttonTop = 4;
                        break;

                    case padTypes.deltaUSB:
                    case padTypes.deltaSerial:
                    case padTypes.deltaIP:
                        getBackgroundImage('Delta.png');
                        buttonSize = 48;
                        buttonTop = 4;
                        break;

                    case padTypes.alphaUSB:
                    case padTypes.alphaSerial:
                    case padTypes.alphaIP:
                        getBackgroundImage('Alpha.png');
                        buttonSize = 80;
                        buttonTop = 10;
                        break;
                    }

                    // print device info
                    document.getElementById('PadType_0').innerHTML = obj.TOKEN_PARAM_TYPE;
                    document.getElementById('SerialNumber_0').innerHTML = obj.TOKEN_PARAM_SERIAL;

                    // get firmware version
                    searchState = searchStates.getVersion;
                    search_for_pads();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_DEVICE_GET_VERSION') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to get device version. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        searchState = searchStates.setPadType;
                        openState = openStates.openPad;
                        preparationState = preparationStates.setDisplayRotation;
                        return;
                    }

                    // print firmware version
                    document.getElementById('FirmwareVersion_0').innerHTML = obj.TOKEN_PARAM_VERSION;

                    // search finished, reset search state
                    searchState = searchStates.setPadType;

                    // try to open the connected pad
                    open_pad();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_DEVICE_OPEN') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to open pad. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        searchState = searchStates.setPadType;
                        openState = openStates.openPad;
                        preparationState = preparationStates.setDisplayRotation;
                        return;
                    }

                    // set color
                    openState = openStates.setColor;
                    open_pad();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_DISPLAY_CONFIG_PEN') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to set color. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        searchState = searchStates.setPadType;
                        openState = openStates.openPad;
                        preparationState = preparationStates.setDisplayRotation;
                        return;
                    }

                    // get display width
                    openState = openStates.getDisplayWidth;
                    open_pad();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_DISPLAY_GET_WIDTH') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to get display width. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        searchState = searchStates.setPadType;
                        openState = openStates.openPad;
                        preparationState = preparationStates.setDisplayRotation;
                        return;
                    }

                    // remember width
                    displayWidth = ret;

                    // get display height
                    openState = openStates.getDisplayHeight;
                    open_pad();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_DISPLAY_GET_HEIGHT') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to get display height. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        searchState = searchStates.setPadType;
                        openState = openStates.openPad;
                        preparationState = preparationStates.setDisplayRotation;
                        return;
                    }

                    // remember height
                    displayHeight = ret;

                    // get signature point resolution
                    openState = openStates.getResolution;
                    open_pad();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_SIGNATURE_GET_RESOLUTION') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to get signature resolution. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        searchState = searchStates.setPadType;
                        openState = openStates.openPad;
                        preparationState = preparationStates.setDisplayRotation;
                        return;
                    }

                    // set canvas size
                    sigcanvas.width = displayWidth;
                    sigcanvas.height = displayHeight;

                    // get scale factor from siganture resolution to canvas
                    scaleFactorX = displayWidth / obj.TOKEN_PARAM_PAD_X_RESOLUTION;
                    scaleFactorY = displayHeight / obj.TOKEN_PARAM_PAD_Y_RESOLUTION;

                    // reset open state
                    openState = openStates.openPad;

                    // start the signature process
                    signature_start();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_DISPLAY_SET_TARGET') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to set display target. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }

                    switch (preparationState) {
                    case preparationStates.setBackgroundTarget:
                        // set background image
                        preparationState = preparationStates.setBackgroundImage;
                        break;

                    case preparationStates.setForegroundTarget:
                        // switch buffers to display dialog
                        preparationState = preparationStates.switchBuffers;
                        break;

                    default:
                        preparationState = preparationStates.setDisplayRotation;
                        alert('invalid preparationState');
                        return;
                    }

                    signature_start();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_DISPLAY_SET_ROTATION') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to set background image. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }

                    // get display dotation
                    preparationState = preparationStates.getDisplayRotation;
                    signature_start();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_DISPLAY_GET_ROTATION') {
                    let rotation = 0;
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to set background image. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }

                    rotation = obj.TOKEN_PARAM_RETURN_CODE;

                    // set background target
                    preparationState = preparationStates.setBackgroundTarget;
                    signature_start();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_DISPLAY_SET_IMAGE') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to set background image. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }

                    // set cancel button
                    preparationState = preparationStates.setCancelButton;
                    signature_start();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_SENSOR_ADD_HOT_SPOT') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to add button. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }

                    switch (preparationState) {
                    case preparationStates.setCancelButton:
                        cancelButton = ret;
                        // set retry button
                        preparationState = preparationStates.setRetryButton;
                        break;

                    case preparationStates.setRetryButton:
                        retryButton = ret;
                        // set confirm button
                        preparationState = preparationStates.setConfirmButton;
                        break;

                    case preparationStates.setConfirmButton:
                        confirmButton = ret;
                        // set signature rectangle
                        preparationState = preparationStates.setSignRect;
                        break;

                    default:
                        preparationState = preparationStates.setDisplayRotation;
                        alert('invalid preparationState');
                        return;
                    }
                    signature_start();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_SENSOR_SET_SIGN_RECT') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to set signature rectangle. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }

                    // set field name
                    preparationState = preparationStates.setFieldName;
                    signature_start();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_DISPLAY_SET_TEXT_IN_RECT') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to set text. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }

                    switch (preparationState) {
                    case preparationStates.setFieldName:
                        // set custom text
                        preparationState = preparationStates.setCustomText;
                        break;

                    case preparationStates.setCustomText:
                        // set foreground target
                        preparationState = preparationStates.setForegroundTarget;
                        break;

                    default:
                        preparationState = preparationStates.setDisplayRotation;
                        alert('invalid preparationState');
                        return;
                    }
                    signature_start();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_DISPLAY_SET_IMAGE_FROM_STORE') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to switch buffers. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }

                    // start signing process
                    preparationState = preparationStates.startSignature;
                    signature_start();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_SIGNATURE_START') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to start signing process. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }

                    // reset preparationState
                    preparationState = preparationStates.setDisplayRotation;
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_SIGNATURE_GET_SIGN_DATA') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to get signature SignData. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }

                    document.getElementById('SignData_0').value = obj.TOKEN_PARAM_SIGN_DATA;

                    signature_image();
                } else if (obj.TOKEN_CMD_ORIGIN == 'TOKEN_CMD_API_SIGNATURE_SAVE_AS_STREAM_EX') {
                    // check the return code
                    var ret = obj.TOKEN_PARAM_RETURN_CODE;
                    if (ret < 0) {
                        alert('Failed to get signature image. Reason: ' + obj.TOKEN_PARAM_ERROR_DESCRIPTION);
                        close_pad();
                        return;
                    }

                    document.getElementById('Signature_0').src = 'data:image/png;base64,' + obj.TOKEN_PARAM_IMAGE;

                    close_pad();
                } else {
                    // do nothing
                }
            } else {
                // do nothing
            }
        },

        logMessage(msg) {
            log.innerHTML = '<li>' + msg + '</li>';
        },

        /**
        * Draws a stroke start point into the canvas.
        */
        drawStrokeStartPoint(canvasContext, softCoordX, softCoordY) {
            // open new stroke's path
            canvasContext.beginPath();
            canvasContext.arc(softCoordX, softCoordY, 0.1, 0, 2 * Math.PI, true);
            canvasContext.fill();
            canvasContext.stroke();
            canvasContext.moveTo(softCoordX, softCoordY);
        },

        /**
        * Draws a stroke point into the canvas.
        */
        drawStrokePoint(canvasContext, softCoordX, softCoordY) {
            // continue after start or not start point
            canvasContext.lineTo(softCoordX, softCoordY);
            canvasContext.stroke();
        },

        getSignature() {
            // version = '"1.0.0.0"';
            // version = '"1.0.2.4"';

            // set the json interface version
            // var message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_SET_INTERFACE_VERSION", "TOKEN_PARAM_VERSION":' + version + ' }';
            // websocket.send(message);
            // logMessage(message);

            const objMode = document.getElementById('ModeList');
            if (objMode.selectedIndex == -1) {
                // if the mode is not selected message to user and return
                alert('Please select a mode from the list!');
                objMode.focus();
                return;
            }
            websocketMode = objMode.selectedIndex;

            // reset the pads properties
            document.getElementById('PadType_0').innerHTML = '';
            document.getElementById('SerialNumber_0').innerHTML = '';
            document.getElementById('FirmwareVersion_0').innerHTML = '';
            document.getElementById('RSASupport_0').innerHTML = '';
            document.getElementById('CertID_0').innerHTML = '';

            // delete the previous signature
            const ctx = sigcanvas.getContext('2d');
            ctx.clearRect(0, 0, sigcanvas.width, sigcanvas.height);

            document.getElementById('Signature_0').src = 'White.png';
            document.getElementById('SignData_0').value = '';

            search_for_pads();
        },

        clearSignature() {
            document.getElementById('ModeList').selectedIndex = 0;
            document.getElementById('PadTypeList').selectedIndex = 0;
            document.getElementById('SignData_0').value = '';
        },

        // TOKEN_CMD_SEARCH_FOR_PADS
        search_for_pads() {
            const objPadType = document.getElementById('PadTypeList');
            if (objPadType.selectedIndex == -1) {
                // if the pad type is not selected message to user and return
                alert('Please select a pad type from the list!');
                objPadType.focus();
                return;
            }

            let message;
            if (websocketMode == websocketModes.Default) {
                // default mode
                if (objPadType.selectedIndex == 0) {
                    // search for USB pads
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_SEARCH_FOR_PADS", "TOKEN_PARAM_PAD_SUBSET":"HID" }';
                } else {
                    // search for serial pads
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_SEARCH_FOR_PADS", "TOKEN_PARAM_PAD_SUBSET":"All" }';
                }
            } else if (websocketMode == websocketModes.API) {
                // API mode
                switch (searchState) {
                case searchStates.setPadType:
                    if (objPadType.selectedIndex == 0) {
                        // search for USB pads
                        message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_DEVICE_SET_COM_PORT", "TOKEN_PARAM_PORT_LIST":"HID" }';
                    } else {
                        // search for serial pads
                        message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_DEVICE_SET_COM_PORT", "TOKEN_PARAM_PORT_LIST":"All" }';
                    }
                    break;

                case searchStates.search:
                    // search for pads
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_DEVICE_GET_COUNT" }';
                    break;

                case searchStates.getInfo:
                    // get info of first pad
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_DEVICE_GET_INFO", "TOKEN_PARAM_INDEX":"0" }';
                    break;

                case searchStates.getVersion:
                    // get firmware version of first pad
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_DEVICE_GET_VERSION", "TOKEN_PARAM_INDEX":"0" }';
                    break;

                default:
                    searchState = searchStates.setPadType;
                    alert('invalid searchState');
                    return;
                }
            } else {
                alert('invalid websocketMode');
                return;
            }
            websocket.send(message);
            logMessage(message);
        },

        // TOKEN_CMD_OPEN_PAD
        open_pad() {
            // open the pad with index 0
            let message;
            if (websocketMode == websocketModes.Default) {
                // default mode
                message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_OPEN_PAD", "TOKEN_PARAM_PAD_INDEX":"0" }';
            } else if (websocketMode == websocketModes.API) {
                // API mode
                switch (openState) {
                case openStates.openPad:
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_DEVICE_OPEN", "TOKEN_PARAM_INDEX":"0", "TOKEN_PARAM_ERASE_DISPLAY":"FALSE" }';
                    break;

                case openStates.setColor:
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_DISPLAY_CONFIG_PEN' +
                            '", "TOKEN_PARAM_WIDTH":"' + '3' +
                            '", "TOKEN_PARAM_PEN_COLOR":"' + document.getElementById('signaturePenColorSelect').value +
                            '" }';
                    break;

                case openStates.getDisplayWidth:
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_DISPLAY_GET_WIDTH" }';
                    break;

                case openStates.getDisplayHeight:
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_DISPLAY_GET_HEIGHT" }';
                    break;

                case openStates.getResolution:
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_SIGNATURE_GET_RESOLUTION" }';
                    break;

                default:
                    openState = openStates.openPad;
                    alert('invalid openState');
                    return;
                }
            } else {
                alert('invalid websocketMode');
                return;
            }
            websocket.send(message);
            logMessage(message);
        },

        // TOKEN_CMD_SELECTION_DIALOG
        selection_dialog() {
            if (websocketMode == websocketModes.Default) {
                // default mode
                let message;
                const selectedElement = document.getElementById('chek_boxes_selectedElements').value;
                // console.log(selectedElement);
                if (websocketMode == websocketModes.Default) {
                    message = '{"TOKEN_TYPE": "TOKEN_TYPE_REQUEST",' +
                        '"TOKEN_CMD": "TOKEN_CMD_SELECTION_DIALOG",' +
                        '"TOKEN_PARAM_FIELD_LIST": [';
                    for (i = 1; i <= selectedElement; i++) {
                        console.log('fieldID' + i);
                        message += '{"TOKEN_PARAM_FIELD_ID": "' + document.getElementById('fieldID' + i).value + '", ' +
                            '"TOKEN_PARAM_FIELD_TEXT": "' + document.getElementById('fieldText' + i).value + '", ' +
                            '"TOKEN_PARAM_FIELD_CHECKED": "' + document.getElementById('fieldChecked' + i).checked + '", ' +
                            '"TOKEN_PARAM_FIELD_REQUIRED": "' + document.getElementById('fieldRequired' + i).checked + '"}';
                        if (i < selectedElement) {
                            message += ', ';
                        }
                    }
                    message += ']}';
                    console.log(message);
                }
                websocket.send(message);
                logMessage(message);
            } else if (websocketMode == websocketModes.API) {
                // API mode
                // do nothing
            } else {
                alert('invalid websocketMode');
                return;
            }
        },

        // TOKEN_CMD_SELECTION_CHANGE
        selection_change(changeData) {
            if (websocketMode == websocketModes.Default) {
                // default mode
                console.log(changeData);
                const fieldId = changeData.TOKEN_PARAM_FIELD_ID;
                const fieldChecked = changeData.TOKEN_PARAM_FIELD_CHECKED;

                for (i = 1; i <= document.getElementById('chek_boxes_selectedElements').value; i++) {
                    if (document.getElementById('fieldID' + i).value == fieldId) {
                        if (fieldChecked == 'TRUE') {
                            document.getElementById('fieldChecked' + i).checked = true;
                        } else {
                            document.getElementById('fieldChecked' + i).checked = false;
                        }
                    }
                }
            } else if (websocketMode == websocketModes.API) {
                // API mode
                // do nothing
            } else {
                alert('invalid websocketMode');
                return;
            }
        },

        // TOKEN_CMD_SELECTION_CONFIRM
        selection_confirm() {
            if (websocketMode == websocketModes.Default) {
                // default mode
                let status = '';
                for (i = 1; i <= document.getElementById('chek_boxes_selectedElements').value; i++) {
                    // status += 'Field ' + i + ' = ' + document.getElementById("fieldChecked" + i).checked + '\n';
                    status += 'Patient Action: ' + document.getElementById('fieldChecked' + i).checked + '\n';
                }
                alert(status);
                signature_start();
            } else if (websocketMode == websocketModes.API) {
                // API mode
                // do nothing
            } else {
                alert('invalid websocketMode');
                return;
            }
        },

        // TOKEN_CMD_SELECTION_CANCEL
        selection_cancel() {
            if (websocketMode == websocketModes.Default) {
                // default mode
                const ctx = sigcanvas.getContext('2d');
                ctx.clearRect(0, 0, sigcanvas.width, sigcanvas.height);

                close_pad();
            } else if (websocketMode == websocketModes.API) {
                // API mode
                // do nothing
            } else {
                alert('invalid websocketMode');
                return;
            }
        },

        // TOKEN_CMD_SIGNATURE_START
        signature_start() {
            let message;
            let dochash;
            if (websocketMode == websocketModes.Default) {
                // default mode
                switch (docHash) {
                case docHashes.kSha1:
                    dochash = 'AAECAwQFBgcICQoLDA0ODxAREhM=';
                    break;

                case docHashes.kSha256:
                    dochash = 'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8=';
                    break;

                default:
                    alert('unkown doc hash');
                    return;
                }

                if (supportsRSA) {
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_SIGNATURE_START", "TOKEN_PARAM_FIELD_NAME":"' + field_name +
                        '", "TOKEN_PARAM_CUSTOM_TEXT":"' + custom_text +
                        '", "TOKEN_PARAM_PAD_ENCRYPTION":"' + encryption +
                        '", "TOKEN_PARAM_DOCHASH":"' + dochash +
                        '", "TOKEN_PARAM_ENCRYPTION_CERT":"' + encryption_cert +
                        '" }';
                } else {
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_SIGNATURE_START", "TOKEN_PARAM_FIELD_NAME":"' + field_name +
                        '", "TOKEN_PARAM_CUSTOM_TEXT":"' + custom_text +
                        '" }';
                }
            } else if (websocketMode == websocketModes.API) {
                // API mode
                switch (preparationState) {
                case preparationStates.setBackgroundTarget:
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_DISPLAY_SET_TARGET", "TOKEN_PARAM_TARGET":"1" }';
                    break;

                case preparationStates.setBackgroundImage:
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_DISPLAY_SET_IMAGE", "TOKEN_PARAM_X_POS":"0", "TOKEN_PARAM_Y_POS":"0", "TOKEN_PARAM_BITMAP":"' + backgroundImage + '" }';
                    break;

                case preparationStates.setCancelButton:
                case preparationStates.setRetryButton:
                case preparationStates.setConfirmButton:
                    switch (preparationState) {
                    case preparationStates.setCancelButton:
                        buttonDiff = displayWidth / 3;
                        buttonLeft = (buttonDiff - buttonSize) / 2;
                        break;

                    case preparationStates.setRetryButton:
                    case preparationStates.setConfirmButton:
                        buttonLeft = buttonLeft + buttonDiff;
                        break;

                    default:
                        preparationState = preparationStates.setDisplayRotation;
                        alert('invalid preparationState');
                        return;
                    }
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_SENSOR_ADD_HOT_SPOT", "TOKEN_PARAM_LEFT":"' + Math.round(buttonLeft) + '", "TOKEN_PARAM_TOP":"' + buttonTop + '", "TOKEN_PARAM_WIDTH":"' + buttonSize + '", "TOKEN_PARAM_HEIGHT":"' + buttonSize + '" }';
                    break;

                case preparationStates.setSignRect:
                    var top;
                    switch (padType) {
                    case padTypes.sigmaUSB:
                    case padTypes.sigmaSerial:
                        top = 40;
                        break;

                    case padTypes.omegaUSB:
                    case padTypes.omegaSerial:
                    case padTypes.gammaUSB:
                    case padTypes.gammaSerial:
                    case padTypes.deltaUSB:
                    case padTypes.deltaSerial:
                    case padTypes.deltaIP:
                        top = 56;
                        break;

                    case padTypes.alphaUSB:
                    case padTypes.alphaSerial:
                    case padTypes.alphaIP:
                        top = 100;
                        break;

                    default:
                        alert('unkown pad type');
                        return;
                    }
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_SENSOR_SET_SIGN_RECT", "TOKEN_PARAM_LEFT":"0", "TOKEN_PARAM_TOP":"' + top + '", "TOKEN_PARAM_WIDTH":"0", "TOKEN_PARAM_HEIGHT":"0" }';
                    break;

                case preparationStates.setFieldName:
                    var left;
                    var top;
                    var width;
                    var height;
                    switch (padType) {
                    case padTypes.sigmaUSB:
                    case padTypes.sigmaSerial:
                        left = 15;
                        top = 43;
                        width = 285;
                        height = 18;
                        break;

                    case padTypes.omegaUSB:
                    case padTypes.omegaSerial:
                        left = 40;
                        top = 86;
                        width = 570;
                        height = 40;
                        break;

                    case padTypes.gammaUSB:
                    case padTypes.gammaSerial:
                        left = 40;
                        top = 86;
                        width = 720;
                        height = 40;
                        break;

                    case padTypes.deltaUSB:
                    case padTypes.deltaSerial:
                    case padTypes.deltaIP:
                        left = 40;
                        top = 86;
                        width = 1200;
                        height = 50;
                        break;

                    case padTypes.alphaUSB:
                    case padTypes.alphaSerial:
                    case padTypes.alphaIP:
                        left = 20;
                        top = 120;
                        width = 730;
                        height = 30;
                        break;

                    default:
                        alert('unkown pad type');
                        return;
                    }
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_DISPLAY_SET_TEXT_IN_RECT", "TOKEN_PARAM_LEFT":"' + left + '", "TOKEN_PARAM_TOP":"' + top + '", "TOKEN_PARAM_WIDTH":"' + width + '", "TOKEN_PARAM_HEIGHT":"' + height + '", "TOKEN_PARAM_ALIGNMENT":"3", "TOKEN_PARAM_TEXT":"Signature 1" }';
                    break;

                case preparationStates.setCustomText:
                    var left;
                    var top;
                    var width;
                    var height;
                    switch (padType) {
                    case padTypes.sigmaUSB:
                    case padTypes.sigmaSerial:
                        left = 15;
                        top = 110;
                        width = 265;
                        height = 18;
                        break;

                    case padTypes.omegaUSB:
                    case padTypes.omegaSerial:
                        left = 40;
                        top = 350;
                        width = 520;
                        height = 40;
                        break;

                    case padTypes.gammaUSB:
                    case padTypes.gammaSerial:
                        left = 40;
                        top = 350;
                        width = 670;
                        height = 40;
                        break;

                    case padTypes.deltaUSB:
                    case padTypes.deltaSerial:
                    case padTypes.deltaIP:
                        left = 40;
                        top = 640;
                        width = 670;
                        height = 50;
                        break;

                    case padTypes.alphaUSB:
                    case padTypes.alphaSerial:
                    case padTypes.alphaIP:
                        left = 20;
                        top = 1316;
                        width = 730;
                        height = 30;
                        break;

                    default:
                        alert('unkown pad type');
                        return;
                    }
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_DISPLAY_SET_TEXT_IN_RECT", "TOKEN_PARAM_LEFT":"' + left + '", "TOKEN_PARAM_TOP":"' + top + '", "TOKEN_PARAM_WIDTH":"' + width + '", "TOKEN_PARAM_HEIGHT":"' + height + '", "TOKEN_PARAM_ALIGNMENT":"3", "TOKEN_PARAM_TEXT":"Please sign!" }';
                    break;

                case preparationStates.setForegroundTarget:
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_DISPLAY_SET_TARGET", "TOKEN_PARAM_TARGET":"0" }';
                    break;

                case preparationStates.switchBuffers:
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_DISPLAY_SET_IMAGE_FROM_STORE", "TOKEN_PARAM_STORE_ID":"1" }';
                    break;

                case preparationStates.setDisplayRotation:
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_DISPLAY_SET_ROTATION", "TOKEN_PARAM_ROTATION":"0" }';
                    break;

                case preparationStates.getDisplayRotation:
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_DISPLAY_GET_ROTATION" }';
                    break;

                case preparationStates.startSignature:
                    message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_SIGNATURE_START" }';
                    break;

                default:
                    preparationState = preparationStates.setDisplayRotation;
                    alert('invalid preparationState');
                    return;
                }
            } else {
                alert('invalid websocketMode');
                return;
            }
            websocket.send(message);
            logMessage(message);
        },

        // TOKEN_CMD_SIGNATURE_CONFIRM
        signature_confirm() {
            let message;
            if (websocketMode == websocketModes.Default) {
                // default mode
                message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_SIGNATURE_CONFIRM" }';
            } else if (websocketMode == websocketModes.API) {
                // API mode
                message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_SIGNATURE_CONFIRM" }';
            } else {
                alert('invalid websocketMode');
                return;
            }
            websocket.send(message);
            logMessage(message);
        },

        // TOKEN_CMD_SIGNATURE_RETRY
        signature_retry() {
            let message;
            if (websocketMode == websocketModes.Default) {
                // default mode
                message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_SIGNATURE_RETRY" }';
            } else if (websocketMode == websocketModes.API) {
                // API mode
                message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_SIGNATURE_RETRY" }';
            } else {
                alert('invalid websocketMode');
                return;
            }
            websocket.send(message);
            logMessage(message);
        },

        // TOKEN_CMD_SIGNATURE_CANCEL
        signature_cancel() {
            let message;
            if (websocketMode == websocketModes.Default) {
                // default mode
                message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_SIGNATURE_CANCEL" }';
            } else if (websocketMode == websocketModes.API) {
                // API mode
                message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_SIGNATURE_CANCEL", "TOKEN_PARAM_ERASE":"0" }';
            } else {
                alert('invalid websocketMode');
                return;
            }
            websocket.send(message);
            logMessage(message);
        },

        // TOKEN_CMD_DISCONNECT
        disconnect() {
            alert('The pad has been disconnected.');
        },

        // TOKEN_CMD_CLOSE_PAD
        close_pad() {
            let message;
            if (websocketMode == websocketModes.Default) {
                // default mode
                message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_CLOSE_PAD", "TOKEN_PARAM_PAD_INDEX":"0" }';
            } else if (websocketMode == websocketModes.API) {
                // API mode
                message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_DEVICE_CLOSE", "TOKEN_PARAM_INDEX":"0" }';
            } else {
                alert('invalid websocketMode');
                return;
            }
            websocket.send(message);
            logMessage(message);
        },

        // TOKEN_CMD_SIGNATURE_SIGN_DATA
        signature_sign_data() {
            let message;
            if (websocketMode == websocketModes.Default) {
                // default mode
                message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_SIGNATURE_SIGN_DATA" }';
            } else if (websocketMode == websocketModes.API) {
                // API mode
                message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_SIGNATURE_GET_SIGN_DATA" }';
            } else {
                alert('invalid websocketMode');
                return;
            }
            websocket.send(message);
            logMessage(message);
        },

        // TOKEN_CMD_SIGNATURE_IMAGE
        signature_image() {
            let message;

            if (websocketMode == websocketModes.Default) {
                // default mode
                message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_SIGNATURE_IMAGE' +
                    '", "TOKEN_PARAM_FILE_TYPE":"' + '1' + // PNG
                    '", "TOKEN_PARAM_PEN_WIDTH":"' + '5' +
                    '" }';
            } else if (websocketMode == websocketModes.API) {
                // API mode
                message = '{ "TOKEN_TYPE":"TOKEN_TYPE_REQUEST", "TOKEN_CMD":"TOKEN_CMD_API_SIGNATURE_SAVE_AS_STREAM_EX' +
                    '", "TOKEN_PARAM_RESOLUTION":"' + '300' +
                    '", "TOKEN_PARAM_WIDTH":"' + '0' +
                    '", "TOKEN_PARAM_HEIGHT":"' + '0' +
                    '", "TOKEN_PARAM_FILE_TYPE":"' + '1' + // PNG
                    '", "TOKEN_PARAM_PEN_WIDTH":"' + '5' +
                    '", "TOKEN_PARAM_PEN_COLOR":"' + document.getElementById('signaturePenColorSelect').value +
                    '", "TOKEN_PARAM_OPTIONS":"' + '0x1400' +
                    '" }';
            } else {
                alert('invalid websocketMode');
                return;
            }
            websocket.send(message);
            logMessage(message);
        },

        getBackgroundImage(url) {
            const img = new Image();
            img.setAttribute('crossOrigin', 'anonymous');
            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(this, 0, 0);

                const dataURL = canvas.toDataURL('image/png');

                backgroundImage = dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
            };
            img.src = url;
        },

        chek_boxes_selectedElements_onchange() {
            const sender = document.getElementById('chek_boxes_selectedElements');
            const selectedElem = sender.value;
            const elemCount = sender.childElementCount;

            for (i = 1; i <= elemCount; i++) {
                document.getElementById('fieldNumber' + i).style.visibility = 'hidden';
                document.getElementById('fieldID' + i).style.visibility = 'hidden';
                document.getElementById('fieldText' + i).style.visibility = 'hidden';
                document.getElementById('fieldChecked' + i).style.visibility = 'hidden';
                document.getElementById('fieldRequired' + i).style.visibility = 'hidden';
            }

            for (i = 1; i <= selectedElem; i++) {
                document.getElementById('fieldNumber' + i).style.visibility = 'visible';
                document.getElementById('fieldID' + i).style.visibility = 'visible';
                document.getElementById('fieldText' + i).style.visibility = 'visible';
                document.getElementById('fieldChecked' + i).style.visibility = 'visible';
                document.getElementById('fieldRequired' + i).style.visibility = 'visible';
            }
        },

        ModeListName_onchange() {
            const sender = document.getElementById('ModeList');
            const selectedElem = sender.value;

            // the signature pen color select
            const scl = document.getElementById('signatureColorLabel');
            const spcs = document.getElementById('signaturePenColorSelect');
            spcs.selectedIndex = 0;

            // the check boxes select
            const cbsEL = document.getElementById('chek_boxes_selectedElementsLable');
            const cbsE = document.getElementById('chek_boxes_selectedElements');
            const elemCount = cbsE.childElementCount;

            switch (selectedElem) {
            case MODE_LIST_DEFAULT:
                // disable the signature pen color select
                scl.disabled = true;
                spcs.disabled = true;

                // enable the check boxes select and table elements
                cbsEL.disabled = false;
                cbsE.disabled = false;
                for (i = 1; i <= elemCount; i++) {
                    document.getElementById('fieldNumber' + i).disabled = false;
                    document.getElementById('fieldID' + i).disabled = false;
                    document.getElementById('fieldText' + i).disabled = false;
                    document.getElementById('fieldChecked' + i).disabled = false;
                    document.getElementById('fieldRequired' + i).disabled = false;
                }
                break;

            case MODE_LIST_API:
                // enable the signature pen color select
                scl.disabled = false;
                spcs.disabled = false;

                // disable the check boxes select and table elements
                cbsEL.disabled = true;
                cbsE.disabled = true;
                for (i = 1; i <= elemCount; i++) {
                    document.getElementById('fieldNumber' + i).disabled = true;
                    document.getElementById('fieldID' + i).disabled = true;
                    document.getElementById('fieldText' + i).disabled = true;
                    document.getElementById('fieldChecked' + i).disabled = true;
                    document.getElementById('fieldRequired' + i).disabled = true;
                }
                break;

            default:
                alert('invalid websocketMode');
                break;
            }
        },
    },

    mounted() {
        const state = this.$refs.sigPadStatus;
        const sigcanvas = this.$refs.sigPadCanvas;

        if (window.WebSocket === undefined) {
            state.innerHTML = 'sockets not supported';
            state.className = 'fail';
        } else {
            if (typeof String.prototype.startsWith != 'function') {
                String.prototype.startsWith = function(str) {
                    return this.indexOf(str) == 0;
                };
            }

            this.onMainWindowLoad();
        }
    },
};
