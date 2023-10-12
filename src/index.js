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
  error: string
} | Gcal API response
*/
exports.handler = async (event) => {
  // const event = JSON.parse(event.body);
  const eventType = event.eventType;

  const calendarId = event.calendarId;
  if (!calendarId || typeof calendarId !== 'string') {
    return {
      error: 'calendarId: must be a string'
    }
  }

  const accessToken = event.accessToken
  if (!accessToken || typeof accessToken !== 'string') {
    return {
      error: 'accessToken: must be a string'
    }
  }

  if (!isAccessTokenValid(accessToken)) {
    return {
      error: 'Unauthorized'
    }
  }

  const googleCalendar = await GoogleCalendar.instance(
    calendarId
  )
  if (eventType === "calendar") {
    return await googleCalendar.getCalendar()
  } else if (eventType === "events") {
    const maxResults = event.maxResults;
    if (!maxResults || typeof maxResults !== 'number') {
      return {
        error: 'maxResults: must be a number'
      }
    }

    const timeMin = event.timeMin;
    if (!timeMin || typeof timeMin !== 'string') {
      return {
        error: 'timeMin: must be a string'
      }
    }

    const timeMax = event.timeMax;
    if (!timeMax || typeof timeMax !== 'string') {
      return {
        error: 'timeMax: must be a string'
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
    error: `event type ${eventType} not handled`
  }
};
