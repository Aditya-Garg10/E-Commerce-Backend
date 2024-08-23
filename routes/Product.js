const express = require("express")
const Product = require("../model/product")


const router = express.Router()

router.get("/allReviews",async(req,res)=>{
  try {
    const reviews = await Product.Review.find({}).populate('user','name email').populate('product','name')
    .exec()
    // console.log(reviews)
    res.status(200).json(reviews)
  } catch (error) {
    res.status(400).json("Internal server error")
  }
  
})


// For deleting the Products
router.delete("/delProduct",async(req,res)=>{
    await Product.findOneAndDelete({ id: req.body.id});
    console.log("product deleted successfully");
    res.json({
        success : true,        
    })
})

router.get("/allProducts",async(req,res)=>{
    const products = await Product.Product.find({})
    console.log("Fetched All Products");
    res.send(products)
})

router.get("/newCollections",async(req,res)=>{
    let products = await Product.Product.find({});
    if(products){
      let newCollections = products.slice(1).slice(-6)
      res.send(newCollections)
    }
})

router.post("/addProductDirect",async(req,res)=>{
    try {    
      const project =  Product.Product.create(req.body);
      res.status(200).json({
        data: project,
        success: true,
        message: "Product Added Successfully",
      });
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  })


router.put("/EditProduct",async(req,res)=>{
    try {    
        const project = await Product.Product.findOneAndUpdate(
          {_id:req.body._id},
          req.body,
          {new: true}
        );
        res.status(200).json({
          data: project,
          success: true,
          message: "Project Updated Successfully",
        });
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
})




module.exports = router;