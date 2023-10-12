const GoogleCalendar = require('./googlecalendar').GoogleCalendar

/*
Format of event body
{
  eventType: "events" | "calendar",
  calendarId: string
}
*/
exports.handler = async (event) => {
  const eventType = event.eventType; // Either "events" or "calendars"
  const calendarId = event.calendarId;

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
