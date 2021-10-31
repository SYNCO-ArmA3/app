const http = require("superagent");
const util = require("./util.js");

// Get the API Key at: https://trello.com/app-key
// On that same page, there is also a link to get a token.

const base_url = "https://api.trello.com/1";

exports.create_card = async (list_id, card_info, key, token) => {
    const url = `${base_url}/cards?key=${key}&token=${token}`;

    let data = null;

    await http
        .post(url) // This request is a POST request on the url.
        .send({ // Give the request a JSON body.
            idList: list_id,
            name: card_info.name,
            desc: card_info.desc
        })
        .then(response => data = response.body)
        .catch(error => util.process_error(error));

    return data;
}

exports.get_cards = async (list_id, key, token) => {
    const url = `${base_url}/lists/${list_id}/cards?fields=name,desc&key=${key}&token=${token}`;

    let data = null;

    await http
        .get(url)
        .then(response => data = response.body)
        .catch(error => util.process_error(error));

    return data;
}

exports.get_card_by_name = async (list_id, card_name, key, token) => {
    const cards = await exports.get_cards(list_id, key, token);

    // Only iterate through the cards, if the list actually contains cards.
    if (cards) {
        for (const card of cards) {
            if (card.name == card_name) {
                return card;
            }
        }
    }

    return null;
}

exports.update_card = async (card_id, new_card_info, key, token) => {
    const url = `${base_url}/cards/${card_id}?key=${key}&token=${token}`;

    let data = null;

    await http
        .put(url)
        .send(new_card_info)
        .then(response => data = response.body);

    return data;
}

exports.delete_card = async (card_id, key, token) => {
    const url = `${base_url}/cards/${card_id}?key=${key}&token=${token}`;

    let data = null;

    await http
        .delete(url)
        .then(response => data = response.body)
        .catch(error => util.process_error(error));

    return data;
}
