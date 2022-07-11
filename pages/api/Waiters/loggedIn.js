import GetToken from "../../../lib/helpers/token"
import jwt from "jsonwebtoken"
import WaiterTable from '../../../lib/models/WaiterModel';
import bcrypt from "bcrypt"
import connectToDb from "../../../lib/db"

export default async function LoggedIn(req, res) {
    try {

        const { method } = req;
        if (method !== "POST") {
            return res.status(400).json({ errorMessage: "Only POST is allowed", });
        }
        const reqAuth = req.headers["x-auth-token"];

        if (reqAuth !== process.env.X_AUTH_TOKEN)
            return res.status(400).json({ errorMessage: "Unauthorized", });

        const { token, uniqueID } = req.body;

        if ((!uniqueID) || (!token) || (typeof (uniqueID) != "string") || (typeof (token) != "string"))
            return res.json(false);

        // decrypt the object
        const Token = GetToken(token)

        if (!Token)
            return res.json(false);

        if (Token) {
            const payload = jwt.verify(Token, process.env.JWT_SECRET_WAITER);

            const gen = new Date();
            const time = gen.toISOString();

            if (payload.date < time) {
                return res.json(false);
            }
            const _id = payload.user
            await connectToDb();

            const existingUser = await WaiterTable.findOne({ _id });

            const uniqueIDCorrect = await bcrypt.compare(
                uniqueID,
                existingUser.uniqueID
            );

            if (!uniqueIDCorrect) {
                res.json(false);
            } else {
                const date = new Date()
                let body = {
                    "LoggedIn": true,
                    "RestaurantName": existingUser.RestaurantName,
                    "ServerTime": date,
                    "UserName": existingUser.UserName,
                    "Data": existingUser.Data
                }
                if (existingUser.Notifications != undefined) {
                    body.Notifications = existingUser.Notifications
                }

                res.send(body);

            }
        }
    } catch (err) {
        console.log(err)
        res.json(false);
    }
};