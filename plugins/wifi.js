'use strict';

const server = require('../server.js'); // eslint-disable-line no-unused-vars
const redis = require('../redis.js');

const WIFI_ROOM = 'wifi';

let tsvs = redis.useDatabase('tsv');

// Very ugly but meh
let toTSV = val => (val < 1000 ? '0' : '') + (val < 100 ? '0' : '') + (val < 10 ? '0' : '') + val;

module.exports = {
	commands: {
		addtsv: {
			rooms: [WIFI_ROOM],
			async action(message) {
				if (!this.room) {
					if (!this.getRoomAuth(WIFI_ROOM)) return;
				}

				if (!(this.canUse(2))) return this.pmreply("Permission denied.");

				let [name, tsv] = message.split(',');
				if (!(name && tsv)) return this.pmreply("Syntax: ``.addtsv name, tsv``");

				name = toId(name);
				tsv = parseInt(tsv);
				if (isNaN(tsv) || tsv < 0 || tsv > 4095) return this.pmreply("Invalid value for TSV, should be between 0 and 4096");
				tsv = toTSV(tsv);

				await tsvs.append(name, tsv);

				Connection.send(`${WIFI_ROOM}|/modnote ${this.username} added a TSV for ${name}: ${tsv}`);
				this.reply("TSV successfully added.");
			},
		},
		deletetsv: {
			rooms: [WIFI_ROOM],
			async action(message) {
				if (!this.room) {
					if (!this.getRoomAuth(WIFI_ROOM)) return;
				}

				if (!(this.canUse(2))) return this.pmreply("Permission denied.");

				let name = toId(message);

				if (!(await tsvs.exists(name))) return this.pmreply("User not found");

				await tsvs.del(name);

				Connection.send(`${WIFI_ROOM}|/modnote ${this.username} deleted a TSV for ${name}`);
				this.reply("TSV successfully deleted.");
			},
		},
		tsv: {
			rooms: [WIFI_ROOM],
			permission: 1,
			async action(message) {
				if (!message) return;

				let input = message.split(',').map(val => parseInt(val.trim()));
				if (input.some(tsv => isNaN(tsv) || tsv < 0 || tsv > 4095)) return this.pmreply("Invalid value for TSV, should be between 0 and 4096");
				input = input.map(tsv => toTSV(tsv));

				let matches = {};

				let keys = await tsvs.keys('*');

				for (let i = 0; i < keys.length; i++) {
					let entry = await tsvs.get(keys[i]);

					for (let j = 0; j < entry.length; j += 4) {
						let tsv = entry.slice(j, j + 4);

						if (input.includes(tsv)) {
							if (!matches[tsv]) matches[tsv] = [];
							matches[tsv].push(keys[i]);
						}
					}
				}

				if (Object.keys(matches).length) {
					let output = "Found matches: ";
					output += Object.keys(matches).map(i => `${matches[i].join(', ')} (${i})`).join(', ');
					return this.reply(output);
				}

				return this.reply("No matches found.");
			},
		},
	},
};
