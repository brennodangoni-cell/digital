( function( $ ) {
	"use strict";
	jQuery(document).ready(function($) {
		setTimeout(function(){ 
			$(".elementor").not(".elementor-location-popup").each(function(e){
	            $( "input.elementor-field-telephone", $(this) ).each(function( index ) {
	                elementor_field_telephone($(this));
	            });
	        }) 
		 }, 200);
        jQuery( document ).on( 'elementor/popup/show', () => {
             $( "input.elementor-field-telephone" ).each(function( index ) {
                    elementor_field_telephone($(this));
            });
        } );
		$("input").on("done_load_repeater",function(e){
			$( "input.elementor-field-telephone" ).each(function( index ) {
					elementor_field_telephone($(this));
			});
		})
		function elementor_field_telephone(field){
			var onlyCountries_data = field.data("onlyct");
			var exclude = field.data("excludecountries");
			var preferredCountries_data = field.data("pre");
			var geoIpLookup_data = field.data("auto");
			var countrySearch = field.data("telephone_search");
			var initialCountry_data = field.data("defcountry");
			var input = "form_fields["+field.data("name")+"]";
			//field.attr('name',"form_fields[]");
			if(countrySearch == "yes"){
				countrySearch = true;
			}else{
				countrySearch = false;
			}
			var data = [];
			if (onlyCountries_data == "") { 
				onlyCountries_data = [];
			}else{
				onlyCountries_data = onlyCountries_data.split('|');
			}
			if (exclude == "") { 
				exclude = [];
			}else{
				exclude = exclude.split('|');
			}
			if (preferredCountries_data == "") { 
				preferredCountries_data = [ "us", "gb" ];
			}else{
				preferredCountries_data = preferredCountries_data.split('|');
			}
			if (initialCountry_data == "") { 
				initialCountry_data = "auto";
			}
			if( field.data("auto") == "yes" ){
				var iti = field.intlTelInput({
					nationalMode: true,
					countrySearch: countrySearch,
					onlyCountries: onlyCountries_data,
					excludeCountries: exclude,
					initialCountry: initialCountry_data,
					preferredCountries: preferredCountries_data,
					utilsScript: elementor_tel.utilsScript,
					separateDialCode: true,
					hiddenInput: () => ({ phone: input}),
					geoIpLookup: function(success, failure) {
					    $.get("https://ipinfo.io", function() {}, "jsonp").always(function(resp) {
					      var countryCode = (resp && resp.country) ? resp.country : "";
					      success(countryCode);
					    });
					 },
				});	
			}else{
				var iti = field.intlTelInput({
					countrySearch: countrySearch,
					onlyCountries: onlyCountries_data,
					excludeCountries: exclude,
					initialCountry: initialCountry_data,
					preferredCountries: preferredCountries_data,
					utilsScript: elementor_tel.utilsScript,
					separateDialCode: true,
					hiddenInput: () => ({ phone: input})
				});
			}
		}
		// phon us
		$("body").on('keypress','.elementor-field-telephone-us', function(e) {
			  var key = e.charCode || e.keyCode || 0;
			  var phone = $(this);
			  if (phone.val().length === 0) {
			    phone.val(phone.val() + '(');
			  }
			  // Auto-format- do not expose the mask as the user begins to type
			  if (key !== 8 && key !== 9) {
			    if (phone.val().length === 4) {
			      phone.val(phone.val() + ')');
			    }
			    if (phone.val().length === 5) {
			      phone.val(phone.val() + ' ');
			    }
			    if (phone.val().length === 9) {
			      phone.val(phone.val() + '-');
			    }
			    if (phone.val().length >= 14) {
			      phone.val(phone.val().slice(0, 13));
			    }
			  }

			  // Allow numeric (and tab, backspace, delete) keys only
			  return (key == 8 ||
			    key == 9 ||
			    key == 46 ||
			    (key >= 48 && key <= 57) ||
			    (key >= 96 && key <= 105));
			})

			.on('focus', function() {
			 var phone = $(this);

			  if (phone.val().length === 0) {
			    phone.val('(');
			  } else {
			    var val = phone.val();
			    phone.val('').val(val); // Ensure cursor remains at the end
			  }
			})

			.on('blur', function() {
			  var $phone = $(this);

			  if ($phone.val() === '(') {
			    $phone.val('');
			  }
		});

	$("body").on("change",".elementor-field-telephone",function(){
		var content = $.trim($(this).val());
		var check_field = $(this).closest('.elementor-field-type-telephone').find('.phone_check');
		var number = $(this).intlTelInput("getNumber");
		$(this).next().attr("value",number);
		$(this).next().val(number);
		if( $(this).data("validation") == "yes" && content.length > 0 ) {
			var number = $(this).intlTelInput("getNumber");
			if ($(this).intlTelInput("isValidNumber")) { 
				check_field.attr("value","yes");
				check_field.val("yes");
				$(this).addClass('wpcf7-not-valid-blue').removeClass('wpcf7-not-valid-red').removeClass('wpcf7-not-valid');	
			}else{
				check_field.attr("value","no");
				check_field.val("no");
				$(this).addClass('wpcf7-not-valid-red').removeClass('wpcf7-not-valid-blue');
			}
		}
	})
	$( ".elementor-field-telephone" ).keyup(function( event ) {
		var check_field = $(this).closest('.elementor-field-type-telephone').find('.phone_check');
	 	var content = $.trim($(this).val());
		if( $(this).data("validation") == "yes"  ) {
			if ($(this).intlTelInput("isValidNumber")) { 
				check_field.attr("value","yes");
				check_field.val("yes");
				$(this).addClass('wpcf7-not-valid-blue').removeClass('wpcf7-not-valid-red').removeClass('wpcf7-not-valid');	
			}else{
				check_field.attr("value","no");
				check_field.val("no");
				$(this).addClass('wpcf7-not-valid-red').removeClass('wpcf7-not-valid-blue');
			}
		}
	}).keydown(function( event ) {
	  
	});
	$("body").on("focus",".elementor-field-telephone",function(){
		$(this).removeClass('wpcf7-not-valid-blue').removeClass('wpcf7-not-valid-red');
	})
		document.addEventListener("countrychange", function() {
		  $("input.elementor-field-telephone").change();
		});
	})
} )( jQuery );