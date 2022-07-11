import connectToDb from "../../../lib/db"
import Resto from "../../../lib/models/RestoModel"

export default async function getRestoCommands(RestaurantName) {
    try {
        await connectToDb()
        const existingResto = await Resto.findOne({ RestaurantName })
        if (!existingResto)
            return false
        else {
            let Subscription = false
            const date = new Date()
            if ((existingResto.Subscription.status == "Premium") && (existingResto.Subscription.expire > date))
                Subscription = true
            if (!Subscription)
                return "NoSubscription"
            else {
                let response = {}
                if (existingResto.RestoOptions != undefined)
                    response[`Options`] = existingResto.RestoOptions
                if ((response.Options.OrderingOnline) && (existingResto.OnlineMenu != undefined))
                    response[`OnlineMenu`] = existingResto.OnlineMenu

                return response
            }
        }

    } catch (err) {
        console.error(err);
        return "NoSubscription"
    }
}
