const trello = require("../trello.js");
const util = require("../util.js");

exports.execute = async (client, message, args, is_police) => {
    if (args.length != 1) {
        message.reply("Devi specificare il nome utente.");

        return;
    }

    const roblox_username = await util.get_username_if_exists(args[0]);

    if (!roblox_username) {
        message.reply("Utente non trovato.");

        return;
    }

    let card;

    if (is_police) {
        card = await trello.get_card_by_name(
            process.env.TRELLO_LIST_ID_POLICE,
            roblox_username,
            process.env.TRELLO_USER_KEY,
            process.env.TRELLO_USER_TOKEN
        );
      
       if (card) {
          message.reply(`Ecco il tempo totalizzato dall'operatore:\n\n${card.desc}`);
       } else {
          message.reply("Nessun risultato trovato.");
       }
    } else {
        card = await trello.get_card_by_name(
            process.env.TRELLO_LIST_ID_AMBULANCE,
            roblox_username,
            process.env.TRELLO_USER_KEY,
            process.env.TRELLO_USER_TOKEN
        );
      
        if (card) {
           message.reply(`Ecco il tempo totalizzato:\n\n${card.desc}`);
        } else {
           message.reply("Nessun risultato trovato.");
        }
    }
    
    message.react("\u2705"); // :white_check_mark:
}

exports.info = {
    requires_hc: false,
    channel_data: {
        channel_locked: true,
        channel_id_police: "810570954450141239",
        channel_id_ambulance: "905554973209792632"
    }
}
