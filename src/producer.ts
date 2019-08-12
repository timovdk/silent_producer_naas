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
import * as amberAlert from './data/example_amber_alert.json';
import * as earthquakeAlert from './data/example_earthquake.json';
import * as thunderstormAlert from './data/example_thunderstorm.json';
import * as homelandSecurityAlert from './data/example_homeland_security.json';

const log = Logger.instance;

class Producer {
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
      produce: ['standard_cap', 'standard_geojson', 'system_request_change_of_trial_stage', TimeTopic],
      logging: {
        logToConsole: LogLevel.Info,
        logToKafka: LogLevel.Warn,
      },
    });
    this.adapter.on('error', e => console.error(e));
    this.adapter.on('ready', () => {
      log.info(`Current simulation time: ${this.adapter.trialTime}`);
      log.info('Producer is connected');
      this.sendStageChangeRequest();
      // this.sendCap();
      // this.sendGeoJSON();
      // this.sendTime();
      // this.uploadFile();
    });
    this.adapter.connect();
  }

  private sendStageChangeRequest() {
    const payloads: ProduceRequest[] = [
      {
        topic: 'system_request_change_of_trial_stage',
        messages: {
          // ostTrialId: 1,
          ostTrialSessionId: 1,
          ostTrialStageId: 1,
        },
        attributes: 1, // Gzip
      },
    ];
    this.adapter.send(payloads, (error, data) => {
      if (error) {
        log.error(error);
      }
      if (data) {
        log.info(data);
      }
    });
  }
  // private sendGeoJSON() {
  //   const geojson = geojsonToAvro((crowdTaskerMsg as unknown) as FeatureCollection);
  //   const payloads: ProduceRequest[] = [
  //     {
  //       topic: 'standard_geojson',
  //       messages: geojson,
  //       attributes: 1, // Gzip
  //     },
  //   ];
  //   this.adapter.send(payloads, (error, data) => {
  //     if (error) {
  //       log.error(error);
  //     }
  //     if (data) {
  //       log.info(data);
  //     }
  //   });
  // }

  // private uploadFile() {
  //   const file = path.resolve(process.cwd(), './dist/data/cap/examples/example_amber_alert.json');
  //   const cb = largeFileUploadCallback(this.adapter, 'Amber alert message', 'This is a test message', DataType.json);
  //   this.adapter.uploadFile(file, false, cb);
  // }

  // private sendTime() {
  //   const d = new Date().valueOf();
  //   const time = {
  //     updatedAt: d,
  //     timeElapsed: 0,
  //     trialTimeSpeed: 1,
  //     trialTime: d,
  //     state: TimeState.Initialized,
  //   } as ITiming;
  //   const pr = { messages: time, topic: TimeTopic, attributes: 1 } as ProduceRequest;
  //   this.adapter.send(pr, (err, data) => {
  //     if (err) {
  //       console.error(err);
  //     } else {
  //       console.info(data);
  //     }
  //   });
  // }

  /** Will only work if you are authorized to send CAP messages. */
  private sendCap() {
    const payloads: ProduceRequest[] = [
      {
        topic: 'standard_cap',
        messages: amberAlert,
        attributes: 1, // Gzip
      },
      {
        topic: 'standard_cap',
        messages: earthquakeAlert,
        attributes: 1, // Gzip
      },
      {
        topic: 'standard_cap',
        messages: thunderstormAlert,
        attributes: 1, // Gzip
      },
      {
        topic: 'standard_cap',
        messages: homelandSecurityAlert,
        attributes: 1, // Gzip
      },
    ];
    this.adapter.send(payloads, (error, data) => {
      if (error) {
        log.error(error);
      }
      if (data) {
        log.info(data);
      }
    });
  }
}

new Producer();
