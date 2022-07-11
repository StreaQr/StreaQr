import connectToDb from "../../../lib/db"
import Resto from '../../../lib/models/RestoModel';
import validator from 'validator'
import GetCookie from "../../../lib/helpers/cookie"
import bcrypt from "bcrypt"
import rateLimit from "../../../lib/helpers/rate-limiter"
import sgMail from "@sendgrid/mail"
const limiter = rateLimit({
    interval: 120 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500, // Max 500 users per second
})

export default async function Register(req, res) {
    try {
        await limiter.check(res, 15, 'CACHE_TOKEN')
        try {
            const { method } = req;
            if (method !== "POST") {
                return res.status(401).json({ errorMessage: "Only POST is allowed", });
            }
            const reqAuth = req.headers["x-auth-token"];

            if (reqAuth !== process.env.X_AUTH_TOKEN)
                return res.status(401).json({ errorMessage: "Unauthorized", });

            const { Code } = req.body

            if (!Code) { //Create a temp account with a code
                const { Email, OwnerName, RestaurantName } = req.body;

                // validation

                if (!Email || !RestaurantName || !OwnerName) {
                    return res.status(400).json({ errorMessage: "Please enter all required fields." });
                }
                if ((typeof (Email) != "string") || (typeof (RestaurantName) != "string") || (typeof (OwnerName) != "string")) {
                    return res.status(400).json({ errorMessage: "Invalid format" });
                }
                if (!(validator.isEmail(Email))) {
                    return res
                        .status(400)
                        .json({ errorMessage: "Invalid Email format" });
                }


                await connectToDb();
                const existingUser = await Resto.findOne({ Email });
                if ((existingUser) && (existingUser.Temp == undefined)) {
                    return res.status(400).json({
                        errorMessage: "An account with this Email already exists.",
                    });
                }


                const code = Math.floor(Math.random() * (1000000 - 0) + 0)
                const Code = code.toString();
                const CodeDate = new Date();
                const salt = await bcrypt.genSalt();
                const Codehash = await bcrypt.hash(Code, salt);

                //mail creds



                if (existingUser == null) {
                    const newUser = new Resto({
                        RestaurantName,
                        Email,
                        RestoData: { "OwnerName": OwnerName },
                        Codehash,
                        CodeDate,
                        Temp: "1",
                        Subscription: { status: "free", trialUsed: false }
                    });

                    const saveData = await newUser.save();    // save a new user account to the db

                    if (saveData.Email != undefined) {
                        return new Promise((resolve, reject) => {
                            sgMail.setApiKey(process.env.SENDGRID_API_KEY)
                            const msg = {
                                to: Email, // Change to your recipient
                                from: 'StreaQr@gmail.com', // Change to your verified sender
                                subject: "Registration",
                                dynamic_template_data: {
                                    "Header": "Hello, you may find below the verficiation code needed to create a StreaQr account",
                                    "Code": `${Code}`
                                },
                                template_id: "d-76c43ca25ee14c7db4660f3ab8731132",
                            }
                            sgMail
                                .send(msg)
                                .then(() => {
                                    resolve();
                                    res.send("w")
                                })
                                .catch((error) => {
                                    return res.status(500).json({ errorMessage: "Something went Wrong" });
                                })
                        });

                    } else {
                        throw e
                    }
                }
                else {
                    if (existingUser && existingUser.Codehash != 0) { //update old user
                        existingUser.Codehash = Codehash
                        existingUser.CodeDate = CodeDate
                        existingUser.RestoData = { "OwnerName": OwnerName }
                        existingUser.RestaurantName = RestaurantName
                        const saveData = await existingUser.save();

                        if (saveData.Email != undefined) {
                            return new Promise((resolve, reject) => {
                                sgMail.setApiKey(process.env.SENDGRID_API_KEY)
                                const msg = {
                                    to: Email, // Change to your recipient
                                    from: 'StreaQr@gmail.com', // Change to your verified sender
                                    subject: "Registration",
                                    dynamic_template_data: {
                                        "Header": "Hello, you may find below the verficiation code needed to create a StreaQr account",
                                        "Code": `${Code}`
                                    },
                                    template_id: "d-76c43ca25ee14c7db4660f3ab8731132",
                                }
                                sgMail
                                    .send(msg)
                                    .then(() => {
                                        resolve();
                                        res.send("w")
                                    })
                                    .catch((error) => {
                                        return res.status(500).json({ errorMessage: "Something went Wrong" });
                                    })
                            });

                        } else {
                            throw e
                        }
                    }
                }
            } else {  //Confirm code and create account route
                const { Email, password, passwordVerify, Code, uniqueID, Country, RestoData } = req.body;

                if ((Email) && (Code) && (password) && (passwordVerify) && (Country) && (uniqueID) && (RestoData)) {
                    if ((typeof (Email) != "string") || (typeof (password) != "string") || (typeof (passwordVerify) != "string") || (typeof (uniqueID) != "string") || (typeof (Country) != "string")) {
                        return res.status(400).json({ errorMessage: "Please enter all required fields." });
                    } else
                        if ((RestoData.OwnerName == undefined) || (typeof (RestoData.OwnerName) != "string") || (RestoData.Location == undefined) || (typeof (RestoData.Location) != "string") || (RestoData.PhoneNumber == undefined) || (typeof (RestoData.PhoneNumber) != "string")
                            || (RestoData.RestoBranches == undefined) || (typeof (RestoData.RestoBranches) != "number") || (RestoData.Waiters == undefined) || (typeof (RestoData.Waiters) != 'number') || (RestoData.Tables == undefined) || (typeof (RestoData.Tables) != "number")) {
                            return res.status(400).json({ errorMessage: "Please enter all required fields." });
                        } else {
                            if ((RestoData.RestoBranches < 1) || (RestoData.Waiters < 1) || (RestoData.Tables < 1))
                                return res.status(400).json({ errorMessage: "Invalid Format" });

                            if (password.length < 10) {
                                return res.status(400).json({ errorMessage: "Password should be at least 10 characters long" });
                            }

                            if (password !== passwordVerify) {
                                return res.status(400).json({ errorMessage: "Please enter the same password twice" });
                            }


                            const code = Code.toString();
                            if (code == 0) {
                                return res.status(401).json({ errorMessage: "Wrong code" });
                            }
                            await connectToDb();

                            const existingUser = await Resto.findOne({ Email });

                            if (!existingUser) {
                                return res.status(401).json({ errorMessage: "please go back to step 1" });
                            }

                            if (existingUser && !existingUser.Temp) {
                                return res.status(400).json({
                                    errorMessage: "An account with this Email already exists.",
                                });
                            }


                            const passwordCorrect = await bcrypt.compare(
                                code,
                                existingUser.Codehash

                            );

                            if (passwordCorrect !== true) {
                                return res.status(401).json({ errorMessage: "Wrong code" });
                            }

                            const time = new Date();
                            let date = existingUser.CodeDate;
                            date.setMinutes(date.getMinutes() + 30);


                            if (date < time) {
                                return res.status(401).json({ errorMessage: "Expired" });
                            }


                            // validation
                            if ((passwordCorrect === true) && (date > time)) {


                                const salt = await bcrypt.genSalt();
                                const passwordHash = await bcrypt.hash(password, salt);
                                const uniqueIDHash = await bcrypt.hash(uniqueID, salt)


                                existingUser.PasswordHash = passwordHash
                                existingUser.UniqueID = uniqueIDHash
                                existingUser.RestoData = RestoData
                                existingUser.Country = Country
                                existingUser.Codehash = undefined
                                existingUser.CodeDate = undefined
                                existingUser.Temp = undefined

                                const saveData = await existingUser.save();

                                if (saveData.Email) {

                                    const Cookie = GetCookie(existingUser._id)
                                    const date = new Date()

                                    const body = {
                                        "Cookie": Cookie,
                                        "Country": existingUser.Country,
                                        "RestaurantName": existingUser.RestaurantName,
                                        "RestoData": existingUser.RestoData,
                                        "ServerTime": date,
                                        "Subscription": { "Premium": false, "trialUsed": false }
                                    }

                                    res.send(body);
                                }
                                else {
                                    return res.status(500).json({ errorMessage: "Something went Wrong" });
                                }
                            } else {
                                return res.status(500).json({ errorMessage: "Something went Wrong" });
                            }

                        }

                } else if ((Email) && (Code)) {
                    if (typeof (Email) != "string")
                        return res.status(400).json({ errorMessage: "Wrong format" });
                    const code = Code.toString();
                    if (code === 0) {
                        return res.status(401).json({ errorMessage: "This code doesn't exist" });
                    }

                    await connectToDb();

                    const existingUser = await Resto.findOne({ Email });
                    if (existingUser && !existingUser.Temp) {
                        return res.status(400).json({
                            errorMessage: "An account with this email already exists.",
                        });
                    }

                    const passwordCorrect = await bcrypt.compare(
                        code,
                        existingUser.Codehash
                    );

                    if (passwordCorrect !== true)
                        return res.status(401).json({ errorMessage: "Wrong code" });

                    const time = new Date();
                    let date = existingUser.CodeDate;
                    date.setMinutes(date.getMinutes() + 30);


                    if (date < time) {

                        return res
                            .status(400)
                            .json({ errorMessage: "Code has expired" });
                    }
                    if ((passwordCorrect === true) && (date > time)) {
                        return res.send("w");
                    } else {
                        return res.status(500).json({ errorMessage: "Something went Wrong" });
                    }




                } else {
                    return res.status(400).json({ errorMessage: "Invalid Request" });
                }

            }

        } catch (err) {
            console.error(err);
            return res.status(500).json({ errorMessage: "Something went Wrong" });
        }
    } catch {
        return res.status(400).json({ errorMessage: "Rate limit exceeded try again later" });
    }
}


