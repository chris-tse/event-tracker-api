import * as Knex from 'knex';
import { getGroups } from '../queries/groups';
import { getUpcomingEvents } from '../utils/meetup';
import { DBMeetupGroup, DBMeetupEvent } from '@typedefs/db';
import { MeetupEvent } from '@typedefs/meetup';
import { updateDBFromMeetupEventID } from '../utils/db';

async function main() {
	// Initialize db connection to pass into queries
	const knex = Knex(require('../knexfile'));

	let dbGroups: DBMeetupGroup[];

	try {
		dbGroups = await getGroups(knex);
	} catch (error) {
		console.error('DB Error: Could not retrieve groups', error);
		process.exit(1);
	}

	const groupMeetupUrlNames = dbGroups.map(g => g.meetup_url_name);

	let upcomingMeetupEventsNested: MeetupEvent[][];

	try {
		upcomingMeetupEventsNested = await getUpcomingEvents(groupMeetupUrlNames);
	} catch (error) {
		console.error(error, 'Unable to fetch upcoming events');
		process.exit(1);
	}

	const upcomingMeetupEvents = upcomingMeetupEventsNested.flat();
	const upcomingMeetupEventIDs = upcomingMeetupEvents.map(event => event.id).map(String);

	await Promise.all(upcomingMeetupEventIDs.map(id => updateDBFromMeetupEventID(knex, id)));

	// For each upcomingEvent: event
	// Check if event ID in event table
	//	a. If so, check if pertinent details have changed, update those if so
	//		i. Pull dbevent where dbevent.meetup_id === event.id
	//		ii. Check whether dbevent start_time, title is different from event.time and event.name
	//	b. If not, insert new event
	//

	knex.destroy();
}

main();
