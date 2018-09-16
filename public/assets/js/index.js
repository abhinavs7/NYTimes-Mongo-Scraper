$(document).ready(function () {
  var href = document.location.href;
  if(href.includes('scrape')){
  }
  else{
    $("#clearArticles").addClass('invisible');

  }
  var articleId;

  $("#clearArticles").on("click", function (event) {
    // Make sure to preventDefault on a submit event.
    event.preventDefault();
    //empty store
    $('.list-group').empty();
    var divAlert = $('<div/>');
    divAlert.addClass('alert alert-warning');
    divAlert.html("<p>Uh Oh. Looks like we don't have any saved articles. Would You Like to Browse Available Articles?</p>");
    $('div.articlelist').append(divAlert);

    var scrapeLink = $('<a/>');
    scrapeLink.attr('href','/scrape');
    scrapeLink.html("Scrape Articles");

    divAlert.append(scrapeLink);
  });
  $(document).on("load", function (event) {


  });
  $(".savebutton").on("click", function (event) {
    // Make sure to preventDefault on a submit event.
    event.preventDefault();
    //console.log($(event.target).attr('data-articleid'));
    var newArticle = {
      title: $(event.target).attr('data-title'),
      link: $(event.target).attr('data-link'),
      saved: true
    }
    console.log(newArticle);

    // Send the POST request.
    $.ajax("/api/articles/", {
      type: "POST",
      data: newArticle
    }).then(
      function (data) {
        if(data==="Article already exists"){
          alert("Article already exists"); 
        }
        console.log("Added article with ID: ", data);
        // Reload the page to get the updated list
        $(event.target).parents('.cardList').remove();
        console.log($('.cardList'));
        if($('.cardList').length===0){
          var divAlert = $('<div/>');
          divAlert.addClass('alert alert-warning');
          divAlert.html("<p>Uh Oh. Looks like we don't have any saved articles. Would You Like to Browse Available Articles?</p>");
          $('div.articlelist').append(divAlert);
      
          var scrapeLink = $('<a/>');
          scrapeLink.attr('href','/scrape');
          scrapeLink.html("Scrape Articles");
      
          divAlert.append(scrapeLink);
        }
        //location.reload();
      }
    );
  });


  $(".deleteButton").on('click', function (event) {
    event.preventDefault();
    var articleId = $(event.target).attr('data-articleid');
    console.log(articleId);

    $.ajax("/api/articles/" + articleId, {
      type: "DELETE"
    }).then(
      function (data) {
        
        console.log("Deleted article with ID ", data);
        location.reload();

      });
  });

  $(document).on("click",'.deleteNote', function (event) {
    event.preventDefault();
    var noteId = $(event.target).attr('data-noteid');
    console.log(noteId);

    $.ajax("/api/notes/" + noteId, {
      type: "DELETE"
    }).then(
      function () {
        console.log("Deleted note with ID ");
        $('ul.noteList').empty();
        renderNotesModal(event);
      });
  });
  // Grab the articles as a json
  $.getJSON("/articles", function (data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    }
  });



  $(".launchNotes").on('click', function (event) {
    $('ul.noteList').html("");
    renderNotesModal(event);
  });
  // When you click the savenote button
  $('#saveNote').on("click", function (event) {
    // Grab the id associated with the article from the submit button
    event.preventDefault();
    var articleId = $(event.target).attr('data-articleid');
    console.log($("#note-text").val());

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax("/api/articles/" + articleId, {
      method: "POST",
      data: {
        // Value taken from note textarea
        body: $("#note-text").val()
      }
    })
      // With that done
      .then(function (data) {
        // Log the response
        console.log(data);
        $('ul.noteList').empty();
        renderNotesModal(event);
      });

    // Also, remove the values entered in the input and textarea for note entry
    $("#note-text").val("");
  });


  function renderNotesModal(event) {

    //get data-id attribute of the clicked element
    articleId = $(event.target).attr('data-articleid');
    $('#saveNote').attr('data-articleid', articleId);
    $.ajax({
      method: "GET",
      url: "/articles/" + articleId
    }).then(function (data) {
      var notesArray = data[0].notes;
      console.log(notesArray);
      if (notesArray.length > 0) {

        var noteList = $('ul.noteList')
        //noteList.empty();
        $.each(notesArray, function (i) {
          console.log(notesArray[i]._id);

          var li = $('<li/>')
            .addClass('list-group-item')
            .html("<p>" + notesArray[i].body + "</p>")
            .appendTo(noteList);
          var btn = $('<btn/>')
            .addClass('deleteNote btn  btn-outline-secondary')
            .attr('data-noteid', notesArray[i]._id)
            .attr('data-articleid', articleId)
            .text("X")
            .appendTo(li);
        });
      }

    });
  }
});