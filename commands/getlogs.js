const trello = require("../trello.js");
const util = require("../util.js");

exports.execute = async (client, message, args, is_police) => {
    if (args.length != 1) {
        message.reply("Please, specify your username.");

        return;
    }

    const roblox_username = await util.get_username_if_exists(args[0]);

    if (!roblox_username) {
        message.reply("That user does not exist! Are you sure you have entered the right name?");

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
          message.reply(`These are your hours and minutes patrolled:\n\n${card.desc}`);
       } else {
          message.reply("I could not find your patrol data. Are you sure you have logged your patrols?");
       }
    } else {
        card = await trello.get_card_by_name(
            process.env.TRELLO_LIST_ID_AMBULANCE,
            roblox_username,
            process.env.TRELLO_USER_KEY,
            process.env.TRELLO_USER_TOKEN
        );
      
        if (card) {
           message.reply(`These are your hours and minutes patrolled:\n\n${card.desc}`);
        } else {
           message.reply("I could not find your patrol data. Are you sure you have logged your patrols?");
        }
    }
    
    message.react("\u2705"); // :white_check_mark:
}

exports.info = {
    requires_hc: false,
    channel_data: {
        channel_locked: true,
        channel_id_police: "557183158924214301",
        channel_id_ambulance: "697071975822000169"
    }
}
