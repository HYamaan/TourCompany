const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

module.exports = (user,url)=>{
  const privateKey = fs.readFileSync(`${__dirname}/../key/private.key`,'utf-8');
  //openssl genrsa -out ./key/private.key 4096
  //ssh-keygen -f ./key/private.key -e -m PKCS8 > ./key/public.key
  const header = // JWT'nin yapısını ve kullanılan algoritmayı belirleyen bir JSON nesnesidir
    {
      alg:'RS256',
      typ:'JWT',
    };
  const payload={id:user._id};
  const secret=process.env.JWT_SECRET
  const jwtid = uuidv4(); // Rastgele bir UUID(Benzersiz key) oluşturuyoruz
  const options={
    algorithm:'RS256', //Kullanılacak şifreleme algoritmasını belirler.
    expiresIn : process.env.JWT_EXPIRES_IN, //JWT'nin geçerlilik süresini belirler
    issuer:process.env.NODE_ENV,//JWT'nin kim tarafından oluşturulduğunu belirler
    subject:user.email,// JWT'nin konusunu belirler ve genellikle kullanıcının veya uygulamanın benzersiz kimliği veya
                       // tanımlayıcısı olarak kullanılır. Örneğin, bir kullanıcının e-posta adresi veya bir uygulamanın adı
    noTimestamp: false, // JWT'nin zaman damgası içermemesini belirler.
    jwtid:jwtid, //JWT'nin benzersiz kimliğini belirler,Tekrardan aynı veriyi göndermez
    audience:url // JWT'nin hangi alıcıya gönderildiğini belirtir. Bu özellik, JWT'yi oluşturan uygulama veya servis tarafından belirlenir
  };
  return  jwt.sign(payload,privateKey,{header,...options});
}

