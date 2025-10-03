import { UserSetupData } from "../node_modules/edifice-k6-commons/dist/index.js";
import { group } from "k6";

export function actualites(user: UserSetupData) {
    group("[actualites]", () => {

    })
}