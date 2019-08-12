import * as path from 'path';
import { FeatureCollection } from 'geojson';
import {
  TestBedAdapter,
  Logger,
  LogLevel,
  ProduceRequest,
  largeFileUploadCallback,
  DataType,
  ITiming,
  TimeState,
  TimeTopic,
} from 'node-test-bed-adapter';

const log = Logger.instance;

class SilentProducer {
  private id = 'tno';
  private adapter: TestBedAdapter;

  constructor() {
    this.adapter = new TestBedAdapter({
      kafkaHost: process.env.KAFKA_HOST || 'localhost:3501',
      schemaRegistry: process.env.SCHEMA_REGISTRY || 'localhost:3502',
      // largeFileService: 'localhost:9090',
      // sslOptions: {
      //   pfx: fs.readFileSync('../certs/other-tool-1-client.p12'),
      //   passphrase: 'changeit',
      //   ca: fs.readFileSync('../certs/test-ca.pem'),
      //   rejectUnauthorized: true,
      // },
      clientId: this.id,
      fetchAllSchemas: false,
      fetchAllVersions: false,
      autoRegisterSchemas: true,
      // autoRegisterSchemas: false,
      wrapUnions: 'auto',
      schemaFolder: `${process.cwd()}/src/schemas`,
      produce: process.env.PRODUCE_TOPICS ? process.env.PRODUCE_TOPICS.split(',') : ['standard_cap', 'standard_geojson', TimeTopic],
      logging: {
        logToConsole: LogLevel.Info,
        logToKafka: LogLevel.Warn,
      },
    });
    this.adapter.on('error', e => console.error(e));
    this.adapter.on('ready', () => {
      log.info(`Current simulation time: ${this.adapter.trialTime}`);
      log.info('Producer is connected');
    });
    this.adapter.connect();
  }
}

new SilentProducer();
