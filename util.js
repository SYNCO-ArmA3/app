const util = require("./util");
const http = require("superagent");

let client = null;

exports.init = (_client) => {
    client = _client;
}

exports.process_error = async (error) => {
    // Output the error.
    console.error(error.stack);

    if (client) {
        // Notify Valatos about the error by also sending the error via a DM to him.
        const valatos = await client.fetchUser(process.env.VALATOS_USER_ID);

        if (valatos) {
            valatos.send(`An error has occured!\n\n\`\`\`${error.stack}\`\`\``);
        }
    }
}

exports.get_username_if_exists = async (username) => {
    const url = `https://api.roblox.com/users/get-by-username?username=${username}`;

    let data = null;

    await http
        .get(url)
        .then(response => data = response.body)
        .catch(error => error = util.process_error(error));

    if (data.success == undefined && data.succes == false) {
        // The user does not exist.
        return null;
    }

    // We return this, because this also includes the
    // uppercase characters in the right place, in case the user
    // gets those wrong.
    return data.Username;
}
