import { Logger, LogLevel, TestBedAdapter } from 'node-test-bed-adapter';

const log = Logger.instance;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const silentProducer = () => {
  const id = 'tno-bootstrapper';

  const initialize = async () => {
    const waitFor = process.env.SLEEP || 10000;
    console.log(`Waiting for ${+waitFor / 1000}s before uploading schemas.`);
    await sleep(+waitFor);

    const adapter = new TestBedAdapter({
      kafkaHost: process.env.KAFKA_HOST || 'localhost:3501',
      schemaRegistry: process.env.SCHEMA_REGISTRY || 'localhost:3502',
      // sslOptions: {
      //   pfx: fs.readFileSync('../certs/other-tool-1-client.p12'),
      //   passphrase: 'changeit',
      //   ca: fs.readFileSync('../certs/test-ca.pem'),
      //   rejectUnauthorized: true,
      // },
      clientId: id,
      fetchAllSchemas: false,
      fetchAllVersions: false,
      autoRegisterSchemas: true,
      autoRegisterDefaultSchemas: false,
      wrapUnions: 'auto',
      schemaFolder: process.env.SCHEMA_FOLDER || `${process.cwd()}/src/schemas`,
      logging: {
        logToConsole: LogLevel.Info,
        logToKafka: LogLevel.Warn,
      },
    });

    adapter.on('error', (e) => console.error(e));
    adapter.on('ready', async () => {
      const createdTopics = await adapter.createTopics(adapter.uploadedSchemas);
      log.info(
        `Created the following topics:\n${createdTopics
          .sort()
          .map((t) => `- ${t}`)
          .join('\n')}\n`
      );
      log.info(`Exiting ${id}.`);
      process.exit(0);
    });
    adapter.connect();
  };

  initialize();
};

silentProducer();
