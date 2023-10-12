const GoogleCalendar = require('./googlecalendar').GoogleCalendar
const isAccessTokenValid = require('./auth').isAccessTokenValid;

/*
Format of event body
{
  eventType: "events" | "calendar",
  calendarId: string
  accessToken: string
}
*/
exports.handler = async (event) => {
  const eventType = event.eventType;

  const calendarId = event.calendarId;
  if (!calendarId || typeof calendarId !== 'string') {
    throw new Error('calendarId: must be a string');
  }

  const accessToken = event.accesstoken
  if (!accessToken || typeof accessToken !== 'string') {
    throw new Error('accessToken: must be a string');
  }

  // Verify access token is valid
  if (!isAccessTokenValid(accessToken)) {
    throw new Error('Unauthorized')
  }

  const googleCalendar = await GoogleCalendar.instance(
    calendarId
  )
  if (eventType === "calendar") {
    return await googleCalendar.getCalendar()
  } else if (eventType === "events") {
    return await googleCalendar.getEvents()
  }

  throw new Error(`event type ${eventType} not handled`);
};
