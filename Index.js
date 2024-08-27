const express = require("express");
const cors = require("cors");
const PORT = 8000;
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const userRoute = require("./routes/user");
const productRoute = require("./routes/Product");
const Product = require("./model/product");
const admin = require("firebase-admin")
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)




admin.initializeApp({
  credential:
  admin.credential.cert(serviceAccount)
  ,
  storageBucket : 'gs://e-commerce-backend-bfa60.appspot.com',
})


const app = express();

const db = admin.firestore();
const bucket = admin.storage().bucket()

app.use(express.json());
app.use(
  cors({
    origin: [
      "https://e-commerce-frontend-ugjc.onrender.com",
      "https://e-commerce-admin-44e9.onrender.com",
      "http://192.168.0.108:3000",
    ],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true,
  })
);

//Qpoc9jBMtFz53AlK



const allowedOrigins = [
  "https://e-commerce-admin-44e9.onrender.com",
  "https://e-commerce-frontend-ugjc.onrender.com",
  "http://192.168.0.108:3000",
  "http://localhost:3000"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use("/", userRoute);
app.use("/", productRoute);
// app.use("/images", express.static(bucket.file(image)));


// const { Storage } = require('@google-cloud/storage');

// const storage = new Storage();
// const bucketName = 'your-bucket-name';
// const objectName = 'your-object-name';

// async function getObject() {
  //   try {
    //     const [file] = await storage.bucket(bucketName).file(objectName).get();
    //     console.log(`File ${objectName} contents:`);
    //     console.log(file[0]);
    //   } catch (err) {
      //     console.error('Error getting file:', err);
      //   }
      // }
      
      // getObject();
      
      app.use("/images",async(req,res)=>{
        const filename = req.params.filename;
        try {
          // Get the file from Firebase Storage
          const file = bucket.file(filename);

          // Download the file
          const [data] = await file.get();
          
    // Set the content type based on the file extension
    const contentType = file.metadata.contentType;
    res.setHeader('Content-Type', contentType);

    // Send the image data to the client
    res.send(data);
    
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('Error fetching image');
  }
});



const storage = multer.diskStorage({
  destination: "upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    ); // Appending extension
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB file size limit
  fileFilter: function (req, file, cb) {
    const fileTypes = /jpeg|jpg|png|webp/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only .jpeg, .jpg, and .png files are allowed"));
    }
  },
});


const uploadToFirebase = async(file) => {
  const bucket = admin.storage().bucket();
  const uploadResponse = await bucket.upload(file.path, {
    destination: `images/${file.originalname}`,
    public: true,
    metadata: {
        contentType: file.mimetype,
      },
    });    
    return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(uploadResponse[0].name)}?alt=media`;
    
    
  };
  
  
  
  // const blob = bucket.file(`${Date.now()}_${file.originalname}`);
  // const blobStream = blob.createWriteStream({
    //   resumable:false,
    //   contentType : file.mimetype,
    // })
    // return new Promise((resolve,reject)=>{
      //   blobStream.on('error',(err)=>{
        //     reject(err);
        //   })
        //   blobStream.on('finish',()=>{
          //     const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/${blob.name}`
  //     resolve(publicUrl)
  //   })
  
  //   blobStream.end(file.buffer)
  // })
  
  
  // Endpoint to upload up to 4 images
  app.post("/upload", upload.array("images", 4), async (req, res) => {
    let products = await Product.Product.find({});
    let id;
    if (products.length > 0) {
      let last_product_array = products.slice(-1);
      let last_product = last_product_array[0];
      id = last_product.id + 1;
    } else {
      id = 1;
    }
    console.log(req.files);
    // if (req.files.length !== 1) {
      //   return res.status(400).send('No files were uploaded.');
      // }
      try {
    // const fileLinks = req.files.map(
      //   (file) =>
    //     `https://e-commerce-backend-ssjr.onrender.com/images/${file.filename}`
    // );
    
    // const fileLinks = await Promise.all(req.files.map(file=>     
      //   uploadToFirebase(file)
    // ))
    
    // https://firebasestorage.googleapis.com/v0/b/e-commerce-backend-bfa60.appspot.com/o/1724573798353_1720202493_6801435.webp?alt=media&token=b4f3c8c6-c429-40b1-a756-c14af8af13b3
    
    
    const fileLinks = await Promise.all(
      req.files.map(async (file) => {
        return await uploadToFirebase(file);
      })
    );
    
    const { name, category, details, description, tags, new_price, old_price } =
    req.body;
    const product = new Product.Product({
      id: id,
      name,
      category,
      tags,
      details,
      description,
      new_price,
      old_price,
      image: fileLinks,
    });
    
    await product.save();
    console.log(product);
    res.status(200).json({
      success: true,
      message: "Product Added Successfully",
      data: product,
    });
  } catch (error) {
    res.status(501).json({ error: error.message });
    console.log(error);
  }
});

app.use(express.static(path.join(__dirname,'./public/build')))

app.get('*',(req,res)=>{
  res.sendFile(path.join(__dirname,
    "./public/build/index.html"))
})

mongoose.connect(
  "mongodb+srv://adityagarg646:Qpoc9jBMtFz53AlK@cluster1.ro01vgx.mongodb.net/E-Commerce",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

app.listen(PORT, (error) => {
  if (!error) {
    console.log(`Server running on http://localhost:${PORT}`);
  } else {
    console.log("Error", error);
  }
});
