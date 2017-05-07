const config = {
  rawDataDir: "./BackendTest/RawDataDir",
  dataDir: "./BackendTest/Storage",
  processDelay: 3,
  database: {
    type: "mysql",
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "anime_loop"
  }
};

module.exports = config;
