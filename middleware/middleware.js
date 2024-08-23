const jwt = require('jsonwebtoken');
const JWT_SEC = 'secret_ecom1'


const fetchuser = async(req,res,next) =>{
    const token = await req.header("auth-token");
    //get user from the jwt token and add id to req object
    if(!token){
        res.status(401).send({error: "Please use valid token"})
    }
   try {
    const data = jwt.verify(token,JWT_SEC);
    req.user = data.user
    next()
   } catch (error) {
    res.status(401).send({error:"Please use valid2 token"})
   }
}

module.exports = fetchuser;