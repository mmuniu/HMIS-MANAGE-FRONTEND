import Vue from 'vue';

const numeral = require('numeral');
const pluralize = require('pluralize');

Vue.filter('numberFormat', (value) =>
    // becomes 1,000.00 | displaying other groupings/separators is possible, look at the docs http://numeraljs.com/
    numeral(value).format('0,0.00'));

Vue.filter('numberFormatInt', (value) =>
    // becomes 1,000 | displaying other groupings/separators is possible, look at the docs http://numeraljs.com/
    numeral(value).format('0,0'));

Vue.filter('capitalize', (value) => {
    if (!value) return '';
    return `${value.substr(0, 1).toUpperCase()}${value.slice(1)}`;
});

Vue.filter('ucwords', (value) => {
    if (!value) return '';
    return `${value.substr(0, 1).toUpperCase()}${value.slice(1)}`;
});

Vue.filter('strtolower', (value) => {
    if (!value) return '';
    return value.toLowerCase();
});

Vue.filter('strtoupper', (value) => {
    if (!value) return '';
    return value.toUpperCase();
});

Vue.filter('plural', (value) => {
    if (!value) return '';
    return pluralize.plural(value);
});

Vue.filter('singular', (value) => {
    if (!value) return '';
    return pluralize.singular(value);
});

Vue.filter('pluralize', (value, counter) => {
    if (!value) return '';

    if (counter < 2 && counter > 0) {
        return pluralize.singular(value);
    }

    return pluralize.plural(value);
});

Vue.filter('camelCaseToSentenceCase', (value) => {
    value = value.replace(/([A-Z])/g, ' $1');
    return value.charAt(0).toUpperCase() + value.slice(1); // capitalize the first letter - as an example.
});

Vue.filter('snakeCaseToSentenceCase', (value) => {
    value = value.replace('_', ' ');
    value = value.replace(/([A-Z])/g, ' $1');
    return value.charAt(0).toUpperCase() + value.slice(1); // capitalize the first letter - as an example.
});

/**
 * convert snake case to sentence case, capitalizing all words
 * eg 'your_string' => 'Your String'
 */
Vue.filter('snakeCaseToSentenceCaseCapitalizeWords', (value) => {
    value = value.replace('_', ' ');
    return value.replace(/\b\w/g, (l) => l.toUpperCase());
});

/**
 * convert snake case to sentence case, capitalizing all words
 * eg 'yourString' => 'Your String'
 */
Vue.filter('camelCaseToSentenceCaseCapitalizeWords', (value) => {
    value = value.replace(/([A-Z])/g, ' $1');
    return value.replace(/\b\w/g, (l) => l.toUpperCase());
});
