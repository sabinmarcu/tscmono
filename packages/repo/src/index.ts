import { loadConfig, JSONSchema } from '@tscmono/config';
import repoSchema from '@tscmono/config/schemas/repo.json';

(async () => {
  console.log(
    await loadConfig(
      repoSchema as JSONSchema,
      __dirname,
      'tscmono',
    ),
  );
})();
