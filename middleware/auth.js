import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt"
import Resto from "../lib/models/RestoModel"
import connectToDb from "../lib/db";
import { promisify } from 'util';
import GetToken from '../lib/helpers/token';
import rateLimit from "../lib/helpers/rate-limiter"
const limiter = rateLimit({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 10000, // Max 10000 users per second
})
const withProtect = (handler) => {
    return async (req, res) => {
        try {
            await limiter.check(res, 10, 'CACHE_TOKEN')

            try {
                const { token, uniqueID } = req.body;

                if ((!uniqueID) || (!token) || (typeof (uniqueID) != "string") || (typeof (token) != "string"))
                    return res.json(false);

                else {
                    const Token = GetToken(token)
                    if (!Token) return res.json(false);
                    else {
                        const payload = jwt.verify(Token, process.env.JWT_SECRET);
                        const gen = new Date();
                        const time = gen.toISOString();

                        if (payload.date < time)
                            return res.json(false);
                        else {

                            const _id = payload.user
                            await connectToDb();

                            const existingUser = await Resto.findOne({ _id });
                            const uniqueIDCorrect = await bcrypt.compare(
                                uniqueID,
                                existingUser.UniqueID
                            );
                            if (!uniqueIDCorrect)
                                return res.status(401).json({
                                    errorMessage: 'Please log in to get access.',
                                });
                            else {
                                const verified = await promisify(jwt.verify)(
                                    Token,
                                    process.env.JWT_SECRET
                                );
                                let Subscription = false
                                const date = new Date()
                                if ((existingUser.Subscription.status == "Premium") && (existingUser.Subscription.expire > date))
                                    Subscription = true

                                req.Subscription = Subscription
                                req.user = verified.user;
                                req.RestaurantName = existingUser.RestaurantName
                                const { url } = req;
                                if (url == "/api/resto/Subscription")
                                    req.SubscriptionData = existingUser.Subscription
                                if (url == "/api/resto/Waiters")
                                    req.TotalWaiters = existingUser.RestoData.Waiters

                            }
                        }
                    }
                    // Grant access to protected route
                    return handler(req, res);
                }
            } catch (error) {
                console.log(error)
                return res.status(401).json({
                    errorMessage: 'Please log in to get access.',
                });
            }
        }
        catch {
            return res.status(400).json({ errorMessage: "Rate limit exceeded" });
        }
    };

};

export default withProtect;


