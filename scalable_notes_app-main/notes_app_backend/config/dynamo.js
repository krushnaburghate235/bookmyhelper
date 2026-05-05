import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const region = "ap-south-1";
const dynamoClient = new DynamoDBClient({ region });

export default dynamoClient;
