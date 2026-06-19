/*
 * Define all the paths that will be accessed in the store
 */
import { users } from "@users/paths";
import { theatre } from "@theatre/paths";
import { settings } from "@settings/paths";
import { dialysis } from "@dialysis/paths";
import { inventory } from "@inventory/paths";
import { reception } from "@reception/paths";
import { evaluation } from "@evaluation/paths";
import { inpatient } from "@inpatient/paths";
import { finance } from "@finance/paths";
import { hr } from "@hr/paths";
import { core } from "@core/paths";
import { reports } from "@reports/paths";
import { sync } from "@sync/paths";

const pathDefinitions = [];

[core, dialysis, evaluation, finance, hr, inpatient, inventory, reception, reports, settings, theatre, users, sync]

    .forEach( (mod) => {
        const paths = mod.paths;

        /*
         * Add the module name to the url
         */
        paths.forEach( (path) => {
            path.url = path.url == mod.prefix ? mod.prefix : mod.prefix + "/" + path.url;

            pathDefinitions.push(path);
        });
    });

export const paths = pathDefinitions;
