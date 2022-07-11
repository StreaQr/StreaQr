
import jwt from "jsonwebtoken"
import crypto from "crypto"
export default function GetCookie(id, user) {

    function sha1(input) {
        return crypto.createHash('sha1').update(input).digest();
    }

    function password_derive_bytes(password, salt, iterations, len) {
        let key = Buffer.from(password + salt);
        for (let i = 0; i < iterations; i++) {
            key = sha1(key);
        }
        if (key.length < len) {
            let hx = password_derive_bytes(password, salt, iterations - 1, 20);
            for (let counter = 1; key.length < len; ++counter) {
                key = Buffer.concat([key, sha1(Buffer.concat([Buffer.from(counter.toString()), hx]))]);
            }
        }
        return Buffer.alloc(len, key);
    }

    //encryption 
    const key1 = process.env.KEY;
    const key2 = process.env.IV_KEY;
    const iv = password_derive_bytes(key2, '', 16, 16);

    function encrypt(text) {
        let key = password_derive_bytes(key1, '', 100, 32);
        let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
    }




    const gen = new Date();
    gen.setMonth(gen.getMonth() + 1);
    const date3 = gen.toISOString();

    const token = jwt.sign(
        {
            user: id,
            date3,

        },
        (user == "Waiter") ?
            process.env.JWT_SECRET_WAITER
            :
            process.env.JWT_SECRET

    );

    const etoken = encrypt(token)
    const Cookie = etoken.iv + "." + etoken.encryptedData

    return Cookie

}