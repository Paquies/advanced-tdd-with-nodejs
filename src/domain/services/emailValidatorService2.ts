import {Email} from "@domain/value-objects";

//et maintenant?
// on fait comment pour faire appliquer ce validateur en changeant le moins de choses possibles dans le code ?
// et surtout, comment on fait pour faire appliquer ce validateur dans les  tests ?
// tout en gardant les tests avec l'ancien validateur ?

export class emailValidatorServiceAllowsNamesA_K {
    private allowedInitials: Set<string>;
    constructor() {
        this.allowedInitials = new Set(
            Array.from('ABCDEFGHIJK')
        );
    }

    isValid(email: Email) {
        const firstLetter = email.getUserPart().toUpperCase();
        return this.allowedInitials.has(firstLetter);
    }
}