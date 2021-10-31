const trello = require("../trello.js");

exports.execute = async (client, message, args, is_police) => {
    let list_id = process.env.TRELLO_LIST_ID_POLICE;

    if (!is_police) {
        list_id = process.env.TRELLO_LIST_ID_AMBULANCE;
    }

    const cards = await trello.get_cards(list_id, process.env.TRELLO_USER_KEY, process.env.TRELLO_USER_TOKEN);

    if (cards) {
        for (let card of cards) {
            trello.delete_card(card.id, process.env.TRELLO_USER_KEY, process.env.TRELLO_USER_TOKEN);
        }
    }

    message.react("\u2705"); // :white_check_mark:
}

exports.info = {
    requires_hc: true,
    channel_data: {
        channel_locked: false,
        channel_id_police: "",
        channel_id_ambulance: ""
    }
}
