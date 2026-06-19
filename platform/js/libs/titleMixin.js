/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 22/09/2019
 * Time: 18:25
 */

function getTitle(vm) {
    const { title } = vm.$options;
    if (title) {
        return typeof title === 'function' ?
            `${title.call(vm)} | ${window.siteName}` :
            `${title} | ${window.siteName}`;
    }
}

export default {
    created() {
        const title = getTitle(this);
        if (title) {
            document.title = title;
        }
    },
};
