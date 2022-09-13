import { APIGatewayProxyHandler } from "aws-lambda";

import { document } from "../utils/dynamoDBClient";

export const handle: APIGatewayProxyHandler = async (event) => {
  const { userid } = event.pathParameters;
  
  const { Items: toDos } = await document.query({
    TableName: 'users_todo',
    ExpressionAttributeValues: {
      ':user_id': userid,
    },
    KeyConditionExpression: 'user_id = :user_id',
  }).promise();

  if (toDos.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'User does not have any scheduled tasks.'
      }),
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(toDos),
  }
}