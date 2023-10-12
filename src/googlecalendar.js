const google = require('googleapis').google
const createHash = require('crypto').createHash

const EVENTS_MAX_RESULTS = 1000;
const DEFAULT_CUTOFF_DAYS = 90;

class GoogleCalendar {
  static googleCalendars = {};

  constructor(
    client,
    calendarId,
    cutoffDays,
    allowDomains,
    proxySecret
  ) {
    this.client = client
    this.calendarId = calendarId
    this.cutoffDays = cutoffDays
    this.allowDomains = allowDomains
    this.proxySecret = proxySecret
  }

  static async instance(
    calendarId
  ) {
    // Return an existing calendar client instance if present, otherwise create a new one
    if (GoogleCalendar.googleCalendars[calendarId]) {
      return GoogleCalendar.googleCalendars[calendarId];
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

    const cutoffDays = process.env.CUTOFF_DAYS || DEFAULT_CUTOFF_DAYS
    let allowDomains = []
    if (process.env.ALLOW_DOMAINS) {
      allowDomains = process.env.ALLOW_DOMAINS.split(",")
    }
    const proxySecret = process.env.PROXY_SECRET || ""

    // Create and cache calendar client for each calendar id
    GoogleCalendar.googleCalendars[calendarId] = new GoogleCalendar(
      calendarClient,
      calendarId,
      cutoffDays,
      allowDomains,
      proxySecret
    );
    return GoogleCalendar.googleCalendars[calendarId];
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

  _redactEmail(email) {
    if (!email) return email

    const splitEmail = email.split("@");
    if (splitEmail.length < 2) return email

    if (this.allowDomains.includes(splitEmail[1])) {
      return email
    }

    // Hash email address and domain
    const addressHash = createHash('sha1').update(`${splitEmail[0]}-${this.proxySecret}`).digest('hex');
    const domainHash = createHash('sha1').update(`${splitEmail[1]}-${this.proxySecret}`).digest('hex');
    return `${addressHash}.${domainHash}@example.com`
  }

  _redactEvent(event) {
    // Redact the whole summary
    event.summary = "<REDACTED>"

    // Run regex on description to replace sensitive urls
    const urlsToReplace = [
      'greenhouse\.io',
      'ashbyhq\.com',
    ]
    if (event.description) {
      const newDescription = event.description
      for (const url of urlsToReplace) {
        var regex = "[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{0,256}(" + url + ")([-a-zA-Z0-9@:%_\+.~#?&//=]*)"
        newDescription.replace(new RegExp(regex, 'ig'), url)
      }
      event.description = newDescription
    }

    // Replace any emails from external domains with hashes
    const creator = event.creator;
    if (creator) {
      creator.email = this._redactEmail(creator.email);
    }
    const organizer = event.organizer
    if (organizer) {
      organizer.email = this._redactEmail(organizer.email);
    }
    const attendees = event.attendees || []
    for (let i = 0; i < attendees.length; i++) {
      attendees[i].email = this._redactEmail(attendees[i].email);
    }

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

    const startDate = new Date((new Date()).getTime() - this.cutoffDays * 24 * 60 * 60 * 1000);
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
  GoogleCalendar: GoogleCalendar
}
  