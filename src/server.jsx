// server
import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import expressHealthcheck from 'express-healthcheck';
import debugLogger from 'debug-logger';
import frameguard from 'frameguard';
import React from 'react';
import { ReduxAsyncConnect, loadOnServer } from 'redux-connect';
import { renderToStaticMarkup } from 'react-dom/server';
import { Provider } from 'react-intl-redux';
import { match, createMemoryHistory, RouterContext } from 'react-router-dom';
import { syncHistoryWithStore } from 'react-router-redux';
import cookie, { plugToRequest } from 'react-cookie';
import { urlencoded } from 'body-parser';
import locale from 'locale';
import { keys } from 'lodash';
import Raven from 'raven';

import nlLocale from '../dist/locales/nl.json';
import deLocale from '../dist/locales/de.json';
import enLocale from '../dist/locales/en.json';

import { Html, Api, persistAuthToken, generateSitemap } from './helpers';
import ErrorPage from './error';
import getRoutes from './routes';
import configureStore from './store';
import config from './config';
import userSession from './reducers/userSession/userSession';
import languages from './constants/Languages';

const debug = debugLogger('plone-react:server');
const supported = new locale.Locales(keys(languages), 'en');
const locales = {
  en: enLocale,
  nl: nlLocale,
  de: deLocale,
};

export default parameters => {
  const app = express();
  const server = http.Server(app);
  const io = new SocketIO(server);
  const staticPath = __dirname;

  if (process.env.SENTRY_DSN) {
    Raven.config(process.env.SENTRY_DSN).install();
  }

  io.on('connection', () => {
    debug.info('user connected');
  });

  app.use(frameguard({ action: 'deny' }));
  app.use(urlencoded({ extended: false }));

  // Serve static files
  app.use(express.static(__dirname));
  app.use('/assets', express.static(__dirname));

  app.use('/healthcheck', expressHealthcheck());

  // React application rendering
  app.use((req, res) => {
    plugToRequest(req, res);
    const lang = new locale.Locales(
      cookie.load('lang') || req.headers['accept-language'],
    )
      .best(supported)
      .toString();
    const api = new Api(req);
    const authToken = cookie.load('auth_token');
    const initialState = {
      userSession: { ...userSession(), token: authToken },
      form: req.body,
      intl: {
        defaultLocale: 'en',
        locale: lang,
        messages: locales[lang],
      },
    };
    const memoryHistory = createMemoryHistory(req.path);
    const store = configureStore(initialState, memoryHistory, false, api);
    persistAuthToken(store);
    const history = syncHistoryWithStore(memoryHistory, store);

    match(
      {
        history,
        routes: getRoutes(store),
        location: req.originalUrl,
      },
      (err, redirectInfo, routeState) => {
        // eslint-disable-line complexity
        if (redirectInfo && redirectInfo.redirectInfo) {
          res.redirect(redirectInfo.path);
        } else if (err) {
          res.error(err.message);
        } else if (routeState) {
          // eslint-disable-line no-lonely-if
          if (__SSR__) {
            if (req.path === '/sitemap.xml.gz') {
              generateSitemap(req).then(sitemap => {
                res.header('Content-Type: application/x-gzip');
                res.header('Content-Encoding: gzip');
                res.header(
                  'Content-Disposition: attachment; filename="sitemap.xml.gz"',
                );
                res.send(sitemap);
              });
            } else {
              loadOnServer({ ...routeState, store })
                .then(() => {
                  const component = (
                    <Provider store={store}>
                      <ReduxAsyncConnect {...routeState} />
                    </Provider>
                  );
                  res.set({
                    'Cache-Control': 'public, max-age=600, no-transform',
                  });
                  res
                    .status(
                      store.getState().content.get.error &&
                      store.getState().content.get.error.type === 'NotFound'
                        ? 404
                        : 200,
                    )
                    .send(
                      `<!doctype html> ${renderToStaticMarkup(
                        <Html
                          assets={parameters.chunks()}
                          component={component}
                          store={store}
                          staticPath={staticPath}
                        />,
                      )}`,
                    );
                })
                .catch(error => {
                  const errorPage = <ErrorPage message={error.message} />;

                  if (process.env.SENTRY_DSN) {
                    Raven.captureException(error.message, {
                      extra: JSON.stringify(error),
                    });
                  }
                  res.set({
                    'Cache-Control': 'public, max-age=60, no-transform',
                  });
                  res
                    .status(500)
                    .send(`<!doctype html> ${renderToStaticMarkup(errorPage)}`);
                });
            }
          } else {
            const component = (
              <Provider store={store}>
                <RouterContext {...routeState} />
              </Provider>
            ); // eslint-disable-line max-len
            res.set({ 'Cache-Control': 'public, max-age=60, no-transform' });
            res
              .status(200)
              .send(
                `<!doctype html> ${renderToStaticMarkup(
                  <Html
                    assets={parameters.chunks()}
                    component={component}
                    store={store}
                    staticPath={staticPath}
                  />,
                )}`,
              );
          }
        } else {
          res.set({ 'Cache-Control': 'public, max-age=3600, no-transform' });
          res.sendStatus(404);
        }
      },
    );
  });

  // Start the HTTP server
  app.listen(config.port, err => {
    if (err) {
      debug.error(err);
    } else {
      debug.info(
        '==> 🚧  Webpack development server listening on port %s',
        config.port,
      );
    }
  });
};
