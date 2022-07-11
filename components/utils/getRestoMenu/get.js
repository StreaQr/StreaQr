import connectToDb from "../../../lib/db"
import Resto from "../../../lib/models/RestoModel"

export default async function getRestoMenu(RestaurantName) {
    try {
        await connectToDb()
        const existingResto = await Resto.findOne({ RestaurantName })
        if (!existingResto)
            return false
        else {
            if (existingResto.Menu != undefined) {
                if (Object.keys(existingResto.Menu).length == 0) {
                    if ((existingResto.OnlineMenu != undefined) && (existingResto.RestoOptions != undefined) && (existingResto.RestoOptions.OrderingOnline) && (existingResto.OnlineMenu.items != undefined) && (existingResto.OnlineMenu.items.length > 0)) {
                        return { "Menu": {}, "OnlineMenu": true }
                    } else
                        return { "Menu": {}, "OnlineMenu": false }
                } else {
                    if ((existingResto.OnlineMenu != undefined) && (existingResto.RestoOptions != undefined) && (existingResto.RestoOptions.OrderingOnline) && (existingResto.OnlineMenu.items != undefined) && (existingResto.OnlineMenu.items.length > 0)) {
                        return { "Menu": existingResto.Menu, "OnlineMenu": true }
                    } else
                        return { "Menu": existingResto.Menu, "OnlineMenu": false }
                }
            }
            else {
                if ((existingResto.OnlineMenu != undefined) && (existingResto.RestoOptions != undefined) && (existingResto.RestoOptions.OrderingOnline) && (existingResto.OnlineMenu.items != undefined) && (existingResto.OnlineMenu.items.length > 0)) {
                    return { "Menu": {}, "OnlineMenu": true }
                } else
                    return { "Menu": {}, "OnlineMenu": false }
            }
        }
    } catch (err) {
        console.error(err);
        return false
    }
}