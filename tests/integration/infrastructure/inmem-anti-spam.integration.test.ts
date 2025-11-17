import {ValkeyContainer} from "@testcontainers/valkey";
import {GlideClient} from "@valkey/valkey-glide";
import {ValkeyBannedEmailRepository} from "../../../src/infrastructure/repositories/valkey-banned-email.repository";
import {RepositoryAntiSpamAdapter} from "../../../src/infrastructure/external-services/repository-anti-spam.adapter";
import Any = jasmine.Any;

/**
 * Unit Tests: ValkeyAntiSpamAdapter with InMemory Repository
 *
 * These tests verify the adapter logic in isolation using a mocked repository (in mem).
 * They are fast, deterministic, and don't require external services.
 *
 * This demonstrates:
 * - Unit testing with test doubles (mocks/ in memory)
 * - Dependency injection for testability
 * - Separation of concerns
 */

describe('RepositoryAntiSpamAdapter Integration Tests with InMemory Repository', () => {

    let repository: Any;  // complétez celle ligne, ne laissez pas Any 🤓
    let adapter: RepositoryAntiSpamAdapter;

    beforeAll(async () => {
      //@ts-ignore
        // instanciate in-Mem repository and adapter
        repository = null; // new // complétez celle ligne
        //@ts-ignore
        adapter = new RepositoryAntiSpamAdapter(repository);

        // évidement, vous allez supprimer toutes les lignes @ts-ignore !!!! 🤓
    });

    // et ajoutez les tests qui vont bien ici1


    //ou bien, si vous êtez malin, trouvez un moyen de ne pas copier coller les même tests
    // mais faire en sorte qu'ils soient rappelés, soit par héritage
    // soit par composition de fonctions, ou bien par tableaux de fonctions  (JE VOUS AIDE là !!!)

});
