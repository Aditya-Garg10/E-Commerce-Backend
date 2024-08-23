
const express = require("express")
const cors = require("cors")
const PORT = 8000;
const multer = require("multer")
const path = require("path")
const mongoose = require("mongoose")
const userRoute = require("./routes/user")
const productRoute = require("./routes/Product")
const Product = require("./model/product")

const app = express()

app.use(express.json())
app.use(cors({
  origin:["https://e-commerce-frontend-ugjc.onrender.com","http://localhost:5173","http://192.168.0.108:3000"],
  methods:["GET","POST","DELETE","PUT","PATCH"],
  credentials: true,
}))

//Qpoc9jBMtFz53AlK



// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin',"http://localhost:5173"); // Update to match your client's domain 
//   res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
//   res.header('Access-Control-Allow-Credentials', 'true'); // Allow cookies to be sent
//   next();
// });


// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin',"http://localhost:5173"); // Update to match your client's domain 
//   res.header('Access-Control-Allow-Origin',"http://localhost:3000"); // Update to match your client's domain 
//   res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
//   res.header('Access-Control-Allow-Credentials', 'true'); // Allow cookies to be sent
//   next();
// });

const allowedOrigins = ['http://localhost:5173', 'https://e-commerce-frontend-ugjc.onrender.com','http://192.168.0.108:3000'];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});




app.use("/",userRoute)
app.use("/",productRoute)
app.use('/images',express.static('upload/images'))

const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb)=> {
      return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`); // Appending extension
    }
  });

  
 
  const upload = multer({
    dest : path.join(__dirname,"/tmp/uploads/profiles"),
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB file size limit
    fileFilter: function (req, file, cb) {
      const fileTypes = /jpeg|jpg|png|webp/;
      const mimetype = fileTypes.test(file.mimetype);
      const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only .jpeg, .jpg, and .png files are allowed'));
      }
    }
  });

  
  
 
// Endpoint to upload up to 4 images
app.post('/upload', upload.array('images', 4), async(req, res) => {
  
      let products = await Product.Product.find({});
      let id;
      if(products.length>0){
          let last_product_array = products.slice(-1)
          let last_product = last_product_array[0];
          id = last_product.id+1
      }
      else{
          id = 1;
      }

      console.log(req.files);

      // if (req.files.length !== 1) {
      //   return res.status(400).send('No files were uploaded.');
      // }  
      
    try {
     
      const fileLinks = req.files.map(file => (
        `http://localhost:8000/images/${file.filename}`
      ));

      const {name,category,details,description,tags,new_price,old_price} = req.body
      const product = new Product.Product({
                id: id,
                name,                    
                category,
                tags,
                details,
                description,
                new_price,
                old_price,
                image: fileLinks
               }); 
               
               await product.save();
              console.log(product)
            res.status(200).json({
              success: true,
              message : "Product Added Successfully",
              data: product
            });
              
    } catch (error) {
      res.status(501).json({ error: error.message });
      console.log(error);
    } 
  });
  
    

mongoose.connect("mongodb+srv://adityagarg646:Qpoc9jBMtFz53AlK@cluster1.ro01vgx.mongodb.net/E-Commerce",{
  useNewUrlParser : true,
  useUnifiedTopology : true,
})

app.listen(PORT,(error)=>{
    if(!error){
        console.log(`Server running on http://localhost:${PORT}`);
    }
    else{
        console.log("Error",error);
    }
})