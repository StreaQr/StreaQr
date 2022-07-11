import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'
import dynamic from "next/dynamic";
import Link from "next/link"
dynamic(import('aos/dist/aos.css'));

export default function Home() {
  const [selected, setSelected] = useState("OnlineOrder")
  const [popUp, setPopUp] = useState(false)
  useEffect(() => {
    var lazyVideos = [].slice.call(document.querySelectorAll("video.lazy"));
    if ("IntersectionObserver" in window) {
      var lazyVideoObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (video) {
          if (video.isIntersecting) {
            for (var source in video.target.children) {
              var videoSource = video.target.children[source];
              if (typeof videoSource.tagName === "string" && videoSource.tagName === "SOURCE") {
                videoSource.src = videoSource.dataset.src;
              }
            }

            video.target.load();
            video.target.classList.remove("lazy");
            lazyVideoObserver.unobserve(video.target);
          }
        });
      });

      lazyVideos.forEach(function (lazyVideo) {
        lazyVideoObserver.observe(lazyVideo);
      });
    }

    // if cookie is present display a popup link to the restaurant the user last used
    const cookieCheker = async () => {
      const cookie = (await import('cookie'))
      let TempCookie = cookie.parse(document.cookie)
      console.log(TempCookie.Resto)
      if (TempCookie.Resto) {
        setPopUp(TempCookie.Resto)
      }
    }

    const fetch = async () => {
      const AOS = (await import('aos'))
      AOS.init({
        duration: 2000
      })
    }
    fetch()
    cookieCheker()
  }, []);

  const Animation = ({ file }) => {
    const ref = useRef(null);
    const [lottie, setLottie] = useState(null);
    useEffect(() => {
      import('lottie-web').then((Lottie) => setLottie(Lottie.default));
    }, []);
    useEffect(() => {
      if (lottie && ref.current) {
        const animation = lottie.loadAnimation({
          container: ref.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          // path to your animation file, place it inside public folder
          path: `/static/${file}`,
        });

        return () => animation.destroy();
      }
    }, [file, lottie]);
    return (
      <div ref={ref} />
    );
  };

  return (
    <>
      <div className={styles.container}>

        <Head>
          <title>StreaQr | Home</title>
          <meta name="description" content="StreaQr is embarking on a mission to revolutionize the restaurant industry by providing customers with an all-around flawless service through the use of a new ground-breaking QR code technology combined with an elegantly designed infrastructure." />
          <meta property="og:title" content="StreaQr website" />
          <meta property="og:url" content="https://streaqr.com" />
          <meta property="og:type" content="website" />
          <link rel="icon" href="/StreaQrLogo.ico" />
        </Head>
        <div style={{ position: 'absolute' }}>
          <div id='stars'></div>
          <div id="stars3"></div>
          <div id="stars4"></div>
        </div>
        {(popUp != false) ?
          <div className={styles.popUpContainer}>
            <Link href={`/resto/${popUp}/menu`} passHref><a style={{ alignSelf: 'center' }}>   <div className={styles.animatePopUp} style={{ display: 'flex', position: 'relative', left: 20, flexDirection: 'row', justifyContent: "center", alignSelf: "center" }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" style={{ height: 30, alignSelf: "center", width: 27, color: "#d8a761" }} viewBox="0 0 16 16"> <path fillRule="evenodd" d="M6.364 13.5a.5.5 0 0 0 .5.5H13.5a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 13.5 1h-10A1.5 1.5 0 0 0 2 2.5v6.636a.5.5 0 1 0 1 0V2.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-.5.5H6.864a.5.5 0 0 0-.5.5z" /> <path fillRule="evenodd" d="M11 5.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793l-8.147 8.146a.5.5 0 0 0 .708.708L10 6.707V10.5a.5.5 0 0 0 1 0v-5z" /> </svg>
              <p className={styles.popUpText} >Go Back to {popUp}</p>
            </div></a></Link>


            <div onClick={() => setPopUp(false)} className={styles.closeButton}></div>
          </div>
          :
          null
        }
        <main className={styles.main}>
          <section className={styles.firstSectionAlignment}>
            <div style={{ width: "50%", height: "100%", alignSelf: "center", display: "flex", flexDirection: "column", justifyContent: "center", }} className={`${styles.header} ${styles.section1Animation}`}>
              <div className={styles.alignText}>
                <div className={styles.Title}>Revolutionizing <p style={{ color: "white", textDecoration: "underline", textUnderlineOffset: "5px", textDecorationThickness: "1px", textDecorationColor: "#d8a661de" }}>Qr Codes<svg className={styles.animateQrCode} style={{ color: '#e9b772de', marginLeft: 10, position: "relative", top: 5, height: 40, width: 40, position: 'relative', top: -1, }} xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect fill='#d8a761' x="336" y="336" width="80" height="80" rx="8" ry="8"></rect><rect fill='#d8a761' x="272" y="272" width="64" height="64" rx="8" ry="8"></rect><rect fill='#d8a761' x="416" y="416" width="64" height="64" rx="8" ry="8"></rect><rect fill='#d8a761' x="432" y="272" width="48" height="48" rx="8" ry="8"></rect><rect fill='#d8a761' x="272" y="432" width="48" height="48" rx="8" ry="8"></rect><rect fill='#d8a761' x="336" y="96" width="80" height="80" rx="8" ry="8"></rect><rect x="288" y="48" width="176" height="176" rx="16" ry="16" style={{ fill: "none", stroke: "#d8a761", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "32px" }}></rect><rect fill='#d8a761' x="96" y="96" width="80" height="80" rx="8" ry="8"></rect><rect x="48" y="48" width="176" height="176" rx="16" ry="16" style={{ fill: "none", stroke: "#d8a761", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "32px" }}></rect><rect fill='#d8a761' x="96" y="336" width="80" height="80" rx="8" ry="8"></rect><rect x="48" y="288" width="176" height="176" rx="16" ry="16" style={{ fill: "none", stroke: "#d8a761", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "32px" }}></rect></svg>
                </p></div>
                <div style={{ borderBottomColor: "#d8a6616d", borderBottomWidth: 2, borderBottomStyle: "dashed", }}>
                  <p className={styles.moto}>Dominate the competition by automating your restaurant</p>
                </div>
                <div style={{ paddingTop: 20, maxHeight: 58, maxWidth: 384 }}>
                  <Image
                    src={"/App-Download-Buttons-min.webp"}
                    alt={`Download buttons`}
                    width={384}
                    height={58}
                  />
                </div>
              </div>
            </div>
            <video className={`${styles.section1Animation} lazy`} autoPlay loop muted playsInline style={{ height: "auto", alignSelf: 'center', maxHeight: "740px", width: "45vw", maxWidth: "412pxp", display: "block", margin: "0px", }} poster='poster.webp'  >
              <source data-src="animatedvideo.mov" type="video/mov" />
              <source data-src="animatedVideo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </section>
          <section style={{ height: 101, position: "relative", backgroundColor: "rgba(0,0,0,0.9)", borderBottom: "1px solid #e9b772de", width: '100%', display: 'flex', flexDirection: "row", justifyContent: "center" }}>
            <div className={styles.animateIt} style={{ flexDirection: 'row', display: 'flex' }} >
              <p className={styles.animatedText}>Online Ordering</p>
              <p className={styles.animatedText}>Digital Receipts</p>
              <p className={styles.animatedText}>Waiter Accounts</p>
              <p className={styles.animatedText}>Digital Menu</p>
              <p className={styles.animatedText}>Waiter Ratings</p>
              <p className={styles.animatedText}>Dynamic QrCodes</p>
            </div>
          </section>
          <section className={styles.section2} id="about" >
            <p className={styles.section2Title}>About</p>
            <div className={styles.section2Container} style={{ paddingBottom: 10 }} >
              <div data-aos="fade-right" data-aos-offset="-20" data-aos-duration="1000" data-aos-delay="200" data-aos-once="true" className={styles.section2Letter}>
                <div className={styles.letterContent}>
                  <p className={styles.letterheader}>What is StreaQr</p>
                  <p className={styles.subHeader}>StreaQr is a company which roots are found in Lebanon, seeking to set new standards to your fine establishment(s). </p>
                  <p className={styles.letterheader} style={{ paddingTop: 10, }}>Our Goal</p>
                  <p className={styles.subHeader}>-Our main vision is to revolutionize the restaurant industry while reducing its carbon foot print. <br /> -We{"'"}re currently aiming to reach over a hundred restaurants with our system implemented in them by the end of the year<br /> </p>
                  <p className={styles.letterheader}>Ease of use</p>
                  <p className={styles.subHeader}>Indisputably capable of upgrading the quality of your service, StreaQr{"'"}s automated system is user friendly for both staff and customers</p>
                </div>
                <p className={styles.signed}>CEO Alain Arja</p>
              </div>
              <div data-aos="fade" data-aos-offset="-20" data-aos-duration="1000" data-aos-delay="200" data-aos-once="true" className={styles.qrCodeContainer} >
                <Image
                  src={"/scanningQrCode.png"}
                  alt={`Download buttons`}
                  width={310}
                  height={319}
                />
              </div>
            </div>
          </section>
          <section className={styles.section3} >
            <div className={styles.section3HeadersContainer}>
              <p className={styles.section3Title}>Features</p>
              <div className={styles.featuresList}>
                <div className={styles.featureContainer} onClick={() => setSelected("OnlineOrder")} >
                  <div style={{ flexDirection: "column", display: "flex" }}>
                    <p className={styles.featureTitle}>Online Ordering <svg style={{ color: "white", height: 25, width: 25, position: 'relative', top: -4 }} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"> <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1.646-7.646-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L8 8.293l2.646-2.647a.5.5 0 0 1 .708.708z"></path> </svg></p>
                    <div style={{ flexDirection: 'row', display: "flex" }}>
                      <p className={`${styles.underHeader} ${(selected == "OnlineOrder") ? styles.border : null}`}>StreaQr in resto online ordering solution</p>
                    </div>
                  </div>
                  <i className={`fa fa-chevron-right ${styles.arrow}`} aria-hidden="true"></i>
                </div>
                <div className={styles.featureContainer} onClick={() => setSelected("DigitalReceipts")} style={{}} >
                  <div style={{ flexDirection: "column", display: "flex" }}>
                    <p className={styles.featureTitle}>Digital Receipts <svg style={{ color: "white", height: 25, width: 25, position: 'relative', top: -4, left: 2 }} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"> <path d="M3 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zM11.5 4a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1zm0 2a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1zm0 2a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1zm0 2a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1zm0 2a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z"></path> <path d="M2.354.646a.5.5 0 0 0-.801.13l-.5 1A.5.5 0 0 0 1 2v13H.5a.5.5 0 0 0 0 1h15a.5.5 0 0 0 0-1H15V2a.5.5 0 0 0-.053-.224l-.5-1a.5.5 0 0 0-.8-.13L13 1.293l-.646-.647a.5.5 0 0 0-.708 0L11 1.293l-.646-.647a.5.5 0 0 0-.708 0L9 1.293 8.354.646a.5.5 0 0 0-.708 0L7 1.293 6.354.646a.5.5 0 0 0-.708 0L5 1.293 4.354.646a.5.5 0 0 0-.708 0L3 1.293 2.354.646zm-.217 1.198.51.51a.5.5 0 0 0 .707 0L4 1.707l.646.647a.5.5 0 0 0 .708 0L6 1.707l.646.647a.5.5 0 0 0 .708 0L8 1.707l.646.647a.5.5 0 0 0 .708 0L10 1.707l.646.647a.5.5 0 0 0 .708 0L12 1.707l.646.647a.5.5 0 0 0 .708 0l.509-.51.137.274V15H2V2.118l.137-.274z"></path> </svg></p>
                    <div style={{ flexDirection: 'row', display: "flex" }}>
                      <p className={`${styles.underHeader} ${(selected == "DigitalReceipts") ? styles.border : null}`}>StreaQr automatically generates receipts </p>
                    </div>
                  </div>
                  <i className={`fa fa-chevron-right ${styles.arrow}`} aria-hidden="true"></i>
                </div>
                <div className={styles.featureContainer} onClick={() => setSelected("Waiters")} style={{}} >
                  <div style={{ flexDirection: "column", display: "flex" }}>
                    <p className={styles.featureTitle}>Waiters Shifts <svg style={{ color: "white", height: 25, width: 25, position: 'relative', top: -4, left: 2 }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"> <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"></path> <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"></path> </svg></p>
                    <div style={{ flexDirection: 'row', display: "flex" }}>
                      <p className={`${styles.underHeader} ${(selected == "Waiters") ? styles.border : null}`}>Tracks and manages all your staff{"'"}s shifts</p>
                    </div>
                  </div>
                  <i className={`fa fa-chevron-right ${styles.arrow}`} aria-hidden="true"></i>
                </div>

                <div className={styles.featureContainer} onClick={() => setSelected("QrCodes")} style={{}} >
                  <div style={{ flexDirection: "column", display: "flex" }}>
                    <p className={styles.featureTitle}>Qr Codes <svg style={{ color: "white", height: 25, width: 25, position: 'relative', top: -4, left: 2 }} xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect fill='white' x="336" y="336" width="80" height="80" rx="8" ry="8"></rect><rect fill='white' x="272" y="272" width="64" height="64" rx="8" ry="8"></rect><rect fill='white' x="416" y="416" width="64" height="64" rx="8" ry="8"></rect><rect fill='white' x="432" y="272" width="48" height="48" rx="8" ry="8"></rect><rect fill='white' x="272" y="432" width="48" height="48" rx="8" ry="8"></rect><rect fill='white' x="336" y="96" width="80" height="80" rx="8" ry="8"></rect><rect x="288" y="48" width="176" height="176" rx="16" ry="16" style={{ fill: "none", stroke: "white", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "32px" }}></rect><rect fill='white' x="96" y="96" width="80" height="80" rx="8" ry="8"></rect><rect x="48" y="48" width="176" height="176" rx="16" ry="16" style={{ fill: "none", stroke: "white", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "32px" }}></rect><rect fill='white' x="96" y="336" width="80" height="80" rx="8" ry="8"></rect><rect x="48" y="288" width="176" height="176" rx="16" ry="16" style={{ fill: "none", stroke: "white", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "32px" }}></rect></svg></p>
                    <div style={{ flexDirection: 'row', display: "flex" }}>
                      <p className={`${styles.underHeader} ${styles.lastChildUnderHeader} ${(selected == "QrCodes") ? styles.border : null}`}>Generates advanced, custom Qr Codes</p>
                    </div>
                  </div>
                  <i className={`fa fa-chevron-right ${styles.arrow}`} aria-hidden="true"></i>
                </div>
              </div>
            </div>
            <div data-aos="zoom-in" data-aos-offset="-50" data-aos-duration="1000" data-aos-delay="200" data-aos-once="true" className={styles.contentContainer}>
              {(selected == "Waiters") ?
                <div className={styles.section3ContentContainer} >
                  <p className={styles.section3ImageTitle}>Waiters Accounts</p>
                  <p className={styles.section3ImageDescription}>- Manage and track shifts</p>
                  <p className={styles.section3ImageDescription}>- Check customer{"'"}s feedback regarding each waiter{"'"}s performance</p>
                  <div style={{ width: "80%", maxWidth: 500, alignSelf: 'center' }}>
                    <Image
                      src={"/StreaQr Waiters Shift2s.png"}
                      alt={`StreaQr Waiters Shifts`}
                      width={500}
                      loading="lazy"
                      height={222}
                    />
                  </div>
                </div>
                : (selected == "QrCodes") ?
                  <div>
                    <div className={styles.section3ContentContainer} >
                      <p className={styles.section3ImageTitle}>Qr Codes</p>
                      <p className={styles.section3ImageDescription}>- Generates Qr Codes that can be scanned and instantly used by your customers</p>
                      <p className={styles.section3ImageDescription}>- StreaQr offers you the ability to customise generated Qr Codes</p>
                      <div style={{ width: "90%", maxWidth: 543, alignSelf: 'center' }}>
                        <Image
                          src={"/QrCode.png"}
                          alt={`Qr Codes`}
                          loading="lazy"
                          width={409}
                          height={171}
                        />
                      </div>
                    </div>
                  </div>
                  : (selected == "DigitalReceipts") ?
                    <div>
                      <div>
                        <div className={styles.section3ContentContainer} >
                          <p className={styles.section3ImageTitle}>Online Bills</p>
                          <p className={styles.section3ImageDescription}>- Save money by switching to digital bills</p>
                          <p className={styles.section3ImageDescription}>- Bills are automatically filled and sent to your customers</p>
                          <div style={{ width: "60%", maxWidth: 280, alignSelf: 'center' }}>
                            <Image
                              src={"/receipt.png"}
                              alt={`Bill`}
                              loading="lazy"
                              width={409}
                              height={400}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    :
                    (selected == "OnlineOrder") ?
                      <div>
                        <div>
                          <div>
                            <div className={styles.section3ContentContainer} >
                              <p className={styles.section3ImageTitle}>Digital Menu</p>
                              <p className={styles.section3ImageDescription}>Orders can be directly placed on our website <br />and will be assigned to a specific waiter via our notification system</p>
                              <div style={{ width: "80%", maxWidth: 400, display: "flex", justifyContent: 'center', alignSelf: 'center' }}>
                                <Animation file={"digitalMenu.json"} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      :
                      null
              }
            </div>
          </section>
          <section className={styles.section4}>
            <p className={styles.section4Header}>What{"'"}s in it for your customer?</p>
            <div className={styles.cardContainer}>
              <div data-aos="fade-up" data-aos-offset="-50" data-aos-duration="1000" data-aos-delay="250" data-aos-once="true" className={styles.sectionBoxContainer}>
                <svg xmlns="http://www.w3.org/2000/svg" style={{ color: "black", alignSelf: "center", fontSize: 30, backgroundColor: "#d8a661b9", padding: 7, borderRadius: "50%", height: 50, width: 50, }} viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"> <path stroke="none" d="M0 0h24v24H0z" fill="none" /> <path d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5" /> <path d="M11 11.5v-2a1.5 1.5 0 0 1 3 0v2.5" /> <path d="M14 10.5a1.5 1.5 0 0 1 3 0v1.5" /> <path d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7l-.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47" /> <path d="M5 3l-1 -1" /> <path d="M4 7h-1" /> <path d="M14 3l1 -1" /> <path d="M15 6h1" /> </svg>
                <p className={styles.cardHeader}>No Setup Required </p>
                <p className={styles.cardSubHeader}>Customers can use StreaQr directly on our website without creating any account nor downloading the app</p>
              </div>
              <div className={styles.sectionBoxContainer}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style={{ color: "black", alignSelf: "center", fontSize: 30, backgroundColor: "#d8a661b9", padding: 7, borderRadius: "50%", height: 50, width: 50, }} viewBox="0 0 16 16"> <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /> </svg>
                <p className={styles.cardHeader}>Call Waiter</p>
                <p className={styles.cardSubHeader}>With a simple single tap on their phone screens, your customers can call the waiter for any service they may require</p>
              </div>
              <div className={styles.sectionBoxContainer}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style={{ color: "black", alignSelf: "center", fontSize: 30, backgroundColor: "#d8a661b9", padding: 7, paddingLeft: 9, overflow: "visible", borderRadius: "50%", height: 50, width: 50, }} viewBox="0 0 16 16"> <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" /> </svg>

                <p className={styles.cardHeader}>Online Ordering </p>
                <p className={styles.cardSubHeader}>With our flexible and easy online process, customers save time by choosing and ordering their preferences </p>
              </div>
            </div>
            <div data-aos="fade-up" data-aos-offset="-50" data-aos-duration="1000" data-aos-delay="250" data-aos-once="true" className={styles.cardContainer}>
              <div className={styles.sectionBoxContainer}>

                <svg xmlns="http://www.w3.org/2000/svg" style={{ color: "black", alignSelf: "center", fontSize: 30, backgroundColor: "#d8a661b9", overflow: "visible", paddingRight: 10, padding: 7, borderRadius: "50%", height: 50, width: 50, }} width="512" height="512" viewBox="0 0 512 512"><title>ionicons-v5-l</title><path d="M448,48,416,32,384,48,352,32,320,48,288,32,256,48,224,32,192,48,144,32V288s0,.05,0,.05H368V424c0,30.93,33.07,56,64,56h12c30.93,0,52-25.07,52-56V32ZM272.5,240l-.5-32H431.5l.5,32Zm-64-80-.5-32H431.5l.5,32Z" /><path d="M336,424V320H16v32c0,50.55,5.78,71.62,14.46,87.63C45.19,466.8,71.86,480,112,480H368S336,460,336,424Z" /></svg>

                <p className={styles.cardHeader}>Digital Bills </p>
                <p className={styles.cardSubHeader}>Fast, eco friendly and autonomous billing solution </p>
              </div>
              <div className={styles.sectionBoxContainer}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style={{ color: "black", alignSelf: "center", fontSize: 30, backgroundColor: "#d8a661b9", padding: 9, borderRadius: "50%", height: 50, width: 50, }} viewBox="0 0 16 16"> <path d="M5.354 5.119 7.538.792A.516.516 0 0 1 8 .5c.183 0 .366.097.465.292l2.184 4.327 4.898.696A.537.537 0 0 1 16 6.32a.548.548 0 0 1-.17.445l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256a.52.52 0 0 1-.146.05c-.342.06-.668-.254-.6-.642l.83-4.73L.173 6.765a.55.55 0 0 1-.172-.403.58.58 0 0 1 .085-.302.513.513 0 0 1 .37-.245l4.898-.696zM8 12.027a.5.5 0 0 1 .232.056l3.686 1.894-.694-3.957a.565.565 0 0 1 .162-.505l2.907-2.77-4.052-.576a.525.525 0 0 1-.393-.288L8.001 2.223 8 2.226v9.8z" /> </svg>
                <p className={styles.cardHeader}>Feedback </p>
                <p className={styles.cardSubHeader}>Customers can leave reviews regarding your Waiters service</p>
              </div>
              <div className={styles.sectionBoxContainer}>
                <svg xmlns="http://www.w3.org/2000/svg" style={{ color: "black", alignSelf: "center", fontSize: 30, backgroundColor: "#d8a661b9", padding: 6, borderRadius: "50%", height: 50, width: 50, }} viewBox="0 0 24 24"><path d="M21,12.22C21,6.73,16.74,3,12,3c-4.69,0-9,3.65-9,9.28C2.4,12.62,2,13.26,2,14v2c0,1.1,0.9,2,2,2h1v-6.1 c0-3.87,3.13-7,7-7s7,3.13,7,7V19h-8v2h8c1.1,0,2-0.9,2-2v-1.22c0.59-0.31,1-0.92,1-1.64v-2.3C22,13.14,21.59,12.53,21,12.22z" /><circle cx="9" cy="13" r="1" /><circle cx="15" cy="13" r="1" /><path d="M18,11.03C17.52,8.18,15.04,6,12.05,6c-3.03,0-6.29,2.51-6.03,6.45c2.47-1.01,4.33-3.21,4.86-5.89 C12.19,9.19,14.88,11,18,11.03z" /></svg>
                <p className={styles.cardHeader}>Customer Support</p>
                <p className={styles.cardSubHeader}>We try to provide an all-around flawless experience, in case of any problem we will glady offer assistance</p>
              </div>
            </div>
          </section>
          <section className={styles.section5} id="contact">
            <div data-aos="fade" data-aos-offset="-50" data-aos-duration="1300" data-aos-delay="250" data-aos-once="true" className={styles.section5ContentContainer}>
              <p className={styles.section5Header}>Startup</p>
              <p className={styles.section5subHeader}>We are granting a <b style={{ color: "#d8a661b1" }}>fully free premium membership</b> for <b style={{ color: "#d8a661b1" }}>2 months</b> to our first 100 restaurant partners</p>
              <div style={{ alignSelf: "center", marginTop: 30, maxWidth: 400, width: "80%", display: "flex", flexDirection: "column", height: 130, borderRadius: "55%", }}>
                <p className={styles.section5ContactUs}>Contact Us</p>
                <div style={{ display: "flex", flexDirection: 'row', justifyContent: "space-around", paddingRight: 30, paddingTop: 10, paddingLeft: 30 }}>
                  <a rel="external" href="https://wa.me/96176178678"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={styles.iconsStyle} style={{ color: "#d8a661b1", height: 40, width: 34 }} viewBox="0 0 16 16"> <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" /> </svg></a>
                  <a rel="external" href="mailto:StreaQr@gmail.com"><svg xmlns="http://www.w3.org/2000/svg" style={{ color: "#d8a661b1", position: "relative", top: -5.5, left: 12, height: 50, width: 54 }} className={styles.iconsStyle} zoomAndPan="magnify" viewBox="0 0 30 30.000001" preserveAspectRatio="xMidYMid meet" version="1.0"><defs><clipPath id="id1"><path d="M 3.460938 6.5625 L 26.539062 6.5625 L 26.539062 24.707031 L 3.460938 24.707031 Z M 3.460938 6.5625 " clipRule="nonzero" /></clipPath></defs><g clipPath="url(#id1)"><path className={styles.iconsStyle} fill="#d8a661b1" d="M 24.230469 11.101562 L 15 16.769531 L 5.769531 11.101562 L 5.769531 8.832031 L 15 14.503906 L 24.230469 8.832031 Z M 24.230469 6.5625 L 5.769531 6.5625 C 4.492188 6.5625 3.472656 7.578125 3.472656 8.832031 L 3.460938 22.441406 C 3.460938 23.695312 4.492188 24.707031 5.769531 24.707031 L 24.230469 24.707031 C 25.507812 24.707031 26.539062 23.695312 26.539062 22.441406 L 26.539062 8.832031 C 26.539062 7.578125 25.507812 6.5625 24.230469 6.5625" fillOpacity="1" fillRule="nonzero" /></g></svg></a>
                </div>
              </div>
            </div>
            <div data-aos="fade-left" data-aos-offset="-50" data-aos-duration="1000" data-aos-delay="200" data-aos-once="true" className={styles.section5ImageContainer} >
              <Animation file={"contact.json"} />
            </div>
          </section>
        </main>
      </div>

    </>
  )
}
//