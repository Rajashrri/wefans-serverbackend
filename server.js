require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

const port = process.env.PORT || 8000;

// Database Connection
const connectDB = require("./utils/db");

// Routes
const authRoute = require("./router/auth-router");
const languageRoute = require("./router/language-router");
const triviaTypesRoute = require("./router/triviatypes-router");
const socialLinkRoute = require("./router/sociallink-router");
const sectiontemplateRoute = require("./router/sectiontemplate-router");
const genreMasterRoute = require("./router/genremaster-router");



const movievRoute = require("./router/moviev-router");
const seriesRoute = require("./router/series-router");
const electionRoute = require("./router/election-router");
const positionsRoute = require("./router/positions-router");

const celebratyRoute = require("./router/celebraty-router");
const timelineRoute = require("./router/timeline-router");
const sectionmasterRoute = require("./router/sectionmaster-router");


const triviaentriesRoute = require("./router/triviaentries-router");

const profileRoute = require("./router/profile-router");
const professionalmasterRoute = require("./router/professionalmaster-router");

const testimonialsRoute = require("./router/testimonials-router");
const dashboardRoute = require("./router/dashboard-router");


// Middlewares
const errorMiddleware = require("./middlewares/validate-middleware");
const errorMiddleware1 = require("./middlewares/error-middleware");

// ✅ CORS Configuration


const corsOptions = {
 origin: 'https://wefans-frontend.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
};

// Use the same variable name (case sensitive!)
app.use(cors(corsOptions)); 
app.options('*', cors(corsOptions));

// const corsOptions = {
//   origin: process.env.CORS_ORIGIN, // only from .env
//   methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
//   credentials: true,
// };

// app.use(cors(corsOptions));

// ✅ Parse JSON
app.use(express.json());

// ✅ Static Files
app.use('/professionalmaster', express.static(path.join(__dirname, 'public/professionalmaster')));
app.use('/celebraty', express.static(path.join(__dirname, 'public/celebraty')));
app.use('/timeline', express.static(path.join(__dirname, 'public/timeline')));
app.use('/triviaentries', express.static(path.join(__dirname, 'public/triviaentries')));
app.use('/moviev', express.static(path.join(__dirname, 'public/moviev')));
app.use('/series', express.static(path.join(__dirname, 'public/series')));
app.use('/election', express.static(path.join(__dirname, 'public/election')));
app.use('/positions', express.static(path.join(__dirname, 'public/positions')));
app.use('/sectionmaster', express.static(path.join(__dirname, 'public/sectionmaster')));

app.use('/profile', express.static(path.join(__dirname, 'public/profile')));
app.use('/testimonial', express.static(path.join(__dirname, 'public/testimonial')));

// ✅ API Routes
app.use("/api/auth", authRoute);
app.use("/api/professionalmaster", professionalmasterRoute);

app.use("/api/language", languageRoute);
app.use("/api/triviaTypes", triviaTypesRoute);
app.use("/api/celebraty", celebratyRoute);
app.use("/api/timeline",timelineRoute);
app.use("/api/triviaentries",triviaentriesRoute);
app.use("/api/moviev", movievRoute);
app.use("/api/series", seriesRoute);
app.use("/api/election", electionRoute);
app.use("/api/positions", positionsRoute);
app.use("/api/sectionmaster",sectionmasterRoute);
app.use("/api/sectiontemplate", sectiontemplateRoute);

app.use("/api/socialLink",socialLinkRoute);
app.use("/api/genreMaster",genreMasterRoute);


app.use("/api/profile", profileRoute);
app.use("/api/testimonial", testimonialsRoute);
app.use("/api/dashboard",dashboardRoute);


// otp
app.use(errorMiddleware);
app.use(errorMiddleware1);
connectDB().then( ()=>{
    app.listen(port, () =>{
        console.log(`server is running at port no ${port}`);
    });
});
