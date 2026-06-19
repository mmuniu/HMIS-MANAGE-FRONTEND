<template>
    <div>
        <!-- Navigation bar -->
        <nav id="main-nav" class="navbar navbar-default navbar-fixed-top">
            <div class="container-fluid">
                <!-- Shapes -->
                <ul id="shape-list" class="nav navbar-nav">
                    <li data-shape="rectangle">
                        <a>
                            <i class="far fa-square"></i>
                        </a>
                    </li>
                    <li data-shape="oval">
                        <a>
                            <i class="far fa-compass"></i>
                        </a>
                    </li>
                    <li data-shape="circle">
                        <a>
                            <i class="far fa-circle"></i>
                        </a>
                    </li>
                    <li data-shape="line">
                        <a>
                            <span class="glyphicon glyphicon-minus"></span>
                        </a>
                    </li>
                    <li class="active" data-shape="lineList">
                        <a>
                            <span class="glyphicon glyphicon-pencil"></span>
                        </a>
                    </li>
                    <li data-shape="text">
                        <a>
                            <span class="glyphicon glyphicon-text-width"></span>
                        </a>
                    </li>
                    <li data-shape="move">
                        <a>
                            <span class="glyphicon glyphicon-move"></span>
                        </a>
                    </li>
                </ul>
                <!-- Settings -->
                <ul id="settings-list" class="nav navbar-nav">
                    <li>
                        <a>
                            <input id="color-selector" type="color">
                        </a>
                    </li>
                    <li>
                        <a data-toggle="modal" data-target="#size-modal">
                            <i class="fas fa-ruler-combined"></i>
                        </a>
                    </li>
                    <li>
                        <a id="fill-toggle" data-filled="no">
                            <i class="far fa-star"></i>
                        </a>
                    </li>
                </ul>
                <!-- IO -->
                <ul id="io-list" class="nav navbar-nav">
                    <li>
                        <a id="img-save">
                            <span class="glyphicon glyphicon-download"></span>
                        </a>
                    </li>
                    <li>
                        <a id="img-load">
                            <span class="glyphicon glyphicon-upload"></span>
                        </a>
                    </li>
                    <li>
                        <a id="img-clear">
                            <i class="fas fa-file"></i>
                        </a>
                    </li>
                </ul>
                <!-- Undo + Redo -->
                <ul id="time-travel" class="nav navbar-nav">
                    <li>
                        <a id="btn-undo">
                            <i class="fas fa-undo"></i>
                        </a>
                    </li>
                    <li>
                        <a id="btn-redo">
                            <i class="fas fa-redo"></i>
                        </a>
                    </li>
                </ul>
            </div>
        </nav>


        <!-- Canvas -->
        <div style="height: 300px; width: 100%;">
            <canvas id="canvas" style="width: 100%; height: 100%">
                Your browser does not support canvas :(
            </canvas>
        </div>


        <!-- Hidden modal for size adjustments -->
        <div id="size-modal" class="modal fade" role="dialog">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close abort" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">Modify sizes</h4>
                    </div>
                    <div class="modal-body">
                        <table class="table" id="size-table">
                            <tbody>
                            <tr id="font-row" data-value="12pt">
                                <td>Font size</td>
                                <td>
                                    <a class="decrease">
                                        <i class="fas fa-minus"></i>
                                    </a>
                                </td>
                                <td class="value-data">12pt</td>
                                <td>
                                    <a class="increase">
                                        <i class="fas fa-plus"></i>
                                    </a>
                                </td>
                            </tr>
                            <tr id="width-row" data-value="1">
                                <td>Line width</td>
                                <td>
                                    <a class="decrease">
                                        <i class="fas fa-minus"></i>
                                    </a>
                                </td>
                                <td class="value-data">1</td>
                                <td>
                                    <a class="increase">
                                        <i class="fas fa-plus"></i>
                                    </a>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default abort" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-default confirm" data-dismiss="modal">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data () {
        return {
            drawer: {
                // A list of shapes on the canvas
                shapes: [],
                // If any shapes are undone they are kept here temporarily
                undoneShapes: [],
                // The shape currently selected
                selectedShape: 'lineList',
                // Canvas DOM element
                canvas: null,
                // The context of the canvas
                ctx: null,
                // The element currently being drawn
                selectedElement: null,
                // The shapes we can choose from
                availableShapes: {
                    RECTANGLE: 'rectangle',
                    OVAL: 'oval',
                    CIRCLE: 'circle',
                    LINE: 'line',
                    LINE_LIST: 'lineList',
                    DrawnText: 'text',
                    MOVE: 'move' // TODO
                },
                // Settings for selectedElement
                settings: {
                    color: '#000000',
                    filled: false,
                    width: 1,
                    font: '12pt sans-serif'
                },
                /**
                 * Deep copy of settings.
                 *
                 * @returns {{color: string, filled: boolean, width: number, font: string}}
                 */
                currentSettings() {
                    return {
                        color: drawer.settings.color.slice(0, drawer.settings.color.length),
                        filled: drawer.settings.filled,
                        width: drawer.settings.width,
                        font: drawer.settings.font.slice(0, drawer.settings.font.length)
                    };
                },
                /**
                 * Draw all stored shapes.
                 */
                drawAllStoredShapes() {
                    for (let i = 0; i < drawer.shapes.length; i++) {
                        if (drawer.shapes[i]) {
                            drawer.shapes[i].render(drawer.ctx);
                        }
                    }
                },
                /**
                 * Draw the selected shape in its current state.
                 */
                drawSelected() {
                    if (drawer.selectedElement) {
                        drawer.selectedElement.render(drawer.ctx);
                    }
                },
                /**
                 * Redraws all elements to the canvas.
                 */
                redraw() {
                    // Wipe everything off the canvas
                    drawer.ctx.clearRect(0, 0, drawer.ctx.canvas.width, drawer.ctx.canvas.height);
                    drawer.drawAllStoredShapes();
                    drawer.drawSelected();
                },
                /**
                 * Add the last undone shape back to the list of shapes.
                 */
                redo() {
                    if (drawer.undoneShapes.length > 0) {
                        drawer.shapes.push(drawer.undoneShapes.pop());
                        drawer.redraw();
                    }
                },
                /**
                 * Remove the last shape drawn and place in temporary redo storage.
                 */
                undo() {
                    if (drawer.shapes.length > 0) {
                        drawer.undoneShapes.push(drawer.shapes.pop());
                        drawer.redraw();
                    }
                }
            },
            filled:  document.getElementById('fill-toggle'),
            colorPicker: document.getElementById('color-selector'),
            widthSetting:  document.getElementById('width-row'),
            widthDecrease:  this.widthSetting.querySelectorAll('td > a.decrease')[0],
            widthIncrease:  this.widthSetting.querySelectorAll('td > a.increase')[0],
            widthValue:  this.widthSetting.querySelectorAll('td.value-data')[0],
            fontSetting:  document.getElementById('font-row'),
            fontDecrease:  this.fontSetting.querySelectorAll('td > a.decrease')[0],
            fontIncrease:  this.fontSetting.querySelectorAll('td > a.increase')[0],
            fontValue:  this.fontSetting.querySelectorAll('td.value-data')[0],
            sizeModal: document.getElementById('size-modal'),
            sizeAbort: this.sizeModal.querySelectorAll('button.abort'),
        }
    },

    methods: {
        /**
         * If we are drawing a text and we press Enter, then
         * we store the text and stop drawing it. Otherwise the
         * key pressed is added to it.
         *
         * @param key A key that was pressed
         */
        textKeyPress(key) {
            if (key === 'Enter') {
                drawer.shapes.push(drawer.selectedElement);
                drawer.selectedElement = null;
                drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
            } else {
                drawer.selectedElement.resize(key);
                drawer.redraw();
            }
        },

        /**
         * Creates a json object and from it a file blob. The json object
         * additionally adds types of the shapes it holds since json does
         * not store functions.
         *
         * @returns {Blob} A file blob with all the shapes in a json format.
         */
        createJsonBlob() {
            let lst = [];
            for (let i = 0; i < drawer.shapes.length; i++) {
                let tmp = JSON.parse(JSON.stringify(drawer.shapes[i]));
                tmp['type'] = drawer.shapes[i].__proto__.constructor.name;
                lst.push(tmp);
            }
            return new Blob([JSON.stringify(lst)], {type: 'application/json'});
        },

        /**
         * Create a temporary anchor to download a blob, click it
         * and then remove it.
         */
        saveAsJsonFile() {
            let tmp = window.document.createElement('a');
            tmp.href = window.URL.createObjectURL(createJsonBlob());
            tmp.download = 'image.json';
            document.body.appendChild(tmp);
            tmp.click();
            document.body.removeChild(tmp);
        },

        /**
         * Convert a json object to its corresponding shape
         * and add it to the list of shapes to draw.
         *
         * @param jsonShape Json equivalent of a shape
         */
        createShapeFromJson(jsonShape) {
            switch (jsonShape.type) {
            case 'Rectangle':
                drawer.shapes.push(new Rectangle(
                    jsonShape.position,
                    jsonShape.settings,
                    jsonShape.width,
                    jsonShape.height
                ));
                break;
            case 'Oval':
                drawer.shapes.push(new Oval(
                    jsonShape.position,
                    jsonShape.settings,
                    jsonShape.xRadius,
                    jsonShape.yRadius
                ));
                break;
            case 'Circle':
                drawer.shapes.push(new Circle(
                    jsonShape.position,
                    jsonShape.settings,
                    jsonShape.xRadius
                ));
                break;
            case 'Line':
                drawer.shapes.push(new Line(
                    jsonShape.position,
                    jsonShape.settings,
                    jsonShape.endPosition
                ));
                break;
            case 'LineList':
                let ll = new LineList(jsonShape.position, jsonShape.settings);
                for (let j = 0; j < jsonShape.xList.length; j++) {
                    ll.resize(jsonShape.xList[j], jsonShape.yList[j]);
                }
                drawer.shapes.push(ll);
                break;
            case 'DrawnText':
                let dt = new DrawnText(jsonShape.position, jsonShape.settings);
                for (let j = 0; j < jsonShape.chars.length; j++) {
                    dt.resize(jsonShape.chars[j]);
                }
                drawer.shapes.push(dt);
                break;
            }
        },

        /**
         * Parses the json object, which should be an
         * array of shape objects. Also restarts the
         * canvas and redraws it.
         *
         * @param e On file loaded event
         */
        constructShapesFromFile({target}) {
            let contents = target.result;
            let tmpList = JSON.parse(contents);
            drawer.selectedElement = null;
            drawer.shapes.splice(0, drawer.shapes.length);
            drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
            for (let i = 0; i < tmpList.length; i++) {
                createShapeFromJson(tmpList[i]);
            }
            drawer.redraw();
        },

        /**
         * Uses the first file (if multiples), reads
         * it and adds a callback for the event of
         * being done reading it.
         *
         * @param evt The event of uploading a file.
         */
        uploadFile({target}) {
            let file = target.files[0];
            if (!file) {
                return;
            }
            let reader = new FileReader();
            reader.addEventListener('load', constructShapesFromFile);
            reader.readAsText(file);
        },

        /**
         * Create temporary file input node, click it
         * and handle the event for uploading one.
         * Then it will be removed.
         */
        createTemporaryFileLoader() {
            let inp = window.document.createElement('input');
            inp.type = 'file';
            document.body.appendChild(inp);
            inp.style.visibility = "hidden";
            inp.addEventListener('change', uploadFile, false);
            inp.click();
            document.body.removeChild(inp);
        }
    },

    mounted () {

        this.drawer.canvas = document.getElementById('canvas');
        this.drawer.ctx = document.getElementById('canvas').getContext('2d');

        this.drawer.canvas.addEventListener('mousedown',
            /**
             * Starts drawing the chosen shape.
             *
             * @param mouseEvent The event that trigger this callback
             */
            ({offsetX, offsetY}) => {
                let pos = {x: offsetX, y: offsetY};
                switch (drawer.selectedShape) {
                case drawer.availableShapes.RECTANGLE:
                    drawer.selectedElement = new Rectangle(pos, drawer.currentSettings(), 0, 0);
                    break;
                case drawer.availableShapes.OVAL:
                    drawer.selectedElement = new Oval(pos, drawer.currentSettings(), 0, 0);
                    break;
                case drawer.availableShapes.CIRCLE:
                    drawer.selectedElement = new Circle(pos, drawer.currentSettings(), 0);
                    break;
                case drawer.availableShapes.LINE:
                    drawer.selectedElement = new Line(pos, drawer.currentSettings(), pos);
                    break;
                case drawer.availableShapes.LINE_LIST:
                    drawer.selectedElement = new LineList(pos, drawer.currentSettings());
                    break;
                case drawer.availableShapes.DrawnText:
                    // If we are already drawing text, store that one
                    if (drawer.selectedElement) {
                        drawer.shapes.push(drawer.selectedElement);
                        drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
                    }
                    drawer.selectedElement = new DrawnText(pos, drawer.currentSettings());
                    break;
                case drawer.availableShapes.MOVE:
                    // TODO
                    break;
                }
            }
        );

        this.drawer.canvas.addEventListener('mousemove',
            /**
             * If any shape other than text is being drawn, we resize it.
             *
             * @param mouseEvent The event that trigger this callback
             */
            ({offsetX, offsetY}) => {
                if (drawer.selectedElement && drawer.selectedShape !== drawer.availableShapes.DrawnText) {
                    drawer.selectedElement.resize(offsetX, offsetY);
                    drawer.redraw();
                }
            }
        );

        document.addEventListener('mouseup',
            /**
             * If any element is being drawn and it's not text, then
             * we store it when the mouse is released.
             *
             * @param mouseEvent  The event that trigger this callback
             */
            mouseEvent => {
                if (drawer.selectedElement && drawer.selectedShape !== drawer.availableShapes.DrawnText) {
                    drawer.shapes.push(drawer.selectedElement);
                    drawer.selectedElement = null;
                    drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
                }
            }
        );

        document.addEventListener('keypress',
            /**
             * If a key is pressed, we first check to see if a text
             * is being drawn and if so, handle that accordingly. If
             * not, we check for undo and redo combos.
             *
             * @param evt The event that triggered this callback
             */
            ({key, ctrlKey, shiftKey}) => {
                if (drawer.selectedShape === drawer.availableShapes.DrawnText && drawer.selectedElement) {
                    textKeyPress(key);
                } else if (key.toUpperCase() === 'Z' && ctrlKey) {
                    if (shiftKey) {
                        drawer.redo();
                    } else {
                        drawer.undo();
                    }
                }
            }
        );
        // endregion

        // region OnClick events

        // region Undo and Redo
        // Undo and redo can also be done from the navigation bar by clicking icons
        document.getElementById('btn-undo').addEventListener('click', drawer.undo);
        document.getElementById('btn-redo').addEventListener('click', drawer.redo);
        // endregion

        // region Select element
        // Add click events to the shape part of our navigation bar
        document.querySelectorAll('#shape-list li').forEach(
            /**
             * Foreach function that is applied to all elements from the query selector.
             *
             * @param elem The current element of the query selector
             */
            elem => {
                elem.addEventListener('click',
                    /**
                     * If the shape is changed, we begin by checking to see
                     * if the previous one was a text and if so, store it as is.
                     * Then we change the selected shape and toggle the DOM element
                     * class list for the class active, for both the previously selected
                     * DOM and the new one.
                     *
                     * @param evt The event that triggered this callback
                     */
                    evt => {
                        let clickedShape = elem.dataset.shape;
                        if (clickedShape !== drawer.selectedShape) {
                            if (drawer.selectedElement && drawer.selectedShape === drawer.availableShapes.DrawnText) {
                                drawer.shapes.push(drawer.selectedElement);
                                drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
                            }
                            drawer.selectedElement = null;
                            drawer.selectedShape = clickedShape;

                            document.querySelectorAll('#shape-list li.active')[0].classList.toggle('active');
                            elem.classList.toggle('active');
                        }
                    }
                );
            }
        );

        this.filled.addEventListener('click',
            /**
             * A boolean value for filled is toggled by clicking
             * the star and the glyph is toggled as well, between
             * a filled star and a hollow one.
             *
             * @param evt The event that triggered this callback.
             */
            evt => {
                this.filled.firstElementChild.classList.toggle('far');
                this.filled.firstElementChild.classList.toggle('fas');
                if (this.filled.dataset['filled'] === 'no') {
                    this.filled.dataset['filled'] = 'yes';
                    this.drawer.settings.filled = true;
                } else {
                    this.filled.dataset['filled'] = 'no';
                    this.drawer.settings.filled = false;
                }
            }
        );

        this.colorPicker.value = '#000000';
        this.colorPicker.addEventListener('change',
            /**
             * Set the color settings to the chosen color.
             *
             * @param evt The event that triggered this callback
             */
            evt => {
                this.drawer.settings.color = this.colorPicker.value;
            }
        );

        this.widthDecrease.addEventListener('click',
            /**
             * Decrease the value of the text node down to a minimum of 1.
             *
             * @param evt The event that triggered this callback
             */
            evt => {
                this.widthValue.innerHTML = Math.max(1, parseInt(this.widthValue.innerHTML) - 1);
            }
        );
        this.widthIncrease.addEventListener('click',
            /**
             * Increase the value of the text node up to a maximum of 50.
             *
             * @param evt The event that triggered this callback
             */
            evt => {
                this.widthValue.innerHTML = Math.min(50, parseInt(this.widthValue.innerHTML) + 1);
            }
        );

        this.fontDecrease.addEventListener('click',
            /**
             * Decrease the value of the text node down to a minimum of 6.
             *
             * @param evt The event that triggered this callback
             */
            evt => {
                this.fontValue.innerHTML = ((s) => `${Math.max(6, parseInt(s.slice(0, s.length - 2)) - 1)}pt`)(this.fontValue.innerHTML);
            }
        );
        this.fontIncrease.addEventListener('click',
            /**
             * Increase the value of the text node up to a maximum of 42.
             *
             * @param evt The event that triggered this callback
             */
            evt => {
                this.fontValue.innerHTML = ((s) => `${Math.min(42, parseInt(s.slice(0, s.length - 2)) + 1)}pt`)(this.fontValue.innerHTML);
            }
        );

        for (let i = 0; i < this.sizeAbort.length; i++) {
            this.sizeAbort[i].addEventListener('click',
                /**
                 * Change the text nodes back to the value they had
                 * when the modal was opened (the actual value is
                 * stored in a data set within the node).
                 *
                 * @param evt The event that triggered this callback
                 */
                evt => {
                    this.widthValue.innerHTML = this.widthSetting.dataset['value'];
                    this.fontValue.innerHTML = this.fontSetting.dataset['value'];
                }
            );
        }

        this.sizeModal.querySelectorAll('button.confirm')[0].addEventListener('click',
            /**
             * Update both the data set containing the actual value
             * and the settings object in our drawer.
             *
             * @param evt The event that triggered this callback
             */
            evt => {
                this.widthSetting.dataset['value'] = this.widthValue.innerHTML;
                this.drawer.settings.width = parseInt(this.widthValue.innerHTML);
                this.fontSetting.dataset['value'] = this.fontValue.innerHTML;
                this.drawer.settings.font =  `${this.fontValue.innerHTML} ${drawer.settings.font.split(' ')[1]}`;
            }
        );

        document.getElementById('img-save').addEventListener('click', this.saveAsJsonFile);
        document.getElementById('img-load').addEventListener('click', this.createTemporaryFileLoader);

        document.getElementById('img-clear').addEventListener('click',
            /**
             * Restart the drawing.
             *
             * @param evt The event that triggered this callback
             */
            evt => {
                drawer.selectedElement = null;
                drawer.shapes.splice(0, drawer.shapes.length);
                drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
                drawer.redraw();
            }
        );
    }
}
</script>
<style scoped>
/* Center the canvas */
#canvas {
    background-color: white;
    padding: 0;
    margin: auto;
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}

/* Center the navigation bar */
#main-nav {
    position: absolute;
    left: 0;
    height: 40px;
    width: 100%;
    display: flex;
    justify-content: center;
}
</style>
