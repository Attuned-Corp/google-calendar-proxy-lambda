const google = require('googleapis').google

const EVENTS_MAX_RESULTS = 1000;
const DEFAULT_CUTOFF_DAYS = 90;

class Googlecalendar {
  static googleCalendars = {};

  constructor(
    client,
    calendarId,
  ) {
    this.client = client
    this.calendarId = calendarId
  }

  static async instance(
    calendarId
  ) {
    // Return an existing calendar client instance if present, otherwise create a new one
    if (Googlecalendar.googleCalendars[calendarId]) {
      return Googlecalendar.googleCalendars[calendarId];
    }

    const auth = new google.auth.GoogleAuth({
      // Scopes can be specified either as an array or as a single, space-delimited string.
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
      credentials: {
        private_key: (process.env.GCAL_PRIVATE_KEY || "").replace(/\\n/g, '\n'),
        client_email: (process.env.GCAL_CLIENT_EMAIL || ""),
      },
      clientOptions: {}
    });

    const calendarClient = google.calendar({version: 'v3', auth});

    // Create and cache calendar client for each calendar id
    Googlecalendar.googleCalendars[calendarId] = new Googlecalendar(
      calendarClient,
      calendarId,
    );
    return Googlecalendar.googleCalendars[calendarId];
  }

  async _invokeCallWithErrorWrapper(
    func,
    message = '',
    pageToken,
  ) {
    let res;
    try {
      res = await func(pageToken);
    } catch (err) {
      this._wrapAndThrow(err, message);
    }
    return res;
  }

  _wrapAndThrow(err, message = '') {
    if (err.error_code || err.error_info) {
      throw new Error(`${err.error_code}: ${err.error_info}`);
    }
    let errorMessage = message;
    try {
      errorMessage += err.message ?? err.statusText;
    } catch (wrapError) {
      errorMessage += wrapError.message;
    }
    throw new Error(errorMessage);
  }

  _redactEvent(event) {
    // Redact the whole summary
    event.summary = "<REDACTED>"

    // Run regex on description to replace sensitive urls
    const urlsToReplace = [
      'greenhouse\.io',
      'ashbyhq\.com'
    ]
    const newDescription = event.description
    for (const url of urlsToReplace) {
      var regex = "[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{0,256}(" + url + ")([-a-zA-Z0-9@:%_\+.~#?&//=]*)"
      newDescription.replace(new RegExp(regex, 'ig'), url)
    }
    event.description = newDescription

    // TODO: Run regex on emails
    // Replace any from external domains with hashes
    // creator.email
    // organizer.email
    // attendees[num].email
    const allowDomains = process.env("ALLOW_DOMAINS") || []

    return event;
  }

  async paginate(
    func,
    calendarId
  ) {
    let nextPageToken;
    let items = [];
    do {
      const response = await this._invokeCallWithErrorWrapper(
        func,
        '',
        nextPageToken,
      );

      if (response?.status >= 300) {
        throw new VError(`${response?.status}: ${response?.statusText}`);
      }
      const nextSyncToken = response?.data?.nextSyncToken;
      for (const item of response?.data.items ?? []) {
        items.push({...this._redactEvent(item), nextSyncToken, calendarId});
      }

      nextPageToken = response?.data?.nextPageToken;
    } while (nextPageToken);

    return items;
  }

  async getEvents() {
    const calendar = await this.getCalendar();

    const cutoffDays = process.env.CUTOFF_DAYS || DEFAULT_CUTOFF_DAYS;
    const startDate = new Date((new Date()).getTime() - cutoffDays * 24 * 60 * 60 * 1000);
    const endDate = new Date((new Date()).getTime() + 1 * 24 * 60 * 60 * 1000);

    const func = (pageToken) => {
      const params = {
        calendarId: calendar.id,
        pageToken,
        maxResults: EVENTS_MAX_RESULTS,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString()
      };

      return this.client.events.list(params);
    };

    return await this.paginate(func, calendar.id);
  }

  async getCalendar(calendarId = this.calendarId) {
    try {
      const response = await this.client.calendars.get({calendarId});
      return response.data;
    } catch (err) {
      this._wrapAndThrow(err);
    }
  }
}

module.exports = {
  Googlecalendar
}
  