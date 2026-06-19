/*
 * Applies headers on ajax calls to facilitate authorization of actions in the backend
 */
import { immigrantKey } from '@app/libs/Util';

export const visa = () => {
    const tokenData = JSON.parse(window.localStorage.getItem(immigrantKey));

    if (tokenData) {
        const headers = {
            Accept: 'application/json',
            Authorization: `Bearer ${tokenData.access_token}`,
        };

        return { headers };
    }

    return { };
};

export const logout = () => {
    window.localStorage.removeItem(immigrantKey);
    // also remove permissions key if set in storage?
    window.localStorage.removeItem(permissionsKey);
};
