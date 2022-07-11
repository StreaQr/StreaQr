import { useState } from "react";
import styles from "./onlineorders.module.css"
import footerStyle from "./onlineOrderFooter.module.css"
export default function AccordionItemContainer({ data, orders, currency, total, handleCancel, handleNext }) {
    function AccordionItem({ items }) {
        const [visibility, setVisibilty] = useState(false)
        const totalHeader = document.getElementById("total");
        const activeStatus = visibility ? styles.active : ''

        function handleToggleVisibility() {
            setVisibilty(!visibility)
        }

        function Item2({ Item, activeStatus }) {
            const [visibility2, setVisibilty2] = useState(false)
            const [number, setNumber] = useState(0)

            if ((number == 0) && (orders.current[`${Item}`] != undefined) && (orders.current[`${Item}`].quantity != undefined) && (orders.current[`${Item}`].quantity != 0)) {
                setNumber(orders.current[`${Item}`].quantity)
            }

            function handleToggleVisibility2() {
                setVisibilty2(!visibility2)
            }

            if (activeStatus != "") {
                const activeStatus2 = visibility2 ? styles.active : ''
                const Item_Description_Price = Item.split("//")

                function handleChange(state) {
                    if (state == "minus") {
                        if (number > 0) {
                            setNumber(current => current - 1)
                            total.current -= parseInt(Item_Description_Price[2])
                            totalHeader.textContent = `${total.current} $`
                            orders.current[`${Item}`] = { "quantity": number - 1, "price": parseInt(Item_Description_Price[2]) }
                        }
                    } else {
                        setNumber(current => current + 1)
                        total.current += parseInt(Item_Description_Price[2])
                        totalHeader.textContent = `${total.current} $`
                        orders.current[`${Item}`] = { "quantity": number + 1, "price": parseInt(Item_Description_Price[2]) }
                    }
                }

                return (
                    <>
                        <button className={styles.accordion__buttonChild} onClick={() => handleToggleVisibility2()}>
                            <div className={styles.arrow} style={{ flexDirection: 'row', display: "flex" }}><span className={visibility2 ? 'fa fa-chevron-down' : 'fa fa-chevron-right'}></span>{Item_Description_Price[0]}</div> <p className={styles.price}>{currency} {Item_Description_Price[2]}</p>
                        </button>
                        <div className={`${styles.accordion__contentchild} ${activeStatus2}`}>
                            <p>{Item_Description_Price[1]}</p>
                            <div>
                                <button onClick={() => handleChange("minus")} className={"fa fa-minus"}></button>
                                {number}
                                <button onClick={() => handleChange("plus")} className={"fa fa-plus"}></button>
                            </div>
                        </div>
                    </>
                );
            }
            else
                return <div />
        }
        return (
            <>
                <button className={styles.accordion__button} onClick={() => handleToggleVisibility()}>{items.label}<span className={visibility ? 'fa fa-minus' : 'fa fa-plus'}></span></button>
                <div className={`${styles.accordion__content} ${activeStatus}`}>
                    {items.items.map((Item) => <Item2 key={Item} Item={Item} activeStatus={activeStatus} />)}
                </div>
            </>

        );
    }

    const [queryText, setQueryText] = useState("");

    let items = data
    let filteredApts = data;
    let filteredApts2
    filteredApts = filteredApts.sort((a, b) => {
    }).filter(eachItem => {
        filteredApts2 = eachItem.items
        let available = false
        filteredApts2 = filteredApts2.sort((a, b) => {
        }).filter(underArray => {
            if (underArray.toLowerCase().includes(queryText.toLowerCase())) {
                available = eachItem
            }

            return (
                underArray
                    .toLowerCase()
                    .includes(queryText.toLowerCase())
            )
        });
        return (
            eachItem["label"]
                .toLowerCase()
                .includes(queryText.toLowerCase()) ||

            available
        )
    });
    items = filteredApts

    return (
        <>
            <header className={styles.header}>
                <nav>
                    <button onClick={() => { document.querySelector(".toggleStarsIndex").style.zIndex = 0; handleCancel() }}>
                        <i className="fa fa-chevron-left" style={{ color: "#d8a761", fontSize: "20px", padding: "5px 9px 5px 6px", borderRadius: "50%", }} aria-hidden="true"></i>
                    </button>
                    <div style={{ flexDirection: "row", height: "60%", display: 'flex', width: '92%', alignSelf: "center", justifyContent: "center" }}>
                        <input className={styles.search__input} onChange={(e) => setQueryText(e.target.value)} type="text" placeholder="Search" />
                        <div style={{ alignSelf: "flex-end", left: "5%", position: "relative" }}>
                            <i className="fa fa-search" style={{ color: "#d8a761", fontSize: "20px" }} aria-hidden="true"></i>
                        </div>
                    </div>
                </nav>
            </header>
            <div className={styles.accordion}>
                {items.map((items) => <AccordionItem key={items.label} items={items} />)}
            </div>
            <footer className={footerStyle.footer}>
                <div style={{ flexDirection: 'row', display: 'flex', alignSelf: 'flex-end' }}>
                    <p>Total:</p>
                    <p id="total">0 $</p>
                </div>
                <button onClick={() => (Object.keys(orders.current).length > 0) ? handleNext() : null}>
                    Next
                </button>
            </footer>
        </>
    )
}
