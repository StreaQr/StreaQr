//Next imports
import Head from 'next/head'

const Menu = () => {
    return (
        <div style={{ minHeight: "100vh" }}>
            <Head>
                <title>Loading...</title>
                <link rel="icon" href="/StreaQrLogo.ico" />
            </Head>
        </div>
    );
}


export async function getServerSideProps(context) {
    const { params } = context
    const gen = new Date();
    const gen2 = new Date()

    gen.setDate(gen.getDate() + 1);
    const QrCodeData = JSON.stringify(params.code).split("_")

    if (QrCodeData.length == 3)
        context.res
            .setHeader("Set-Cookie", [`Code=${JSON.stringify(params.code)};path=/; sameSite=strict;expires=${gen};`, `Resto=${params.pid};path=/; sameSite=strict;expires=${gen2};`])
    else if ((QrCodeData.length == 1) && (QrCodeData[0] == `"1"`)) {
        context.res
            .setHeader("Set-Cookie", `Code=${JSON.stringify(params.code)};path=/; sameSite=strict;expires=${gen};`)
    }
    return {
        redirect: {
            destination: `/resto/${params.pid}/menu`,
            permanent: false,
        },
        props: {},
    };
}


export default Menu;


