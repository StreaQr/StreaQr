import GetToken from "../../../lib/helpers/token"
import jwt from "jsonwebtoken"
import Resto from '../../../lib/models/RestoModel';
import bcrypt from "bcrypt"
import connectToDb from "../../../lib/db"
import WaitersSchedules from "../../../lib/models/WaitersSchedules";

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
            const payload = jwt.verify(Token, process.env.JWT_SECRET);

            const gen = new Date();
            const time = gen.toISOString();

            if (payload.date < time) {
                return res.json(false);
            }
            const _id = payload.user
            await connectToDb();

            const existingUser = await Resto.findOne({ _id });

            const uniqueIDCorrect = await bcrypt.compare(
                uniqueID,
                existingUser.UniqueID
            );
            if (!uniqueIDCorrect) {
                res.json(false);
            } else {

                const date = new Date()

                let Subscription = false
                if ((existingUser.Subscription.status == "Premium") && (existingUser.Subscription.expire > date))
                    Subscription = true


                let body = {
                    "LoggedIn": true,
                    "Country": existingUser.Country,
                    "RestaurantName": existingUser.RestaurantName,
                    "RestoData": existingUser.RestoData,
                    "ServerTime": date,
                    "Subscription": { "Premium": Subscription, }
                }
                if (existingUser.Subscription.trialUsed == false)
                    body.Subscription.trialUsed = false


                if (Subscription)
                    body.Subscription.expire = existingUser.Subscription.expire
                if (existingUser.RestoOptions)
                    body.RestoOptions = existingUser.RestoOptions
                if (existingUser.Menu)
                    body.Menu = existingUser.Menu

                const WaitersSchedulesData = await WaitersSchedules.findOne({ RestaurantID: existingUser._id })
                if ((WaitersSchedulesData != undefined) && (WaitersSchedulesData.Waiters != undefined))
                    body.Waiters = WaitersSchedulesData.Waiters
                if (existingUser.OnlineMenu != undefined)
                    body.OnlineMenu = existingUser.OnlineMenu

                res.send(body);
            }
        }
    } catch (err) {
        console.log(err)
        res.json(false);
    }
};