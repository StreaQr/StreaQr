import { useState, useRef, useEffect } from "react"
import PropTypes from 'prop-types';
import styles from "./Button.module.css"
import cookie from "cookie";
import axios from "axios"
import SpinnerLoader from "./SpinnerLoader";
const RateModal = ({ handleCancel, RestaurantName, Data }) => {

    const [states, setStates] = useState({
        "stars": 0,
        "spinner": false,
        "step": 1
    })
    const inputValue = useRef()

    useEffect(() => {
        let Cookies = cookie.parse(document.cookie)
        if (Cookies.userName)
            inputValue.current.value = Cookies.userName
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function submit() {
        if (states.step != 3) {
            if (states.step == 1) {
                if (inputValue.current.value != "") {
                    setStates({ ...states, "UserName": inputValue.current.value, "step": states.step + 1 })
                }
            } else
                setStates({ ...states, "step": states.step + 1 })
        } else {
            try {
                setStates({ ...states, "spinner": true })
                const config = {
                    headers: { 'X-Auth-Token': process.env.X_AUTH_TOKEN }
                };

                const body = {
                    RestaurantName,
                    action: "Rating",
                    Rating: states.stars,
                    userName: states.UserName,
                    feedBack: inputValue.current.value
                }

                const req = await axios.post("/api/users/get", body, config);
                const clientSecret = await req.data;

                if (clientSecret == "w") {
                    const CookieDate = new Date;
                    CookieDate.setFullYear(CookieDate.getFullYear() + 1);
                    document.cookie = 'userName=alain; expires=' + CookieDate.toUTCString() + ';';
                    setStates({ ...states, "spinner": false })
                    handleCancel("SuccessFeedback")
                }

            } catch (error) {
                setStates({ ...states, "spinner": false })
                if (error.response.data.errorMessage) {
                    handleCancel(error.response.data.errorMessage)
                } else
                    handleCancel("Something went wrong")
            }
        }
    }
    const focusedStar = (<svg xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 60, color: "#d8a761" }} fill="currentColor" viewBox="0 0 16 16"> <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" /> </svg>)
    const unFocusedStar = (<svg xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 60, color: "#d8a66133" }} fill="currentColor" viewBox="0 0 16 16"> <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" /> </svg>)
    return (
        <>
            <div onClick={() => handleCancel()} className={styles.backGround}></div>
            <section className={styles.popupBackground}>
                {(!states.spinner) ?
                    <div className={styles.popupCard}>
                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                            <p className={styles.cardTitle}>Rating</p>
                            <button onClick={() => handleCancel()} className={styles.escape} />
                        </div>
                        <div style={{ height: "30%", flexDirection: "row", display: "flex", justifyContent: (states.step == 1) ? "unset" : "center" }}>
                            {(states.step == 1) ?
                                <div style={{ alignSelf: 'center', }}>
                                    <form onSubmit={(event) => { event.preventDefault(); submit() }}>
                                        <i className={styles.userNameIcon} style={{ alignSelf: 'center' }} ><svg style={{ color: "#d8a761", width: 30, height: 30 }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"> <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /> </svg></i>
                                        <input placeholder="UserName" type="text" ref={inputValue} className={styles.userNameInput} />
                                    </form>
                                </div>
                                : (states.step == 2) ?
                                    <div style={{ display: "flex", position: "relative", top: 7 }}>
                                        {(states.stars >= 1) ?
                                            <p onClick={() => setStates({ ...states, "stars": 1 })} className={styles.starFocused}>{focusedStar}</p> :
                                            <p onClick={() => setStates({ ...states, "stars": 1 })} className={styles.starUnfocused}>{unFocusedStar}</p>
                                        }
                                        {(states.stars >= 2) ?
                                            <p onClick={() => setStates({ ...states, "stars": 2 })} className={styles.starFocused}>{focusedStar}</p> :
                                            <p onClick={() => setStates({ ...states, "stars": 2 })} className={styles.starUnfocused}>{unFocusedStar}</p>
                                        }
                                        {(states.stars >= 3) ?
                                            <p onClick={() => setStates({ ...states, "stars": 3 })} className={styles.starFocused}>{focusedStar}</p> :
                                            <p onClick={() => setStates({ ...states, "stars": 3 })} className={styles.starUnfocused}>{unFocusedStar}</p>
                                        }
                                        {(states.stars >= 4) ?
                                            <p onClick={() => setStates({ ...states, "stars": 4 })} className={styles.starFocused}>{focusedStar}</p> :
                                            <p onClick={() => setStates({ ...states, "stars": 4 })} className={styles.starUnfocused}>{unFocusedStar}</p>
                                        }
                                        {(states.stars >= 5) ?
                                            <p onClick={() => setStates({ ...states, "stars": 5 })} className={styles.starFocused}>{focusedStar}</p> :
                                            <p onClick={() => setStates({ ...states, "stars": 5 })} className={styles.starUnfocused}>{unFocusedStar}</p>
                                        }
                                    </div>
                                    :
                                    <div style={{ alignSelf: 'center', width: "100%" }}>
                                        <form onSubmit={(event) => { event.preventDefault(); submit() }}>
                                            <input maxLength={100} placeholder="FeedBack (optional)" type="text" ref={inputValue} className={styles.feedBackInput} />
                                        </form>
                                    </div>
                            }
                        </div>
                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                            <button onClick={() => handleCancel()} className={styles.popupCancelButton}>
                                <p className={styles.popupCancelButtonText}>Cancel</p>
                            </button>
                            <button onClick={() => submit()} disabled={!Data} style={{ opacity: (Data) ? 1 : 0.5, border: "none", width: "unset" }} className={styles.popupButton}>
                                <p className={styles.popupButtonText}>{(states.step != 3) ? "Next" : "Submit"}</p>
                            </button>
                        </div>
                    </div>
                    :
                    <SpinnerLoader />
                }
            </section>
        </>
    )
}

RateModal.propTypes = {
    handleCancel: PropTypes.func,
    RestaurantName: PropTypes.string,
    Data: PropTypes.bool
}

export default RateModal;