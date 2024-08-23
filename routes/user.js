const express = require("express")
const User = require("../model/product")
const jwt = require("jsonwebtoken")
const fetchuser = require("../middleware/middleware");
const Admin = require("../model/Admin");

const router = express.Router();


router.post("/createReview",async(req,res)=>{
  const {userId,productId,reviewData} = req.body;
  const user = await User.Users.findById({_id : userId})
  console.log(req.body)
  const review =  new User.Review({
    title : reviewData.title,
    message : reviewData.message,
    stars : reviewData.stars,
    user : user,
    product : productId,
  })

  await review.save();

  res.status(200).send("Success created review")
  console.log("review Succcess");
})


router.post("/admin/login",async(req,res)=>{
  try {
    const {email,password} = req.body;
    let user = await Admin.findOne({email});
    if (!user) {
      success = false
      return res.status(400).json({ success, error: "Please try to login with correct credentials (email)" });
    }   
    
    const passwordCompare = password === user.password
    if(!passwordCompare){
        success = false
      return res.status(400).json({ success, error: "Please try to login with correct credentials (password)" });
    }

    const data = {
        user: {
          id: user.id
        }
      }

      const authtoken = jwt.sign(data, 'secrem_admin1');
      success = true;
      res.json({ success, authtoken })
  } catch (error) {
    res.status(500).send("Internal Server Error")
  }
})


router.post("/createUser",async(req,res)=>{
    
        let check = await User.Users.findOne({ email: req.body.email });
    if (check) {
      return res.status(400).json({ success:false,error: "Sorry a user with this email already exists" })     
    }

    let cart = {}
    for (let index = 0; index < 300; index++) {
      cart[index] = 0      
    }

    let list = {}
    for (let index = 0; index < 300; index++) {
      list[index] = 0      
    }

    const user = new User.Users({
        name: req.body.name,
        email : req.body.email,
        password : req.body.password,
        cartData: cart,
        wishlistData : list,
    })

    await user.save();

    const data = {
        user:{
            id : user.id
        }        
    }

    const token = jwt.sign(data,'secret_ecom1')
    res.json({success : true,token})


    
})

router.post("/login",async(req,res)=>{
    const {email,password} = req.body;
    let user = await User.Users.findOne({email});
    if (!user) {
      success = false
      return res.status(400).json({ success, error: "Please try to login with correct credentials (email)" });
    }   
    
    const passwordCompare = password === user.password
    if(!passwordCompare){
        success = false
      return res.status(400).json({ success, error: "Please try to login with correct credentials (password)" });
    }

    const data = {
        user: {
          id: user.id,          
        }
      }

      const authtoken = jwt.sign(data, 'secret_ecom1');
      success = true;
      res.json({ success, authtoken })

})



router.post("/removefromList",fetchuser,async(req,res)=>{
  console.log("removed",req.body.itemId)

   let userData = await User.Users.findOne({_id: req.user.id});
   if(userData.wishlistData[req.body.itemId]>0)
   userData.wishlistData[req.body.itemId] -= userData.wishlistData[req.body.itemId];   

   await User.Users.findOneAndUpdate({_id:req.user.id},{wishlistData: userData.wishlistData})

   res.send("Removed from wishlist")
})


router.post('/getList',fetchuser,async(req,res)=>{
  console.log("GetList");
  let userData = await User.Users.findOne({_id: req.user.id})
  if(userData.wishlistData){
  res.json(userData.wishlistData)}
})


router.post("/addtoCart",fetchuser,async(req,res)=>{
  
  console.log(req.body,req.user)  
    let userData = await User.Users.findOne({_id: req.user.id});
    userData.cartData[req.body.itemId] += 1
 
    await User.Users.findOneAndUpdate({_id:req.user.id},{cartData: userData.cartData})
 
    res.status(200).json({
       success : true,
       message : "Item Added to Cart"
     })
  
})



router.post("/addtoList",fetchuser,async(req,res)=>{
  console.log(req.body,req.user)

   let userData = await User.Users.findOne({_id: req.user.id});
   userData.wishlistData[req.body.itemId] += 1

   
    await User.Users.findOneAndUpdate({_id:req.user.id},{wishlistData: userData.wishlistData})
   res.status(200).send({
    message : "Added to Wishlist",
    success : true
   })
   
   
})

router.post("/removefromCart",fetchuser,async(req,res)=>{
  console.log("removed",req.body.itemId)

   let userData = await User.Users.findOne({_id: req.user.id});
   if(userData.cartData[req.body.itemId]>0)
   userData.cartData[req.body.itemId] -= 1;   

   await User.Users.findOneAndUpdate({_id:req.user.id},{cartData: userData.cartData})

   res.send("Removed")
})

router.post('/getCart',fetchuser,async(req,res)=>{
  console.log("Getcart");
  let userData = await User.Users.findOne({_id: req.user.id})
  if(userData.cartData){
  res.json(userData.cartData)}
})

module.exports = router