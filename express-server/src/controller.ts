export {};

const dotenv = require("dotenv");
dotenv.config();

const { RDSClient} = require("@aws-sdk/client-rds-data");

const client = new RDSClient({
  region: "ap-southeast-2",
  credentials: {
    accessKey: dotenv.get("AWS_ACCESS_KEY"),
    secretAccessKey: dotenv.get("AWS_SECRET_KEY"),
  },
});
