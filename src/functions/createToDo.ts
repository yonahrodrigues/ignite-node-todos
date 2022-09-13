import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidV4 } from 'uuid';
import dayjs from 'dayjs';

import { document } from '../utils/dynamoDBClient';

interface ICreateToDo {
  title: string;
  deadline: Date;
}

export const handle: APIGatewayProxyHandler = async (event) => {
  const { userid } = event.pathParameters;
  const { 
    title,
    deadline,
  } = JSON.parse(event.body) as ICreateToDo;

  const { Items: oldToDo } = await document.query({
    TableName: 'users_todo',
    ExpressionAttributeValues: {
      ':user_id': userid,
    },
    KeyConditionExpression: 'user_id = :user_id',
  }).promise();

  const todoAlreadyExist = oldToDo
    .find(i => i.title === title || 
      i.deadline === dayjs(deadline).toISOString());

  if (todoAlreadyExist) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'ToDo similar or with same date already exists!',
        todoAlreadyExist
      })
    }
  };

  const newToDo = {
    id: uuidV4(),
    user_id: userid,
    title,
    done: false,
    deadline: dayjs(deadline).toISOString(),
  }

  await document.put({
    TableName: 'users_todo',
    Item: newToDo,
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: 'ToDo created!',
      newToDo
    })
  }
}