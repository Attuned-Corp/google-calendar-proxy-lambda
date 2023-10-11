const Googlecalendar = require('./src/googlecalendar').Googlecalendar

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

  const googleCalendar = await Googlecalendar.instance(
    calendarId
  )
  if (eventType === "calendar") {
    return await googleCalendar.getCalendar()
  } else if (eventType === "events") {
    return await googleCalendar.getEvents()
  }

  return response;
};