const path = require('path');

const config = {
  app: {
    url: 'http://127.0.0.1:7777',
    cdn: 'http://cdn.animeloop.org',
    host: '127.0.0.1',
    port: 7777,
  },
  web: {
    seriesPerPage: 18,
  },
  googleAnalytics: '',
  animeloopCli: {
    bin: path.join(__dirname, 'bin', 'animeloop-cli'),
  },
  api: {
    version: 'v1',
    app: {
      host: '0.0.0.0',
      port: 7771,
    },
  },
  apiv2: {
    app: {
      host: '0.0.0.0',
      port: 7775,
    },
    session: {
      name: 'animeloop.auth.sid',
      secret: '',
      redisStore: {
        host: '127.0.0.1',
        port: '6379',
        db: 10,
      }
    },
  },
  recaptcha: {
    url: 'https://www.google.com/recaptcha/api/siteverify',
    secret: '',
  },
  auth: {
    secret: '',
  },
  mailgun: {
    apikey: '',
  },
  automator: {
    uploadTTL: 5 * 60,
    uploadDelay: 3,
    animeloopCliDelay: 30,
    app: {
      url: '/automator',
      host: '127.0.0.1',
      port: 7778,
      auth: {
        username: 'admin',
        password: 'pass',
      },
    },
    redisN: 0,
    whatanime: {
      url: 'https://whatanime.ga/api/search',
      token: '',
    },
    anilist: {
      id: 'animeloop-123456',
      secret: 'animeloop-654321',
    },
  },
  storage: {
    dir: {
      data: path.join(__dirname, 'storage', 'data'),
      upload: path.join(__dirname, 'storage', 'upload'),
      raw: path.join(__dirname, 'storage', 'raw'),
      autogen: path.join(__dirname, 'storage', 'autogen'),
    },
  },
  mongodb: {
    url: 'mongodb://localhost/animeloop',
  },
  redis: {
    host: '127.0.0.1',
    port: 6379,
    auth: '',
  },
  bot: {
    twitter: {
      consumer_key: '...',
      consumer_secret: '...',
      access_token: '...',
      access_token_secret: '...',
      timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
    },
  },
  netdata: {
    url: 'http://127.0.0.1:19999',
  },
};

module.exports = config;
