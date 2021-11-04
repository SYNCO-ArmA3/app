const trello = require("../trello.js");
const util = require("../util.js");

exports.execute = async (client, message, args, is_police) => {
    if (args.length != 3) {
        message.reply("Per cortesia, specifica il tuo username roblox, le ore ed i minuti che hai compiuto nel pattugliamento." +
                      "\n" +
                      "Se hai compiuto un turno la cui durata e' inferiore ad un'ora, scrivi 0 nelle ore." +
                      "\n\n" +
                      `Esempio: ${process.env.PREFIX}logpatrol Username 0 30` +
                      "\n" +
                      "'Username' sta per il tuo esatto nome roblox, la seconda opzione sta per le ore e la terza per i minuti totalizzati");

        return;
    }

    // Check if the username exists, and if it does, return it so we can use it.
    const roblox_username = await util.get_username_if_exists(args[0]);

    // The user does not exist.
    if (!roblox_username) {
        message.reply("Questo utente non esiste! Sicuro di aver inserito correttamente il nome?");

        return;
    }

    // These three variables are here just to improve readability.
    let hours_patrolled = parseInt(args[1]);
    let minutes_patrolled = parseInt(args[2]);

    if (Number.isNaN(hours_patrolled) || Number.isNaN(minutes_patrolled)) {
        message.reply("Devi usare numeri per indicare le ore ed i minuti!");

        return;
    }

    if (minutes_patrolled > 60 || minutes_patrolled < 0) {
        message.reply("I minuti non possono essere ne' inferiori a zero ne' superiori a sessanta..")

        return;
    }

    if (hours_patrolled < 0) {
        message.reply("Non esistono ore inferiori a zero, inserisci le ore le quali hai totalizzato!");

        return;
    }

    let existing_card;

    if (is_police) {
        existing_card = await trello.get_card_by_name(
            process.env.TRELLO_LIST_ID_POLICE,
                roblox_username,
                process.env.TRELLO_USER_KEY,
                process.env.TRELLO_USER_TOKEN
        );
    } else {
        existing_card = await trello.get_card_by_name(
            process.env.TRELLO_LIST_ID_AMBULANCE,
                roblox_username,
                process.env.TRELLO_USER_KEY,
                process.env.TRELLO_USER_TOKEN
        );
    }

    let response = null;

    if (!existing_card) {
        const description = `Ore totalizzate: ${hours_patrolled}\nMinuti Totalizzati: ${minutes_patrolled}`;

        if (is_police) {
            response = await trello.create_card(process.env.TRELLO_LIST_ID_POLICE, {
                name: roblox_username,
                desc: description
            }, process.env.TRELLO_USER_KEY, process.env.TRELLO_USER_TOKEN);
        } else {
            response = await trello.create_card(process.env.TRELLO_LIST_ID_AMBULANCE, {
                name: roblox_username,
                desc: description
            }, process.env.TRELLO_USER_KEY, process.env.TRELLO_USER_TOKEN);
        }
    } else {
        const old_description = existing_card.desc;

        // Parse the description so that we only get the hours patrolled in a number.
        const old_hours_patrolled   = parseInt(old_description.split("Ore totalizzate: ")[1] // Remove the "Hours patrolled: " in front of the hours.
                                                              .split("\n"));                 // Also remove everything that comes on a new line.

        // Do the same to minutes as for hours.
        const old_minutes_patrolled = parseInt(old_description.split("Minuti totalizzati: ")[1] // Remove the "Minutes patrolled: " in front of the minutes.
                                                              .split("\n"));                   // Also remove everything that comes on a new line.

        if (Number.isNaN(old_hours_patrolled) || Number.isNaN(old_minutes_patrolled)) {
            return;
        }

        // Because the values have been put there by us before, we can assume the numbers follow the right criteria.
        let new_hours_patrolled   = old_hours_patrolled   + hours_patrolled;
        let new_minutes_patrolled = old_minutes_patrolled + minutes_patrolled;

        if (new_minutes_patrolled >= 60) {
            new_hours_patrolled++;
            new_minutes_patrolled -= 60;
        }

        const description = `Ore totalizzate: ${new_hours_patrolled}\nMinuti totalizzati: ${new_minutes_patrolled}`;

        response = await trello.update_card(existing_card.id, {
            desc: description
        }, process.env.TRELLO_USER_KEY, process.env.TRELLO_USER_TOKEN);
    }

    if (response == null || (response.statusCode && response.statusCode == 429))
    {
        message.react("\u26A0"); // :warning:

        message.reply("I'm sorry, but something went wrong processing your patrol log. Please try again later, because we might have exceeded a ratelimit. If it keeps occuring, please message Valatos.");
    } else {
        message.react("\u2705"); // :white_check_mark:
    }
}

exports.info = {
    requires_hc: false,
    channel_data: {
        channel_locked: true,
        channel_id_police: "810570954450141239",
        channel_id_ambulance: "697071975822000169"
    }
}
