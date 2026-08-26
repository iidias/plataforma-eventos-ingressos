import { defineConfig } from 'vitest/config';

// Os testes falam com o banco de verdade, e o Neon leva até 30s para acordar
// quando está ocioso. Sem isso o primeiro teste falha por tempo, não por bug.
export default defineConfig({
  test: {
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
