/* Hide Forms Initially */ 

$(document).ready(function() {
	$('.appear-spop').hide();
	$('.appear-mc').hide();
	$('.appear-mcb2b').hide();
	$('.appear-spopb2b').hide();
});

/* Switch MC B2C Form On & Hide everything else */

$(document).ready(function() {
  $('#MC').click(function() {
    $('.hide-mc').hide(1000);
    $('.appear-mc').fadeIn(1000);
    $(this).addClass('transition');
	window.product = "B2C";
	});
  });

/* Switch MC B2B Form On & Hide everything else */

$(document).ready(function() {
	$('#MCB2B').click(function() {
		$('.hide-mcb2b').hide(1000);
		$('.appear-mcb2b').fadeIn(1000);
		$(this).addClass('transition');
		window.product = "B2B";
	});
});

/* Switch Silverpop B2C Form On & Hide everything else */

$(document).ready(function() {
  $('#SPOP').click(function() {
    $('.hide-spop').hide(1000);
    $('.appear-spop').fadeIn(1000);
    $(this).addClass('transition');
    window.product = "spopB2c";
  });    
});

/* Switch Silverpop B2C Form On & Hide everything else */

$(document).ready(function() {
	$('#SPOPB2B').click(function() {
		$('.hide-spopb2b').hide(1000);
		$('.appear-spopb2b').fadeIn(1000);
		$(this).addClass('transition');
		window.product = "spopB2b";
	});
});

////* Form Styles */////

/* All Forms */
$(document).ready(function() {
  $("input").focus(function() {
    $("input").css('outline-color', '#BA006E');
  });
});


/* Marketing Cloud B2C Form */

$('#packageb2c').change(function() {
	if (this.value == "true") {
		$('#B2cInteractionsChange').text('Does the customer need additional marketing interactions beyond the 750,000 included in the Marketing Cloud Enterprise subscription?');
		$('#B2cUsersChange').text('Does the customer need additional users beyond the 10  included in the Marketing Cloud Enterprise subscription?');
		$('#B2cInsightsChange').text('Does the customer need additional email insights opens beyond the 400,000 included in the Marketing Cloud Enterprise subscription? ');
	}
	else {
		$('#B2cInteractionsChange').text('Does the customer need additional marketing interactions beyond the 250,000 included in the Marketing Cloud Standard subscription?');
		$('#B2cUsersChange').text('Does the customer need additional users beyond the 5  included in the Marketing Cloud Standard subscription?');
		$('#B2cInsightsChange').text('Does the customer need additional email insights opens beyond the 200,000 included in the Marketing Cloud Standard subscription?');
	}
});


$(document).ready(function() {
	$('#button-mc').click(function() {
		$(".list").html("");
		$('#button-mc').attr('disabled',true);
		var country = $('#country').val(); 
		var MCUsers = $('input[name=MCUsers]').val();
		var MCInteractions = $('input[name=MCInteractions]').val();
		var MCInsights = $('input[name=MCInsights]').val();
		var currency = "$";
		var package = $('#packageb2c').val();
		switch (country) {
			case "US":
				currency = "$";
				break;

			case "UK":
				currency = "£";
				break;

			case "AUS":
				currency = "$";
				break;

			case "ZAR":
				currency = "R";
				break;

			case "SGD":
				currency = "S$";
				break;

			case "NZD":
				currency = "$";
				break;

			case "INR":
				currency = "₹";
				break;
			default:
				currency = "€";
				break;
		}
		qDat = {country : country, mcusers : MCUsers, interactions : MCInteractions, product : window.product, mcinsights : MCInsights, enterprise : package };
		$(".list").css("background-color","#BA006E");
		$.post("/ask",qDat, function(data){
			$(".list").append('<div class="item">' + "Monthly Price: " + currency + data.pricem.toFixed() +  "<p></p>" +  "Yearly Price: " + currency + data.pricey.toFixed() +  "<p></p>" + "One-Time Setup Price: " + currency + data.b2csetup.toFixed() + "<p></p>" + '</div>');	
		});
		setTimeout(function() { 
			$('#button-mc').attr('disabled',false);
		}, 1000);
	});
});

/* Marketing Cloud B2B Form */

$('#packageb2b').change(function() {
	if (this.value == "true") {
		$('#B2bDbrecChange').text('Does the customer need additional database records beyond the 100,000 included in the Marketing Cloud Enterprise subscription?');
		$('#B2bUsersChange').text('Does the customer need additional users beyond the 10  included in the Marketing Cloud Enterprise subscription?');
		$('#B2bInsightsChange').text('Does the customer need additional email insights opens beyond the 400,000 included in the Marketing Cloud Enterprise subscription? ');
	}
	else {
		$('#B2bDbrecChange').text('Does the customer need additional database records beyond the 50,000 included in the Marketing Cloud Standard subscription?');
		$('#B2bUsersChange').text('Does the customer need additional users beyond the 5  included in the Marketing Cloud Standard subscription?');
		$('#B2cInsightsChange').text('Does the customer need additional email insights opens beyond the 200,000 included in the Marketing Cloud Standard subscription?');
	}
});

