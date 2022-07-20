//Next imports
import Head from 'next/head'
import Image from 'next/image'
import PropTypes from 'prop-types';
import Link from "next/link"
import { useEffect } from "react"
//Styles
import styles from '../../../styles/RestoPages.module.css'

// import Swiper core and required modules
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, {
    Navigation, Pagination, EffectCoverflow, A11y
} from 'swiper';

// install Swiper modules
SwiperCore.use([EffectCoverflow, Pagination]);

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards"
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
let deferredPrompt;

const Menu = ({ Data, RestoName, OnlineMenu }) => {

    useEffect(() => {
        if (typeof window !== "undefined") {
            const addBtn = document.querySelector('.popup');
            const PopupSection = document.querySelector(".PopupSection");

            PopupSection.style.opacity = 0;
            addBtn.disabled = true
            window.addEventListener('beforeinstallprompt', (e) => {
                // Prevent Chrome 67 and earlier from automatically showing the prompt
                addBtn.disabled = false
                PopupSection.style.opacity = 100;
                e.preventDefault();
                // Stash the event so it can be triggered later.
                deferredPrompt = e;
                // Update UI to notify the user they can add to home screen
            });
            if (addBtn) {
                addBtn.addEventListener('click', e => {
                    deferredPrompt.prompt()
                    deferredPrompt.userChoice
                        .then(choiceResult => {
                            if (choiceResult.outcome === 'accepted') {
                                PopupSection.style.display = 'none';
                            }
                            deferredPrompt = null
                        })
                })
            }
        }
    }, []);

    const Categories = Object.keys(Data) // place the items in an array to be mapped 
    let item = []
    for (let key in Data) {
        for (let i = 0; i < Data[key].length; i++) {
            if (Data[key][i] == "string")
                item.push(
                    <div className={styles.imageContainer}>
                        <div className={styles.box}>
                            <div className={styles.boxinner}>
                                <Image
                                    src={Data[key][i]}
                                    priority={(index == 0) ? true : false}
                                    alt={`Menu image ${index}`}
                                    width={500}
                                    height={600}
                                />
                            </div>
                        </div>
                    </div>
                )
            else
                item.push(
                    <div className={styles.textSection}>
                        <div style={{ flexDirection: "row", display: 'flex', borderBottomColor: "#b78846", borderWidth: "0 0 0.5px 0", borderStyle: "outset", justifyContent: "space-between", }}>
                            <p className={styles.FoodTitle}>{Data[key][i].Title}</p>
                            <p className={styles.FoodPrice}>{Data[key][i].Price}{Data[key][i].Currency}</p>
                        </div>

                        <p className={styles.FoodDescription}>{Data[key][i].Description}</p>
                    </div>
                )
        }
    }

    return (

        <div className={styles.container}>
            <Head>
                <title>{RestoName} Menu</title>
                <meta name="description" content="StreaQr is embarking on a mission to revolutionize the restaurant industry by providing customers with an all-around flawless service through the use of a new ground-breaking QR code technology combined with an elegantly designed infrastructure." />
                <link rel="icon" href="/StreaQrLogo.ico" />
            </Head>

            <main className={styles.main} >
                <Swiper
                    modules={[Navigation, Pagination, A11y]}
                    navigation
                    style={{ overflow: "visible" }}
                    scrollbar={{ draggable: true }}
                    //onSwiper={ }
                    //onSlideChange={ }
                    effect={'coverflow'} grabCursor={true} centeredSlides={true} slidesPerView={'auto'} coverflowEffect={{
                        "rotate": 50,
                        "stretch": 0,
                        "depth": 100,
                        "modifier": 1,
                        "slideShadows": true
                    }} pagination={{
                        clickable: true,
                    }} className="mySwiper">
                    {Categories.map((CategoryTitle) => (
                        <SwiperSlide key={CategoryTitle}>
                            <p className="headerWrapper">{CategoryTitle}</p>

                            {Data[CategoryTitle].map((data, index) => (
                                (typeof (data) == "string") ?

                                    <div key={index} className={styles.imageContainer}>
                                        <div className={styles.box}>
                                            <div className={`${styles.boxinner}`}>
                                                <Image
                                                    src={data}
                                                    priority={(index == 0) ? true : false}
                                                    alt={`Menu image ${index}`}
                                                    width={500}
                                                    height={600}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <div key={index} className={styles.textSection}>
                                        <div style={{ flexDirection: "row", display: 'flex', borderBottomColor: "#b78846", borderWidth: "0 0 0.5px 0", borderStyle: "outset", justifyContent: "space-between", }}>
                                            <p className={styles.FoodTitle}>{data.Title}</p>
                                            <p className={styles.FoodPrice}>{data.Price}{data.Currency}</p>
                                        </div>
                                        <p className={styles.FoodDescription}>{data.Description}</p>
                                    </div>
                            ))}
                        </SwiperSlide>
                    ))}
                </Swiper>
            </main>
            <section className="PopupSection">
                <div className="popupContainer">
                    <div onClick={() => { const container = document.querySelector('.popupContainer'); container.style.display = 'none'; }} className={styles.closeButton} />
                    <div className="popup">
                        <div className="popup2">
                            <Image
                                src={"/applogotexturenobgsmall.png"}
                                alt="Download Receipt"
                                layout="responsive"
                                width={30}
                                quality={80}
                                height={30}
                            />
                        </div>
                        <p className="popupText">Add to HomeScreen</p>
                    </div>
                </div>
            </section>
            {((Categories.length > 0) && (OnlineMenu)) ?
                <p style={{ color: "#d8a761", flexDirection: 'row', display: 'flex', justifyContent: "center", opacity: 0.7, fontWeight: 'bold', position: 'relative', top: "-10px" }}>or</p>
                :
                null
            }
            {(OnlineMenu) ?
                <div>
                    <Link href={`/resto/${RestoName}/commands#OnlineMenu`} passHref><a style={{ color: "transparent", alignSelf: 'center', flexDirection: 'row', display: "flex", justifyContent: "space-around", width: '100%' }}>
                        <div className={styles.cartContainer}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" style={{ height: 40, width: 37 }} className={styles.cartIcon} viewBox="0 0 16 16"> <path fillRule="evenodd" d="M6.364 13.5a.5.5 0 0 0 .5.5H13.5a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 13.5 1h-10A1.5 1.5 0 0 0 2 2.5v6.636a.5.5 0 1 0 1 0V2.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-.5.5H6.864a.5.5 0 0 0-.5.5z" /> <path fillRule="evenodd" d="M11 5.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793l-8.147 8.146a.5.5 0 0 0 .708.708L10 6.707V10.5a.5.5 0 0 0 1 0v-5z" /> </svg>
                            <p>Online Menu</p>
                            <div></div>
                        </div>
                    </a>
                    </Link>
                </div>
                :
                null
            }
        </div >
    );
}


Menu.propTypes = {
    Data: PropTypes.object,
    RestoName: PropTypes.string,
    OnlineMenu: PropTypes.bool
}


import getRestoMenu from "../../../components/utils/getRestoMenu/get"

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export async function getStaticProps(context) {
    const { params } = context
    const Data = await getRestoMenu(params.pid)
    console.log(`Generating page ${params.pid}`)
    if (Data)
        return {
            props: {
                Data: Data.Menu,
                OnlineMenu: Data.OnlineMenu,
                RestoName: params.pid,
            },
            revalidate: 21600, // Next page regeneration (seconds)
        }
    else
        return {
            notFound: true
        }
}


// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// the path has not been generated.
export async function getStaticPaths() {
    // We'll pre-render only these paths at build time.
    //        paths: [{ params: { pid: 'palms' } }], fallback: 'blocking'
    return {
        paths: [{ params: { pid: 'd' } }], fallback: 'blocking'
    }
}



export default Menu;


