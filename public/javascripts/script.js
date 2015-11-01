/* Hide Forms Initially */ 

$(document).ready(function() {
  $('.appear-spop').hide();
  $('.appear-mc').hide();
  $('.appear-mcb2b').hide();
});

/* Switch B2C Form On & Hide everything else */

$(document).ready(function() {
  $('#MC').click(function() {
    $('.hide-mc').hide(1000);
    $('.appear-mc').fadeIn(1000);
    $(this).addClass('transition');
	window.product = "B2C";
	});
  });

/* Switch Silverpop Form On & Hide everything else */

$(document).ready(function() {
  $('#SPOP').click(function() {
    $('.hide-spop').hide(1000);
    $('.appear-spop').fadeIn(1000);
    $(this).addClass('transition');
    window.product = "SPOP";
  });    
});

/* Switch B2B Form On & Hide everything else */

$(document).ready(function() {
  $('#MCB2B').click(function() {
    $('.hide-mcb2b').hide(1000);
    $('.appear-mcb2b').fadeIn(1000);
    $(this).addClass('transition');
    window.product = "B2B";
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


$(document).ready(function() {
	$('#button-mc').click(function() {
		$(".list").html("");
		$('#button-mc').attr('disabled',true);
		var country = $('#country').val(); 
		var MCUsers = $('input[name=MCUsers]').val();
		var MCInteractions = $('input[name=MCInteractions]').val();
		var MCInsights = $('input[name=MCInsights]').val();
		var currency = "$";
		if (country == "US") { currency = "$"; } else if (country == "UK") { currency = "£"; } else if (country == "AUS") { currency = "$"; } else { currency = "€"; }
		qDat = {country : country, mcusers : MCUsers, interactions : MCInteractions, product : "B2C", mcinsights : MCInsights };
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

$(document).ready(function() {
	$('#button-mcb2b').click(function() {
		$(".list").html("");
		$('#button-mcb2b').attr('disabled',true);
		var country = $('#countryB2B').val(); 
		var MCUsers = $('input[name=MCUsersB2B]').val();
		var MCDBRec = $('input[name=DBRecords]').val();
		var MCInsights = $('input[name=MCInsightsB2B]').val();
		var currency = "$";
		if (country == "US") { currency = "$"; } else if (country == "UK") { currency = "£"; } else if (country == "AUS") { currency = "$"; } else { currency = "€"; }
		qDat = {country : country, mcusers : MCUsers, dbrec : MCDBRec, product : "B2B" , mcinsights : MCInsights};
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
		var SpopInsights = $('#spopb2cinsights').val();   // this line needs to be fixed so that it works.
		var currency = "$";
		if (country == "US") { currency = "$"; } else if (country == "UK") { currency = "£"; } else if (country == "AUS") { currency = "$"; } else { currency = "€"; }
		qDat = {country : country, 
				spopmsg : SpopMsg, 
				product : "spopB2c" , 
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