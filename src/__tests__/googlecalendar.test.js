const GoogleCalendar = require('../googlecalendar').GoogleCalendar

describe('GoogleCalendar', () => {
  let googleCalendar
  beforeEach(() => {
    googleCalendar = new GoogleCalendar(
      null,
      "test-calendar-id",
      ["test.com"],
      "hash-secret"
    )
  });

  test('redactEmail if in allow list should do nothing', () => {
    const input = "example@test.com"
    const redactedEmail = googleCalendar._redactEmail(input)
    expect(redactedEmail).toEqual(input)
  })

  test('redactEmail if not in allow list should hash it', () => {
    const input = "example@different_test.com"
    const redactedEmail = googleCalendar._redactEmail(input)
    expect(redactedEmail).toEqual(expect.not.stringContaining(input))
  })

  test('redactEvent', () => {
    const input = {
      summary: "Sensitive summary",
      description: "Sensitive info about company private.com/info",
      attachments: [
        {
          "title": "Important document titles",
          "fileId": "fieldId",
          "fileUrl": "https://docs.google.com/document/d/docId/edit",
          "iconLink": "https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.document",
          "mimeType": "application/vnd.google-apps.document"
        }
      ],
      creator: {
        "email": "test1@test.com",
        "displayName": "Test user",
      },
      organizer: {
        "email": "test1@test.com",
        "displayName": "Test user",
      },
      attendees: [
        {
          "email": "test1@test.com",
          "displayName": "Test user",
          "responseStatus": "accepted"
        },
        {
          "email": "test2@other.com",
          "optional": true,
          "displayName": "Test user 2",
          "responseStatus": "needsAction"
        },
      ],
      conferenceData: {
        "notes": "Meeting host test@example.com",
        "parameters": {
          "addOnParameters": {
            "parameters": {
              "scriptId": "1O_9DeEljSH2vrECr8XeFYYRxFFiowFKOivqSDz316BlBcDXrF00BXrkO",
              "meetingType": "2",
              "meetingUuid": "uuid",
              "realMeetingId": "id",
              "meetingCreatedBy": "test@example.com"
            }
          }
        },
        "entryPoints": [
          {
            "uri": "zoom.us/test",
            "label": "zoom.us/test",
            "passcode": "passcode",
            "meetingCode": "meetingCode",
            "entryPointType": "video"
          },
        ],
        "conferenceId": "conferenceId",
      },
      "extendedProperties": {
        "shared": {
          "meetingId": "meetingId",
          "meetingParams": "{\"topic\":\"Important topic \",\"type\":3}"
        }
      }
    }

    const redactedEvent = googleCalendar._redactEvent(input)
    expect(redactedEvent).toEqual({
      summary: "<REDACTED>",
      description: "",
      attachments: [],
      conferenceData: {},
      extendedProperties: {},
      creator: {
        "email": "test1@test.com",
        "displayName": "",
      },
      organizer: {
        "email": "test1@test.com",
        "displayName": "",
      },
      attendees: [
        {
          "email": "test1@test.com",
          "displayName": "",
          "responseStatus": "accepted"
        },
        {
          "email": "0128f2daa0082064bf3ffac5d5f2f610a1463b25.d7c7ac4f873a11368da52db224386c7d958d10f6@example.com",
          "optional": true,
          "displayName": "",
          "responseStatus": "needsAction"
        },
      ],
    })
  })

  test('redactEvent with recruiting link to preserve', () => {
    const input = {
      summary: "Sensitive summary",
      description: "Sensitive info about company private.com/info something.ashbyhq.com/link greenhouse.io/example"
    }

    const redactedEvent = googleCalendar._redactEvent(input)
    expect(redactedEvent).toEqual({
      summary: "<REDACTED>",
      description: "greenhouse.io/example something.ashbyhq.com/link"
    })
  })
})