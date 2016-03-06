var fs = require('fs');

// Host and port of the PS server to connect to.
exports.host = 'sim.smogon.com';
exports.port = '8000';

// Port to use for the http server part of Kid A.
exports.serverport = '8000';

// Username and password to use on PS.
exports.username = '';
exports.password = '';

// Rooms to join and avatar to choose. The maximum amount of rooms Kid A can join upon connecting is 11.
// The reason for these restrictions is the way PS protocol works. I might try to get around it at a later date, but this is it for now.
exports.rooms = ['dev'];
exports.avatar = '246';

// Symbol to use for commands, and the ranks that can add quotes to the db.
exports.commandSymbol = '.';
exports.canQuote = ['@', '&', '#', '~'];
