import Layout from '../components/Layout';
import '../styles/App.css';
import Head from 'next/head'
import { Router } from "next/dist/client/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false });
Router.events.on("routeChangeStart", () => {
  NProgress.start();
})
Router.events.on("routeChangeComplete", () => {
  NProgress.done();
})
Router.events.on("routeChangeError", () => {
  NProgress.done();
})

export default function MyApp({ Component, pageProps }) {

  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-icon.png"></link>
        <meta name="theme-color" content="#317EFB" />
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name='robots' content='max-image-preview:large' />
        <meta name="msapplication-TileImage" content="/StreaQrLogo.ico" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}





