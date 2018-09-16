var db = require("../models");

var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");
module.exports = function (app) {


  app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with request
    axios.get("http://www.echojs.com/").then(function (response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
      var articles = [];
      // Now, we grab every h2 within an article tag, and do the following:
      $("h2").each(function (i, element) {
        // Save an empty result object

        var article = {};

        // Add the text and href of every link, and save them as properties of the result object
        article.title = $(this)
          .children("a")
          .text();
        article.link = $(this)
          .children("a")
          .attr("href");
        article.saved = false;

        articles.push(article);


        console.log(article);
      });
      var hbsObject = {
        articles: articles
      };
      //console.log(hbsObject);
      res.render("scraped", hbsObject);
    });
  });

  // Route for getting all Articles from the db
  app.get("/", function (req, res) {
    // TODO: Finish the route so it grabs all of the articles
    db.Article.find({}).then(function (dbArticle) {
      //res.json(dbArticle);
      var hbsObject = {
        articles: dbArticle
      };
      //console.log(hbsObject);
      res.render("index", hbsObject);
    }).catch(function (err) {
      res.json(err);
    })
  });

  app.post("/api/articles/", function (req, res) {
    console.log("Inside POST");


    db.Article.find({ title: req.body.title }).then(function (dbArticle) {
      console.log(dbArticle.length);
      if(dbArticle.length!==0){
        res.send("Article already exists");

      }else{
        db.Article.create(req.body).then(function (dbArticle) {
          res.json(dbArticle);
        }).catch(function (err) {
          res.json(err);
        });
      }
      //return db.Note.find({ _id: mongojs.ObjectId(dbArticle[0].note) });
    });
  });

  app.delete("/api/articles/:id", function (req, res) {
    console.log("Inside DEL");

    console.log(req.body);
    db.Article.findByIdAndRemove({_id: mongojs.ObjectId(req.params.id) }).then(function (dbArticle) {
      res.json(dbArticle);
    }).catch(function (err) {
      res.json(err);
    });
  });
  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function (req, res) {
    // TODO
    // ====
    // Finish the route so it finds one article using the req.params.id,
    // and run the populate method with "note",
    // then responds with the article with the note included
    db.Article.find({ _id: mongojs.ObjectId(req.params.id) }).populate("notes").then(function (dbArticle) {
      console.log(dbArticle);
 
      res.json(dbArticle);
      //return db.Note.find({ _id: mongojs.ObjectId(dbArticle[0].note) });
    }).catch(function (err) {
      res.json(err);
    });
  });

  // Route for saving/updating an Article's associated Note
  app.post("/api/articles/:id", function (req, res) {
    // TODO
    // ====
    // save the new note that gets posted to the Notes collection
    // then find an article from the req.params.id
    // and update it's "note" property with the _id of the new note
    db.Note.create(req.body).
    then(function (dbNote) {
      return db.Article.findOneAndUpdate({ _id: mongojs.ObjectId(req.params.id) }, { $push: { notes: dbNote._id } }, { new: true });

    }).then(function (dbArticle) {
      res.json(dbArticle);
    })
      .catch(function (err) {
        res.json(err);
      });

  });


  app.delete("/api/notes/:id", function (req, res) {

    db.Note.findByIdAndRemove({_id: mongojs.ObjectId(req.params.id) }).then(function (dbArticle) {
      res.json(dbArticle);
    }).catch(function (err) {
      res.json(err);
    });
  });
  
};
