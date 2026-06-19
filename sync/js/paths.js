/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-07-07
 * Time: 20:57
 */

export const sync = {
    prefix: "sync",

    paths: [
        { url: "syncFacilities", pagination: false },
        { url: "syncNotifications", pagination: true },
        { url: "syncUpdates", pagination: true },
    ],
};

