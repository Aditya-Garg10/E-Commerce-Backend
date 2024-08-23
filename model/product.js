const mongoose = require("mongoose")





const productSchema = new mongoose.Schema(
    {
        id:{
            type:Number,
            required: true,
        },
        name:{
            type:String,
            required:true,
        },
        category:{
            type : String,
            required: true,
        },
        tags:{
            type : Array
        },
        image:[String,],    
        description : {
            type : String,        
        },
        details:{
            type : String,
            required: true,
        },
        new_price:{
            type: Number,
            required: true,
        },
        old_price:{
            type: Number,
            required: true,
        },
        date:{
            type: Date,
            default: Date.now,
        },
        available:{
            type: Boolean,
            default: true,
        },
    }
)

const userSchema = new mongoose.Schema({
    
        name:{
            type:String,        
        },
        email:{
            type : String,
            required: true,
        },
        password:{
            type:String,
            required : true,
        },
        cartData:{
            type: Object,
        },
        wishlistData:{
            type: Object,
            
        },
        date:{
            type: Date,
            default : Date.now,
        },
       
       
    
})





const reviewSchema = new mongoose.Schema({
    title : String,
    message : String,
    stars : Number,
    name : String,
    user:{
        type:mongoose.Schema.Types.ObjectId, ref: 'Users',
    },
    product : {
        type: mongoose.Schema.Types.ObjectId, ref: 'Product',
    }

},{timestamps : true})




const Users = mongoose.model("Users",userSchema);
const Product = mongoose.model("Product",productSchema);
const Review = mongoose.model("Review",reviewSchema);
module.exports = {Product,Users,Review};