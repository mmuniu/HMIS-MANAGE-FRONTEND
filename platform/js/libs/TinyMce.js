/**
 * Created by PhpStorm.
 * User: Lexx YungCarter
 * Date: 07/11/2018
 * Time: 12:13
 * Project: platform
 */

import 'tinymce/tinymce.min';

import Vue from 'vue';
import TinyMCE from '../components/TinyMce';

// A theme is required
import 'tinymce/themes/modern/theme';

// Any plugins you want to use have to be imported
import 'tinymce/plugins/print';
import 'tinymce/plugins/textcolor';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/fullscreen';

// any skins
// require("tinymce/skins/lightgray/skin.min.css");

// call it via custom component
Vue.component('tiny-mce', TinyMCE);
