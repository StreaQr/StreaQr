import { useState, useEffect } from "react";
import footerStyle from "./onlineOrderFooter.module.css"
import styles from "./onlineOrderSubmit.module.css"
import axios from "axios"
export default function AccordionItemContainer({ orders, handleBack, RestaurantName, handleCancel }) {

    const [states, setStates] = useState({
        "Loading": false,
        "Total": 0,
        "Notes": " "
    })
    const totalHeader = document.getElementById("total");

    let keys = Object.keys(orders.current)
    let initialTotal = 0
    let items = []

    function handlePlus(item) {
        orders.current[item].quantity += 1
        setStates({
            ...states,
            Total: states.Total + orders.current[item].price
        })
    }

    function handleMinus(item) {
        if (orders.current[item].quantity > 0) {
            orders.current[item].quantity -= 1
            setStates({
                ...states,
                Total: states.Total - orders.current[item].price
            })
        }
    }

    for (let item of keys) {
        initialTotal += orders.current[item].quantity * orders.current[item].price
        const itemData = item.split("//");
        items.push(
            <ul key={itemData[0]} className={styles.orderItem}>
                <li>
                    <ul className={styles.headerAndPrice}>
                        <p>{itemData[0]}</p>
                        <p>{itemData[2]} $</p>
                    </ul>
                </li>
                <ul className={styles.accordion__contentchild}>
                    <button onClick={() => handleMinus(item)} className={"fa fa-minus"}></button>
                    {orders.current[item].quantity}
                    <button onClick={() => handlePlus(item)} className={"fa fa-plus"}></button>
                </ul>
            </ul>
        )
    }

    useEffect(() => {
        setStates({
            ...states,
            Total: initialTotal
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialTotal, totalHeader])

    const handleSubmit = async () => {
        if (states.Total > 0) {
            try {
                setStates({
                    ...states,
                    "Loading": true
                })
                const config = {
                    headers: { 'X-Auth-Token': process.env.NEXT_PUBLIC_X_AUTH_TOKEN }
                };
                let ordersList = {}
                for (let item of keys) {
                    const titleOnly = item.split("//")
                    ordersList[`${titleOnly[0]}_${titleOnly[2]}`] = orders.current[item].quantity
                }

                let body = {
                    RestaurantName,
                    action: "orderOnline",
                    "orders": { "items": ordersList, }

                }

                if (states.Notes != "")
                    body.orders.Notes = states.Notes

                const req = await axios.post("/api/users/get", body, config);
                const clientSecret = await req.data;

                if (clientSecret == "w") {
                    setStates({
                        ...states,
                        "Loading": false
                    })
                    document.querySelector(".toggleStarsIndex").style.zIndex = 0;
                    handleCancel("Success")
                }

            } catch (error) {
                setStates({
                    ...states,
                    "Loading": false
                })
                if (error.response.data.errorMessage) {
                    handleCancel(error.response.data.errorMessage)
                } else
                    handleCancel("Something went wrong")
            }
        }
    }

    const PreviousScreen = () => {
        if (!states.Loading) {
            document.querySelector(".toggleStarsIndex").style.zIndex = 0;
            handleBack()
        }
    }

    return (
        <>
            <header className={styles.header}>
                <nav>
                    <button onClick={() => PreviousScreen()}>
                        <i className="fa fa-chevron-left" style={{ color: "#d8a761", fontSize: "20px", padding: "5px 9px 5px 6px", borderRadius: "50%", }} aria-hidden="true"></i>
                    </button>
                    <div style={{ flexDirection: "row", height: "72%", right: "2%", position: "relative", display: 'flex', width: '100%', alignSelf: "flex-end", justifyContent: "center" }}>
                        Confirmation
                    </div>
                </nav>
            </header>

            <section className={styles.OrderContainer}>
                <p>Your Order<i className="fa fa-cutlery" aria-hidden="true"></i></p>
                <div className={styles.scrollContainer}>
                    {items}
                </div>
            </section>
            <section className={styles.NotesContainer}>
                <p>Notes<i className="fa fa-commenting" aria-hidden="true"></i></p>
                <input placeholder="eg no pickles" value={states.Notes} onChange={(e) => setStates({ ...states, "Notes": e.target.value })} />
            </section>

            <footer className={footerStyle.footer} style={{ boxShadow: "#d8a761 0 0 5px" }}>
                <div style={{ flexDirection: 'row', display: 'flex', alignSelf: 'flex-end' }}>
                    <p>Total:</p>
                    <p id="total">{states.Total} $</p>
                </div>
                <button className={(states.Loading) ? styles.buttonLoading : ""} disabled={states.Loading} onClick={() => handleSubmit()}>{(states.Loading) ? "" : "Order"}</button>
            </footer>
        </>
    )
}
