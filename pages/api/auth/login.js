import rateLimit from "../../../lib/helpers/rate-limiter"
import bcrypt from "bcrypt"
import Resto from '../../../lib/models/RestoModel';
import GetCookie from "../../../lib/helpers/cookie"
import WaitersSchedules from "../../../lib/models/WaitersSchedules";
import connectToDb from "../../../lib/db"
const limiter = rateLimit({
    interval: 120 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500, // Max 500 users per second
})
export default async function Login(req, res) {

    try {
        await limiter.check(res, 8, 'CACHE_TOKEN')
        try {

            const { method } = req;
            if (method !== "POST") {
                return res.status(401).json({ errorMessage: "Only POST is allowed", });
            }

            const reqAuth = req.headers["x-auth-token"];

            if (reqAuth !== process.env.X_AUTH_TOKEN)
                return res.status(401).json({ errorMessage: "Unauthorized" });

            const { Email, password, uniqueID, Code } = req.body;

            if (!Email || !password, !uniqueID)
                return res.status(400).json({ errorMessage: "Please enter all required fields." });
            if ((typeof (Email) != "string") || (typeof (password) != "string") || (typeof (uniqueID) != "string"))
                return res.status(400).json({ errorMessage: "Incorrect format" });


            await connectToDb();

            const existingUser = await Resto.findOne({ Email });

            if (!existingUser)
                return res.status(401).json({ errorMessage: "Wrong Email or password." });

            const passwordCorrect = await bcrypt.compare(
                password,
                existingUser.PasswordHash
            );
            const uniqueIDCorrect = await bcrypt.compare(
                uniqueID,
                existingUser.UniqueID
            );

            if (!passwordCorrect) {
                return res.status(401).json({ errorMessage: "Wrong Email or password." });
            }

            if ((passwordCorrect) && (!uniqueIDCorrect) && (!Code)) {
                const resetNumber = Math.floor(Math.random() * (1000000 - 0) + 0)
                const code = resetNumber.toString();
                const isalt = await bcrypt.genSalt();
                const codeHash = await bcrypt.hash(code, isalt);
                const gen = new Date();
                const time = gen.toISOString();

                existingUser.Codehash = codeHash
                existingUser.CodeDate = time
                const saveData = await existingUser.save();

                if (saveData.Email) {

                    return new Promise((resolve, reject) => {
                        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
                        const msg = {
                            to: Email, // Change to your recipient
                            from: 'StreaQr@gmail.com', // Change to your verified sender
                            subject: "New device",
                            dynamic_template_data: {
                                "Header": "New login location detected please use the code below in order to access your account If this request wasn't sent by you, please change your password immediately",
                                "Code": `${code}`
                            },
                            template_id: "d-76c43ca25ee14c7db4660f3ab8731132",
                        }
                        sgMail
                            .send(msg)
                            .then(() => {
                                resolve();
                                return res.status(401).json({ NewDevice: true, errorMessage: "New Device detected" });
                            })
                            .catch((error) => {
                                return res.status(500).json({ errorMessage: "Something went Wrong" });
                            })

                    });

                } else {
                    return res.status(401).json({ errorMessage: "New Device detected we couldn't generate a code please try again" });
                }

            } else if ((passwordCorrect) && (!uniqueIDCorrect) && (Code)) {


                const code = Code.toString();
                if (!existingUser.Codehash) {
                    return res.status(401).json({ errorMessage: "Expired" });
                }
                const codeCorrect = await bcrypt.compare(
                    code,
                    existingUser.Codehash
                );

                const gen = new Date();
                gen.setMinutes(gen.getMinutes() - 30);

                const time = gen.toISOString();
                if (existingUser.Codehash == 0 || "")
                    return res.status(401).json({ errorMessage: "Expired" });

                if (existingUser.CodeDate == "")
                    return res.status(401).json({ errorMessage: "Expired" });

                if (existingUser.CodeDate < time) {
                    existingUser.Codehash = undefined
                    await existingUser.save();
                    return res.status(400).json({ errorMessage: "Expired" });
                }
                if (!codeCorrect)
                    return res.status(401).json({ errorMessage: "Wrong code" });



                const salt = await bcrypt.genSalt();
                const uniqueIDHash = await bcrypt.hash(uniqueID, salt)
                existingUser.Codehash = undefined
                existingUser.CodeDate = undefined
                existingUser.UniqueID = uniqueIDHash

                const saveData = await existingUser.save();

                if (saveData.Email) {

                    const Cookie = GetCookie(existingUser._id)
                    const date = new Date()

                    let body = {
                        "Cookie": Cookie,
                        "Country": existingUser.Country,
                        "RestaurantName": existingUser.RestaurantName,
                        "RestoData": existingUser.RestoData,
                        "ServerTime": date
                    }
                    if (existingUser.RestoOptions)
                        body.RestoOptions = existingUser.RestoOptions
                    if (existingUser.Menu)
                        body.Menu = existingUser.Menu
                    if (existingUser.Waiters != undefined)
                        body.Waiters = existingUser.Waiters
                    if (existingUser.OnlineMenu != undefined)
                        body.OnlineMenu = existingUser.OnlineMenu
                    res.send(body);
                }
            }
            else if ((passwordCorrect) && (uniqueIDCorrect)) {
                const Cookie = GetCookie(existingUser._id)
                const date = new Date()
                let Subscription = false
                if ((existingUser.Subscription.status == "Premium") && (existingUser.Subscription.expire > date))
                    Subscription = true
                let body = {
                    "Cookie": Cookie,
                    "Country": existingUser.Country,
                    "RestaurantName": existingUser.RestaurantName,
                    "RestoData": existingUser.RestoData,
                    "ServerTime": date,
                    "Subscription": { "Premium": Subscription }
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

        } catch (err) {
            console.error(err);
            return res.status(500).json({ errorMessage: "Something went Wrong" });
        }
    }
    catch {
        return res.status(400).json({ errorMessage: "Rate limit exceeded try again later" });
    }

}
