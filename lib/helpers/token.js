import crypto from "crypto"
export default function GetToken(token) {

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
    // split cookie 
    const ptoken = token.split(".");
    // assign each cookie part to a new object
    let dtoken = new Object();
    dtoken.iv = ptoken[0];
    dtoken.encryptedData = ptoken[1];

    function decrypt(text) {

        let key1 = process.env.KEY;
        let key2 = process.env.IV_KEY;
        const iv = password_derive_bytes(key2, '', 16, 16);

        let key = password_derive_bytes(key1, '', 100, 32);

        let encryptedText = Buffer.from(text.encryptedData, 'hex');

        let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();

    }
    const Token = decrypt(dtoken);
    return Token
}
