import proc from 'process';
import prettyConfig from 'pretty-config';
import Asia from './lib/publicApi';

const app = new Asia();
const api = Object.assign(app.addTest, { test: app.addTest }, app);

if (!proc.env.ASIA_CLI) {
  prettyConfig('asia').then((config) => {
    /* eslint-disable-next-line no-shadow */
    app.use((app) => {
      /* eslint-disable-next-line no-param-reassign */
      Object.assign(app.options, config);
      return app;
    });

    /* eslint-disable-next-line unicorn/no-process-exit */
    app.runAll().then(() => process.exit(0), () => process.exit(1));
  });
}

export default api;
