const GoogleCalendar = require('./googlecalendar').GoogleCalendar
const isAccessTokenValid = require('./auth').isAccessTokenValid;

/*
Format of event body
{
  eventType: "events" | "calendar",
  calendarId: string,
  accessToken: string,
  maxResults: number,
  timeMin: string,
  timeMax: string,
  pageToken: string (optional)
}

Response format
{
  body: response data or error
  statusCode: number
}
*/
async function eventHandler(rawEvent) {
  const event = JSON.parse(rawEvent.body);
  const eventType = event.eventType;

  const calendarId = event.calendarId;
  if (!calendarId || typeof calendarId !== 'string') {
    return {
      body: JSON.stringify({
        errorMessage: 'calendarId: must be a string',
      }),
      statusCode: 400
    }
  }

  const accessToken = event.accessToken
  if (!accessToken || typeof accessToken !== 'string') {
    return {
      body: JSON.stringify({
        errorMessage: 'accessToken: must be a string',
      }),
      statusCode: 400
    }
  }

  const valid = await isAccessTokenValid(accessToken)
  if (!valid) {
    return {
      body: JSON.stringify({
        errorMessage: 'Unauthorized',
      }),
      statusCode: 401,
    }
  }

  let googleCalendar;
  try {
    googleCalendar = await GoogleCalendar.instance(
      calendarId
    )
  } catch (e) {
    return {
      body: JSON.stringify({
        errorMessage: 'Issue authenticating to google',
      }),
      statusCode: 500
    }
  }

  if (eventType === "calendar") {
    return await googleCalendar.getCalendar()
  } else if (eventType === "events") {
    const maxResults = event.maxResults;
    if (!maxResults || typeof maxResults !== 'number') {
      return {
        body: JSON.stringify({
          errorMessage: 'maxResults: must be a number',
        }),
        statusCode: 400
      }
    }

    const timeMin = event.timeMin;
    if (!timeMin || typeof timeMin !== 'string') {
      return {
        body: JSON.stringify({
          errorMessage: 'timeMin: must be a string',
        }),
        statusCode: 400,
      }
    }

    const timeMax = event.timeMax;
    if (!timeMax || typeof timeMax !== 'string') {
      return {
        body: JSON.stringify({
          errorMessage: 'timeMax: must be a string',
        }),
        statusCode: 400,
      }
    }
    return await googleCalendar.getEvents(
      event.maxResults,
      event.timeMin,
      event.timeMax,
      event.pageToken || undefined
    )
  }

  return {
    body: JSON.stringify({
      errorMessage: `event type ${eventType} not handled`,
    }),
    statusCode: 400
  }
}

exports.handler = async (rawEvent) => {
  try {
    return await eventHandler(rawEvent);
  } catch (e) {
    console.log(`Exception encountered! ${e}`);
    return {
      statusCode: 500
    }
  }
};
