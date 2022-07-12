import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from "next/link"
const Navbar = ({ }) => {
    const routers = useRouter()
    let c = routers.asPath
    let v = 0;
    let articleName = "";

    for (let x = 0; x < c.length; x++) {
        if (c[x] === "/")
            v++;
        if (v === 2) {
            if (c[x] === "/")
                continue;
            else
                articleName = articleName + c[x];
        }
    }

    let number = 0;
    let location = "";

    for (let x = 0; x < c.length; x++) {
        if (c[x] === "/")
            number++;
        if (number === 4) {
            if (c[x] === "/")
                continue;
            else
                location = location + c[x];
        }
    }

    const cleanName = articleName.replace('%20', ' ');
    articleName = cleanName

    if (articleName != "") {
        let Scroll = true
        if (typeof window !== "undefined") {
            if (document.body.style.overflowY != "auto")
                document.body.style.overflowY = "auto"
        }




        let menuLink = `/resto/${articleName}/menu`
        let commandsLink = `/resto/${articleName}/commands`
        function toggle() {
            if (!Scroll) {
                document.body.style.overflowY = "auto"
                Scroll = true
            } else {
                document.body.style.overflowY = "hidden"
                Scroll = false
            }
        }

        return (
            <>
                <noscript>
                    <div className="alert alert-danger">
                        <strong>Alert!</strong> Javascript is required in order to use this website
                    </div>
                </noscript>
                <div className="toggleStarsIndex" style={{ position: "absolute", }}>
                    <div id='stars'></div>
                    <div id='stars3'></div>
                </div>

                <section id="navbar" style={{ zIndex: 100 }}>
                    <div className="align">
                        <div className="align2">
                            <h4 style={{ fontWeight: 500 }}>{articleName}</h4>
                            <h2>Powered by StreaQr</h2>
                        </div>

                        <header>
                            <input onClick={toggle} type='checkbox' id='toggle' style={{ display: 'none' }} />
                            <label style={{ padding: 20 }} className='toggle-btn toggle-btn__cross' htmlFor='toggle'>
                                <div className="bar"></div>
                                <div className="bar"></div>
                                <div className="bar"></div>
                            </label>
                            <nav>
                                <ul>
                                    <li><Link href={"/"} passHref><a >Home</a></Link></li>
                                    <li><Link href={"/#about"} passHref><a >About</a></Link></li>
                                    <li><Link href={"/#contact"} passHref><a >Contact us</a></Link></li>
                                </ul>
                            </nav>
                        </header>

                    </div>
                </section>

                <header className="main-header">

                    <section id="navigation">
                        <div className="alignNav">

                            <Link href={menuLink} passHref><a >Menu</a></Link>
                            <Link href={commandsLink} passHref><a>Commands</a></Link>

                        </div>
                    </section>
                </header>
            </>
        );
    }

    else {

        if (typeof window !== "undefined") {
            if (document.body.style.overflowY != "auto")
                document.body.style.overflowY = "auto"
        }
        const closeMenu = () => {
            var inputs = document.getElementsByTagName("input");
            inputs[0].checked = false
        }

        return (
            <section style={{ zIndex: 100, position: "sticky" }} id="navbar">
                <div className="align">
                    <div style={{ flexDirection: 'row', display: 'flex', }}>
                        <div style={{ alignSelf: 'center', height: 60, width: 60, position: 'relative', top: 0 }}>
                            <Image
                                src={"/applogotexturenobgsmall.png"}
                                priority={true}
                                alt={`StreaQr Logo`}
                                width={60}

                                height={60}
                            />
                        </div>

                        <h1>StreaQr</h1>
                    </div>
                    <header id="ToggleMenu" >
                        <input type='checkbox' id='toggle' style={{ display: 'none' }} />
                        <label style={{ padding: 20 }} className='toggle-btn toggle-btn__cross' htmlFor='toggle'>
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                        </label>
                        <nav>
                            <ul>
                                <li onClick={() => closeMenu()} style={{ lineHeight: 1.5, }}><Link href={"/"} passHref><a >Home</a></Link></li>
                                <li onClick={() => closeMenu()} style={{ lineHeight: 1.5 }}><Link href={"/#about"} passHref><a  >About</a></Link></li>
                                <li onClick={() => closeMenu()} style={{ lineHeight: 1.5 }}><Link href={"/#contact"} passHref><a >Contact us</a ></Link></li>
                            </ul>
                        </nav>
                    </header>
                    <header id="BigMenu" style={{ width: "65%", flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <Link href={"/"} passHref><a style={{}}>App</a></Link>
                        <Link href={"/"} passHref><a >Home</a></Link>
                        <Link href={"/#about"} passHref><a >About</a></Link>
                        <Link href={"/#contact"} passHref><a >Contact us</a></Link>
                    </header>
                </div>
            </section>
        );
    }
};


export default Navbar;
