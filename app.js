if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const helmet = require("helmet");
const app = express();
const port = process.env.PORT || 3000;;
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError")
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelpCamp'

const MongoStore = require('connect-mongo');




const campgroundsRoutes = require("./routes/campgrounds")
const reviewsRoutes = require("./routes/reviews")
const usersRoutes = require("./routes/users")

// mongoose.connect(dbUrl);
mongoose.connect(dbUrl);

// 'mongodb://127.0.0.1:27017/yelpCamp'

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


app.engine('ejs', ejsMate)
app.use(express.urlencoded({ extended: true })) //to parse data from frontend
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}))


const secret = process.env.SECRET || 'thisshouldbeasecret';

app.use(session({ 
    store: MongoStore.create({
            mongoUrl: dbUrl,
            secret,
            touchAfter: 24*60*60
        }),
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7 
    }
}))

app.use(flash())



app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net",
    "https://images.unsplash.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];

const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                'blob:',
                'data:',
                'https://res.cloudinary.com', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                'https://images.unsplash.com',
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    if (!['/login', '/'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', usersRoutes)
app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)


app.get('/', (req, res) => {
    res.render("home");
})




app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})


app.listen(port, () => {
    console.log(`App running on port ${port}`)
})