$(document).ready(function() {
	$('#button-mcb2b').click(function() {
		$(".list").html("");
		$('#button-mcb2b').attr('disabled',true);
		var country = $('#countryB2B').val(); 
		var MCUsers = $('input[name=MCUsersB2B]').val();
		var MCDBRec = $('input[name=DBRecords]').val();
		var MCInsights = $('input[name=MCInsightsB2B]').val();
		var currency = "$";
		var package = $('#packageb2b').val();
		switch (country) {
			case "US":
				currency = "$";
				break;

			case "UK":
				currency = "£";
				break;

			case "AUS":
				currency = "$";
				break;

			case "ZAR":
				currency = "R";
				break;

			case "SGD":
				currency = "S$";
				break;

			case "NZD":
				currency = "$";
				break;

			case "INR":
				currency = "₹";
				break;
			default:
				currency = "€";
				break;
		}
		qDat = {country : country, mcusers : MCUsers, dbrec : MCDBRec, product : window.product , mcinsights : MCInsights, enterprise : package };
		$(".list").css("background-color","#00B2EF");
		$.post("/ask",qDat, function(data){
			$(".list").append('<div class="item">' + "Monthly Price: " + currency + data.pricem.toFixed() +  "<p></p>" +  "Yearly Price: " + currency + data.pricey.toFixed() +  "<p></p>" + "One-Time Setup Price: " + currency + data.b2bsetup.toFixed() + "<p></p>" + '</div>');
		});
		setTimeout(function() {
		$('#button-mcb2b').attr('disabled',false);
		}, 1000);
 });
});

/* Silverpop B2C Form */ 

$(document).ready(function() {
	$('#button-spopb2c').click(function() {
		$(".list").html("");
		$('#button-spopb2c').attr('disabled',true);
		var country = $('#countrySpopB2c').val(); 
		var SpopMsg = $('input[name=spopB2cMsg]').val();
		var SpopInsights = $('#spopb2cinsights').val();
		var currency = "$";
		switch (country) {
			case "US":
				currency = "$";
				break;

			case "UK":
				currency = "£";
				break;

			case "AUS":
				currency = "$";
				break;

			case "ZAR":
				currency = "R";
				break;

			case "SGD":
				currency = "S$";
				break;

			case "NZD":
				currency = "$";
				break;

			case "INR":
				currency = "₹";
				break;
			default:
				currency = "€";
				break;
		}
		qDat = {country : country, 
				spopmsg : SpopMsg, 
				product : window.product,
				spopinsights : SpopInsights};
		$(".list").css("background-color","#BA006E");
		$.post("/ask",qDat, function(data){
			$(".list").append('<div class="item">' + "Monthly Price: " + currency + data.pricem.toFixed() +  "<p></p>" +  "Yearly Price: " + currency + data.pricey.toFixed() +  "<p></p>" + "One-Time Setup Price: " + currency + data.spopsetup.toFixed() + "<p></p>" + '</div>');	
		});
		setTimeout(function() {
			$('#button-spopb2c').attr('disabled',false);
		}, 1000);
	});
});


/* Silverpop B2B Form */

$(document).ready(function() {
    $('#button-spopb2b').click(function() {
        $(".list").html("");
        $('#button-spopb2b').attr('disabled',true);
        var country = $('#countrySpopB2b').val();
        var SpopDb = $('input[name=spopB2bDb]').val();
        var SpopInsights = $('#spopb2binsights').val();
        var currency = "$";
		switch (country) {
			case "US":
				currency = "$";
				break;

			case "UK":
				currency = "£";
				break;

			case "AUS":
				currency = "$";
				break;

			case "ZAR":
				currency = "R";
				break;

			case "SGD":
				currency = "S$";
				break;

			case "NZD":
				currency = "$";
				break;

			case "INR":
				currency = "₹";
				break;
			default:
				currency = "€";
				break;
		}
        qDat = {country : country,
            spopdb : SpopDb,
            product : window.product,
            spopinsights : SpopInsights};
        $(".list").css("background-color","#00B2EF");
        $.post("/ask",qDat, function(data){
            $(".list").append('<div class="item">' + "Monthly Price: " + currency + data.pricem.toFixed() +  "<p></p>" +  "Yearly Price: " + currency + data.pricey.toFixed() +  "<p></p>" + "One-Time Setup Price: " + currency + data.spopsetupb2b.toFixed() + "<p></p>" + '</div>');
        });
        setTimeout(function() {
            $('#button-spopb2b').attr('disabled',false);
        }, 1000);
    });
});


/* Disable Backspace */

$(function(){
    /*
     * this swallows backspace keys on any non-input element.
     * stops backspace -> back
     */
    var rx = /INPUT|SELECT|TEXTAREA/i;

    $(document).bind("keydown keypress", function(e){
        if( e.which == 8 ){ // 8 == backspace
            if(!rx.test(e.target.tagName) || e.target.disabled || e.target.readOnly ){
                e.preventDefault();				        
				location.reload(); // add reload code
            }
        }
    });
});