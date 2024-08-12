const express = require("express");
const app = express();
const userModel = require("./model/user");
const postModel = require("./model/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const path = require("path");
const upload = require("./config/multerconfig");
const user = require("./model/user");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/createuser", (req, res) => {
  res.render("createuser");
});

app.get("/profile/upload", (req, res) => {
  res.render("uploadpic");
});


app.get("/view-post", isLogin, async (req, res) => {
  let posts = await postModel.find().populate("user");
  await posts.save();
  res.redirect("/");
});

app.get("/", async (req, res) => {
  if (!isLogin) {
    return res.send("Something went wrong")
  } else {
    let users = await userModel.find().populate("posts");
    res.render("index", { isLogin, users });
  }
});

// app.get("/like/:id", async (req, res) => {
//   let post = await postModel.findOne({ _id: req.params.id }).populate("user");

//   if (post.likes.indexOf(req.user.userid) === -1) {
//     post.likes.push(req.user.userid);
//   } else {
//     post.likes.splice(post.likes.indexOf(req.user.userid), 1);
//   }

//   await post.save();
//   res.redirect("/viewpost");
// });

app.post("/upload-profile-pic", upload.single("image"), async (req, res) => {
  let user = await userModel.findById(req.user.id);
  user.profilepic = req.file.filename;
  await user.save();
  res.redirect("/");
});

app.post("/upload", isLogin, upload.single("image"), async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  user.profilepic = req.file.filename;
  await user.save();
  res.redirect("/profile");
});

app.get("/profile", isLogin, async (req, res) => {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("posts");
  res.render("profile", { user });
});

app.get("/edit/:id", isLogin, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");
  res.render("edit", { post });
});

app.get("/delete/:id", isLogin, async (req, res) => {
  let post = await postModel.findOneAndDelete({ _id: req.params.id });
  res.redirect("/profile");
});

app.post("/update/:id", isLogin, async (req, res) => {
  let post = await postModel.findOneAndUpdate(
    { _id: req.params.id },
    { content: req.body.content }
  );
  res.redirect("/profile");
});

app.get("/like/:id", isLogin, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");

  if (post.likes.indexOf(req.user.userid) === -1) {
    post.likes.push(req.user.userid);
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
  }

  await post.save();
  res.redirect("/");
});

app.post("/post", isLogin, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  let { content } = req.body;
  let post = await postModel.create({
    user: user._id,
    content,
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

app.post("/register", async (req, res) => {
  let { email, password, username, name, age } = req.body;
  let user = await userModel.findOne({ email });
  if (user) return res.status(500).send("already have an Account");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        username,
        email,
        age,
        name,
        password: hash,
      });
      let token = jwt.sign({ email: email, userid: user._id }, "mmaayyank");
      res.cookie("token", token);
      res.send("Registered Sccessfuly!"); //Learn about flash msg
     });
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) {
    return res.send("Something went wrong !");
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      let token = jwt.sign(
        { email: req.body.email, userid: user._id },
        "mmaayyank"
      );
      res.cookie("token", token);
      res.redirect("profile");
    } else {
      res.send("Something went wrong !");
    }
  });
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
});

// middelware:-
function isLogin(req, res, next) {
  if (req.cookies.token === "") res.send("You must be logged in");
  else {
    let data = jwt.verify(req.cookies.token, "mmaayyank");
    req.user = data;
    next();
  }
}

app.get("/delete", async (req, res) => {
  let {username, name, email} = req.body;
    let delUser = await userModel.findOneAndDelete(email);
    // res.send("Account successfuly deleted");
    res.redirect("/");
})

app.listen(3000);
