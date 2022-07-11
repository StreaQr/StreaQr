import nodeMailer from 'nodemailer'

const transporter = nodeMailer.createTransport({

    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'app.avore@gmail.com',
        pass: `S,gg=/;$8',/rc>d5#qVpGY7D*jA9F`
    }
});



export default transporter