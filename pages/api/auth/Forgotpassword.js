import rateLimit from "../../../lib/helpers/rate-limiter"
import bcrypt from "bcrypt"
import Resto from '../../../lib/models/RestoModel';
import sgMail from "@sendgrid/mail"
import connectToDb from "../../../lib/db"
const limiter = rateLimit({
    interval: 120 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500, // Max 500 users per second
})
export default async function ForgotPassword(req, res) {
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

            const { Code, Email, passwordVerify, password, uniqueID } = req.body;

            if (!Email)
                return res.status(400).json({ errorMessage: "Please enter all required fields." });
            if (typeof (Email) != "string")
                return res.status(400).json({ errorMessage: "Invalid format" });
            if (Email && !Code && !passwordVerify && !password && !uniqueID) {

                await connectToDb();
                const existingUser = await Resto.findOne({ Email });
                if (!existingUser)
                    return res.status(401).json({ errorMessage: "Email doesn't exist" });

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
                            subject: "Password Reset",
                            dynamic_template_data: {
                                "Header": "Hello, you may find below the code needed to reset your account password",
                                "Code": `${resetNumber}`
                            },
                            template_id: "d-76c43ca25ee14c7db4660f3ab8731132",
                        }
                        sgMail
                            .send(msg)
                            .then(() => {
                                resolve();
                                console.log("POG")
                                res.send("w")
                            })
                            .catch((error) => {
                                return res.status(500).json({ errorMessage: "Something went Wrong" });
                            })

                    });
                }
            }
            else if (Email && Code && !password && !passwordVerify && !uniqueID) {

                await connectToDb();
                const existingUser = await Resto.findOne({ Email });

                if (!existingUser)
                    return res.status(401).json({ errorMessage: "Wrong Email" });


                const code = Code.toString();
                if ((!existingUser.Codehash) || (!existingUser.CodeDate))
                    return res.status(401).json({ errorMessage: "Expired" });
                if (existingUser.Codehash == 0 || "")
                    return res.status(401).json({ errorMessage: "Expired" });
                if (existingUser.CodeDate == "")
                    return res.status(401).json({ errorMessage: "Expired" });


                const passwordCorrect = await bcrypt.compare(
                    code,
                    existingUser.Codehash
                );


                if (!passwordCorrect)
                    return res.status(401).json({ errorMessage: "Wrong code" });


                const gen = new Date();
                gen.setMinutes(gen.getMinutes() - 30);

                const time = gen.toISOString();
                if (existingUser.CodeDate < time) {
                    existingUser.Codehash = ""
                    existingUser.CodeDate = ""
                    await existingUser.save();
                    return res.status(400).json({ errorMessage: "Expired, please request a new password" });

                }
                if (passwordCorrect)
                    res.send("W");
            }
            else if (Email && Code && passwordVerify && password && uniqueID) {
                if ((typeof (passwordVerify) != "string") || (typeof (password) != "string") || (typeof (uniqueID) != "string"))
                    return res.status(400).json({ errorMessage: "Invalid Format", });

                if (password.length < 10)
                    return res.status(400).json({ errorMessage: "Please enter a password of at least 10 characters.", });

                if (password !== passwordVerify)
                    return res.status(400).json({ errorMessage: "Please enter the same password twice.", });
                const code = Code.toString();
                if (code === 0) {

                    return res.status(401).json({ errorMessage: "This code doesn't exist" });
                }

                await connectToDb();
                const existingUser = await Resto.findOne({ Email });
                if (!existingUser)
                    return res.status(401).json({ errorMessage: "Wrong Email" });

                if ((!existingUser.Codehash) || (!existingUser.CodeDate))
                    return res.status(401).json({ errorMessage: "Expired" });
                if (existingUser.Codehash == 0 || "")
                    return res.status(401).json({ errorMessage: "Expired" });
                if (existingUser.CodeDate == "")
                    return res.status(401).json({ errorMessage: "Expired" });


                const passwordCorrect = await bcrypt.compare(
                    code,
                    existingUser.Codehash

                );
                if (!passwordCorrect)
                    return res.status(401).json({ errorMessage: "Wrong code" });

                const isOldPassword = await bcrypt.compare(
                    password,
                    existingUser.PasswordHash
                )

                if (isOldPassword)
                    return res.status(401).json({ errorMessage: "please don't use your old password" });

                const gen = new Date();
                gen.setMinutes(gen.getMinutes() - 30);

                const time = gen.toISOString();



                if (existingUser.CodeDate < time) {
                    existingUser.Codehash = undefined
                    existingUser.CodeDate = undefined
                    await existingUser.save();
                    return res.status(400).json({ errorMessage: "Expired, please request a new password" });
                }
                if (passwordCorrect) {

                    const salt = await bcrypt.genSalt();
                    const salt2 = await bcrypt.genSalt();
                    const passwordHash = await bcrypt.hash(password, salt);
                    const uniqueIDHash = await bcrypt.hash(uniqueID, salt2)
                    existingUser.Codehash = undefined
                    existingUser.CodeDate = undefined
                    existingUser.PasswordHash = passwordHash
                    existingUser.UniqueID = uniqueIDHash
                    const saveData = await existingUser.save();
                    if (saveData.Email) {
                        res.send("W");
                    }
                }
            } else {

                return res.status(400).json({ errorMessage: "Invalid request" });

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
