const google = require('googleapis').google
const createHash = require('crypto').createHash
const assertSecret = require('./secretManager').assertSecret
class GoogleCalendar {
  static googleCalendars = {};

  constructor(
    client,
    calendarId,
    allowDomains,
    hashSecret
  ) {
    this.client = client
    this.calendarId = calendarId
    this.allowDomains = allowDomains
    this.hashSecret = hashSecret
  }

  static async instance(
    calendarId
  ) {
    // Return an existing calendar client instance if present, otherwise create a new one
    if (GoogleCalendar.googleCalendars[calendarId]) {
      return GoogleCalendar.googleCalendars[calendarId];
    }

    const gcalCredentials = JSON.parse(await assertSecret("GCAL_SECRET_ID"))

    const jwtClient = new google.auth.JWT({
      email: (gcalCredentials.client_email || ""),
      key: (gcalCredentials.private_key || "").replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
      subject: calendarId,
    });
  
    const credentials = await jwtClient.authorize();
    const auth = new google.auth.OAuth2();
    auth.setCredentials(credentials);

    const calendarClient = google.calendar({version: 'v3', auth});

    let allowDomains = []
    if (process.env.ALLOWED_EMAIL_DOMAINS) {
      allowDomains = process.env.ALLOWED_EMAIL_DOMAINS.split(",")
    }
    const proxyCredentials = JSON.parse(await assertSecret("PROXY_SECRET_ID"))

    // Create and cache calendar client for each calendar id
    GoogleCalendar.googleCalendars[calendarId] = new GoogleCalendar(
      calendarClient,
      calendarId,
      allowDomains,
      proxyCredentials.hash_secret || ""
    );
    return GoogleCalendar.googleCalendars[calendarId];
  }

  _getError(err, message = '') {
    if (err.error_code || err.error_info) {
      return {
        body: JSON.stringify({
          errorMessage: `${err.error_code}: ${err.error_info}`,
        }),
        statusCode: 500
      }
    }
    let errorMessage = message;
    try {
      errorMessage += err.message ?? err.statusText;
    } catch (wrapError) {
      errorMessage += wrapError.message;
    }
    return {
      body: JSON.stringify({
        errorMessage,
      }),
      statusCode: 500
    };
  }

  _redactEmail(email) {
    if (!email) return email

    const splitEmail = email.split("@");
    if (splitEmail.length < 2) return email

    if (this.allowDomains.includes(splitEmail[1])) {
      return email
    }

    // Hash email address and domain
    const addressHash = createHash('sha1').update(`${splitEmail[0]}-${this.hashSecret}`).digest('hex');
    const domainHash = createHash('sha1').update(`${splitEmail[1]}-${this.hashSecret}`).digest('hex');
    return `${addressHash}.${domainHash}@example.com`
  }

  _redactEvent(event) {
    // Redact the whole summary
    event.summary = "<REDACTED>"

    // Run regex on description to replace sensitive urls
    const urlsToMatch = [
      'greenhouse\.io',
      'ashbyhq\.com',
    ]
    if (event.description) {
      let newDescription = ""
      for (const url of urlsToMatch) {
        var regex = "[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{0,256}(" + url + ")([-a-zA-Z0-9@:%_\+.~#?&//=]*)"
        const matches = event.description.match(new RegExp(regex, 'ig'))
        if (matches) {
          newDescription = newDescription + (newDescription ? " " : "") + matches.join(" ")
        }
      }
      event.description = newDescription
    }

    // Replace any emails from external domains with hashes
    const creator = event.creator;
    if (creator) {
      creator.email = this._redactEmail(creator.email);
      if (creator.displayName) {
        creator.displayName = ""
      }
    }
    const organizer = event.organizer
    if (organizer) {
      organizer.email = this._redactEmail(organizer.email);
      if (organizer.displayName) {
        organizer.displayName = ""
      }
    }
    const attendees = event.attendees || []
    for (let i = 0; i < attendees.length; i++) {
      attendees[i].email = this._redactEmail(attendees[i].email);
      if (attendees[i].displayName) {
        attendees[i].displayName = ""
      }
    }

    if (event.attachments) {
      event.attachments = []
    }

    if (event.conferenceData) {
      event.conferenceData = {}
    }

    if (event.extendedProperties) {
      event.extendedProperties = {}
    }

    return event;
  }

  async getEvents(
    maxResults,
    timeMin,
    timeMax,
    pageToken = undefined
  ) {
    const params = {
      calendarId: this.calendarId,
      pageToken,
      maxResults,
      timeMin,
      timeMax,
      singleEvents: true,
    };

    let response;
    try {
      response = await this.client.events.list(params);
    } catch (err) {
      return this._getError(err);
    }

    const responseItems = response.data?.items ?? [];
    if (responseItems) {
      const redactedItems = []
      for (const item of responseItems) {
        redactedItems.push(this._redactEvent(item));
      }
      response.data.items = responseItems;
    }

    return {
      body: JSON.stringify(response.data),
      statusCode: response.status,
    };
  }

  async getCalendar(calendarId = this.calendarId) {
    try {
      const response = await this.client.calendars.get({calendarId});
      return {
        body: JSON.stringify(response.data),
        statusCode: response.status
      }
    } catch (err) {
      return this._getError(err);
    }
  }
}

module.exports = {
  GoogleCalendar: GoogleCalendar
}
  