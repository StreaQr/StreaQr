import PropTypes from 'prop-types';
import SubmitOrder from "./tools/SubmitOrder"
import AccordionItemContainer from "./tools/onlineOrdersList"
import styles from "./tools/onlineorders.module.css"
import { useState, useRef, useEffect } from 'react';
const OnlineOrder = ({ handleCancel, RestaurantName, data, currency }) => {

    const total = useRef()
    const orders = useRef()

    if (total.current == undefined) {
        orders.current = {}
        total.current = 0
    }

    const [step, setStep] = useState(1)

    const handleNext = () => setStep(2)
    const handleBack = () => setStep(1)

    useEffect(() => {
        document.querySelector(".toggleStarsIndex").style.zIndex = 10003
    }, [step]);

    return (
        <>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
            <div className={styles.container} />

            <section className={styles.container2}>
                <div style={{ zIndex: 100000, height: "100%" }}>
                    {(step == 1) ?
                        <AccordionItemContainer orders={orders} data={data} currency={currency} total={total} handleCancel={handleCancel} handleNext={handleNext} />
                        :
                        <SubmitOrder RestaurantName={RestaurantName} handleCancel={handleCancel} orders={orders} handleBack={handleBack} />
                    }
                </div>
            </section>
        </>
    )
}

OnlineOrder.propTypes = {
    handleCancel: PropTypes.func,
    RestaurantName: PropTypes.string,
    data: PropTypes.array,
    currency: PropTypes.string
}

export default OnlineOrder;



