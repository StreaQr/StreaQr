export default async function SendNotification(NotificationID, callback) {
    try {
        const id = process.env.ONESIGNAL_API_ID
        const data = {
            app_id: id,
            contents: { "en": "Your bill is ready to download" },
            include_player_ids: [NotificationID]
        };

        const headers = {
            "Content-Type": "application/json; charset=utf-8"
        };

        const options = {
            host: "onesignal.com",
            port: 443,
            path: "/api/v1/notifications",
            method: "POST",
            headers: headers
        };

        const https = require('https');
        const req = https.request(options, function (res) {
            res.on('data', function (data) {
                const response = JSON.parse(data)
                callback(null, response);
            });
        });

        req.on('error', function (e) {
            callback(true, e);
        });

        req.write(JSON.stringify(data));
        req.end();

    } catch (err) {
        console.error(err);
        return res.send("Couldn't send a notification for the customer")
    }

}

























