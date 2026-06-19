/*
 * Define all the paths that will be accessed in the store
 */
import { dialysis } from "@dialysis/routes";
import { evaluation } from "@evaluation/routes";
import { users } from "@users/routes";
import { inventory } from "@inventory/routes";
import { finance } from "@finance/routes";
import { reception } from "@reception/routes";
// import { reports } from "@reports/routes";

let routeDefinitions = [];

[dialysis, evaluation, users, inventory, finance, reception]
    .forEach((route) => {
        routeDefinitions = routeDefinitions.concat(route);
    });

export const routes = routeDefinitions;
