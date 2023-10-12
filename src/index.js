const GoogleCalendar = require('./googlecalendar').GoogleCalendar

/*
Format of event body
{
  eventType: "events" | "calendar",
  calendarId: string
}
*/
exports.handler = async (event) => {
  let body = JSON.parse(event.body)

  const eventType = body.eventType; // Either "events" or "calendars"
  const calendarId = body.calendarId;

  const googleCalendar = await GoogleCalendar.instance(
    calendarId
  )
  if (eventType === "calendar") {
    return await googleCalendar.getCalendar()
  } else if (eventType === "events") {
    return await googleCalendar.getEvents()
  }

  return response;
};
