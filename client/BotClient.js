const { Client } = require("discord.js");
const { readdirSync } = require("fs");
const util = require("../util.js");

exports.BotClient = class BotClient {
    constructor(token) {
        this.token = token;
    }

    async start() {
        // Check if the token is a string. If not, this function will give an error anyway.
        if (this.token != undefined && typeof this.token == "string") {
            // If there already is a client, stop it.
            if (this.client) {
                this.client.destroy();
            }
          
            // Create a new client.
            this.client = new Client();

            this.start_processing_events();

            this.client.login(this.token);

            // Intialize the utility functions, so they have access to the client aswell,
            // without having to pass it as a parameter.
            util.init(this.client);
        }
    }

    start_processing_events() {
        const event_files = readdirSync(`${__dirname}/../events/`);

        for (const file of event_files) {
            // Because the files are stored as strings, we can manipulate it as a string.
            const event_name = file.split(".")[0] // Read the file name up to the dot
                                                  // seperating the file from an
                                                  // extension. (i.e: Test.js becomes Test)
            const event = require(`${__dirname}/../events/${file}`);

            // When the client receives an event, fire the function in the file, so the
            // event gets handled.
            this.client.on(event_name, (...args) => {
                event.fire(this.client, ...args);
            });
        }
    }
}
