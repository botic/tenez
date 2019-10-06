$(document).ready(function(){
    $("input#zipcityvalue").ready(function() {
        var cityId = $("input#zipcityvalue").val();

        if(!isNaN(cityId) && cityId > 0) {
            $.getJSON($("#apiurl").val() + "addresses/getCityById?id=" + cityId +"&jsoncallback=?", function(data){
                $("input.zipcityautocomplete").val(data.zip + " - " + data.name);
                console.log(data.zip + " - " + data.name);
            });
        }
    });

    $("input.zipcityautocomplete").autocomplete($("#apiurl").val() + "addresses/getCities", {
        extraParams: {
            'country': $("#country").val()
        },
        'minChars': 1,
        dataType: "json",
        parse: function(data) {
          var rows = new Array();
          for(var i=0; i<data.length; i++){
              rows[i] = { data: data[i], value: data[i].zip + " - " + data[i].name, result: data[i].zip + " - " + data[i].name };
          }
          return rows;
        },
        formatItem: function(row, i, n) {
            return row.zip + " - " + row.name
        },
        formatResult: function(row, i, n) {
            return row.zip + " - " + row.name;
        }
    });

    $("input.zipcityautocomplete").result(function(event, data, formatted){
        if(data && data.id) {
            $("#zipcityvalue").val(data.id);
        }
    });

    $('p#printbutton a#print').click(function() {
		window.print();
		return false;
	});
});

var getDateFromString = function(date) {
	
	var ok = false;
	
	var re_date = date.match(/^([0-9]{1,2})\.([0-9]{1,2})\.([0-9]{4})/);
	var re_time = date.match(/([0-9]{1,2}):([0-9]{2})$/);

	var days_of_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	
	var ret_d = 1;
	var ret_m = 0;
	var ret_y = 1970;
	var ret_h = 0;
	var ret_min = 0;
	
	if(re_date) {
		var d = parseInt(re_date[1], 10);
		var m = parseInt(re_date[2], 10);
		var y = parseInt(re_date[3], 10);
		
		// Leap Year
		if(m == 2 && y % 4 == 0) {
			days_of_month[1]++;
		}
		
		if(m >= 1 && m <= 12 && d >= 1 && d <= days_of_month[m-1]) {
			ret_y = y;
			ret_m = m-1;
			ret_d = d;
			ok = true;
		}
	}
	
	if(re_time) {
		var h = parseInt(re_time[1], 10);
		var min = parseInt(re_time[2], 10);
		if(h >= 0 && h <= 23 && min >= 0 && min <= 59) {
			ret_h = h;
			ret_min = min;
			ok = true;
		}
	}
	
	if(ok) {
		return new Date(ret_y, ret_m, ret_d, ret_h, ret_min);
	}
	
	return null;
}
