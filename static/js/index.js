String.prototype.format = function() {
    var formatted = this;
    var keys = Object.keys(arguments[0]);
    for (var i = 0; i < keys.length; i++) {
        var regexp = new RegExp('\\{'+keys[i] +'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[0][keys[i]] );
    }
    return formatted;
};

var urls = [];

function grants_table_remove_formatter(value, row, index) {
    return 	'<button type="button" class="table-remove btn btn-danger btn-sm">Remove</button>';
}

function grants_table_id_formatter(value, row, index) {
	return '<a href="#" data-toggle="modal" data-target="#modal-grant" data-row="'+value+'" >' + value + '</a>';
}

function authenticator_id_formatter(value, row, index) {
        return '<a href="#" data-toggle="modal" data-target="#modal-authenticator" data-row="'+value+'" >' + value + '</a>';
}

function grants_table_isenable_formatter(value, row, index) {
        return '<button type="button" class="table-patch btn btn-secondary btn-sm">' + value + '</button>'
        //return '<a href="#" data-toggle="modal" data-target="#modal-grant" data-row="'+value+'" >' + value + '</a>';
}

function authenticator_table_remove_formatter(value, row, index) {
    return      '<button type="button" class="table-auth-remove btn btn-danger btn-sm">Remove</button>';
}

function authenticator_enrolled_remove_formatter(value, row, index) {
    return      '<button type="button" class="table-auth-enroll-remove btn btn-danger btn-sm">Remove</button>';
}

function apps_table_remove_formatter(value, row, index) {
    return      '<button type="button" class="table-apps-remove btn btn-danger btn-sm">Remove</button>';
}

function apps_client_id_formatter(value, row, index) {
        return '<a href="#" data-toggle="modal" data-target="#modal-apps" data-row="'+value+'" >' + value + '</a>';
}



window.actionEvents = {
    'click .table-remove': function (e, value, row, index) {
        var url = urls["API_GRANT_DELETE"]["url"].format({"id": row["id"]})
        api_call(urls["API_GRANT_DELETE"]["method"], url,
			function(){ init_grant_table(true); });
    },
    'click .table-auth-remove': function (e, value, row, index) {
        var url = urls["API_AUTHENTICATOR_DELETE"]["url"].format({"id": row["id"]})
        api_call(urls["API_AUTHENTICATOR_DELETE"]["method"], url,
			function(){ init_grant_table(true); init_authenticators_table(true); });
    },
    'click .table-auth-enroll-remove': function (e, value, row, index) {
        var url = urls["API_AUTH_MECHANISM_DELETE"]["url"].format({"id": row["id"]})
        api_call(urls["API_AUTH_MECHANISM_DELETE"]["method"], url,
			function(){ reload_auth_methods($("#enrolled_row_id").val()); });
    },
    'click .table-apps-remove': function (e, value, row, index) {
        var url = urls["API_CLIENTS_DELETE"]["url"].format({"id": row["clientId"],"definition":"AppsRegister"})
        api_call(urls["API_CLIENTS_DELETE"]["method"], url,
                        function(){ init_apps_table(true); },null,{"Accept": "application/json"});
    },
    'click .table-patch': function (e, value, row, index) {
        var url = urls["API_GRANT_UPDATE"]["url"].format({"id": row["id"]})
        var isEnabled = row["isEnabled"]
        api_call(urls["API_GRANT_UPDATE"]["method"], url,
                        function(){ init_grant_table(true); },JSON.stringify({"isEnabled": !isEnabled}));
    }

};

    function load_urls() {
        $.ajax({
            type: "GET",
            url: "/portal/get_urls",
            dataType: "json",
            success: function(msg) {
                    console.log(msg);
                    urls = msg;
                    init();
            },
            error: function() {
                alert("failure");
            }
        });
    }


    function api_call(method,url,success,data =null,headers=null) {
	var req = {
            type: method,
            url: url,
            success: success,
            error: function() {
                alert("failure");
            }
        };
	if(data!= null){
		req.data = data;
	}
	if(headers!=null){
		req.headers = headers;
	}
        $.ajax(req); 
    }

    $("#modal-authenticator").on('show.bs.modal', function(e) {
        var button = $(e.relatedTarget);
        var rowid = button.data('row');
	$("#enrolled_row_id").val(rowid);
	reload_auth_methods(rowid);
    });

    $('#modal-authenticator').on('hidden.bs.modal', function () {
    	init_authenticators_table(true);
    })


    function reload_auth_methods(rowid){
        var url = urls["API_AUTHENTICATOR_DETAIL"]["url"].format({"id":rowid});
        api_call(urls["API_AUTHENTICATOR_DETAIL"]["method"], url, function(msg){
                $("#auth_enrolled_detail_table").bootstrapTable('destroy' );
                $("#auth_enrolled_detail_table").bootstrapTable( {data: msg.auth_methods });
        });
    }

    $("#modal-grant").on('show.bs.modal', function(e) {
	var button = $(e.relatedTarget);
	var rowid = button.data('row');
	var url = urls["API_GRANT_DETAIL"]["url"].format({"id":rowid});
	api_call(urls["API_GRANT_DETAIL"]["method"], url, function(msg){
		$("#grant_detail_table").bootstrapTable('destroy' );
		$("#grant_detail_table").bootstrapTable( {data: msg.tokens });
		$("#grant_attribute_detail_table").bootstrapTable('destroy' );
		$("#grant_attribute_detail_table").bootstrapTable( {data: msg.attributes });
	});

    });

    $("#modal-new-auth").on('show.bs.modal', function(e) {
        url = urls["API_AUTHENTICATORS_AUTHORIZE"]["url"].format({"client":"AuthenticatorClient"});
	api_call(urls["API_AUTHENTICATORS_AUTHORIZE"]["method"],url,function(msg){
		var url = urls["API_AUTHENTICATOR_JSON"]["url"].format({"client":"AuthenticatorClient","code":msg["code"]})
		api_call(urls["API_AUTHENTICATOR_JSON"]["method"],url,function(msg){
			var detail = "<p><strong>Client Id</strong>: " + msg['client_id'] + "</p>" +
			"<p><strong>Code</strong>: " + msg['code'] + "</p>" +
			"<p><strong>Details Url</strong>: " + msg['details_url'] + "</p>" +
			"<p><strong>Options</strong>: " + msg['options'] + "</p>"
	                $('#detail-qr').html(detail);
		});
		url = urls["API_AUTHENTICATOR_QR"]["url"].format({"client":"AuthenticatorClient","code":msg["code"]})
		$('#img-qr').html('<img id="qr" src="'+url+'" />')
        });
    });
                        
    $("#modal-apps").on('show.bs.modal', function(e) {
        var button = $(e.relatedTarget);
        var rowid = button.data('row');
        var headers = {"Accept": "application/json","Content-type": "application/json"};
        var url = urls["API_CLIENTS_DETAIL"]["url"].format({"id":rowid, "definition":"AppsRegister"});
	
        api_call(urls["API_CLIENTS_DETAIL"]["method"], url, function(msg){
		var list = [];
		Object.keys(msg).forEach(function(x){ list.push("<p><strong>"+x+"</strong>: " + msg[x] + "</p>"); });
		$('#detail-app').html(list.join(""));
        },null,headers);

    });


   function init(){
	if(document.location.href.includes("user")){
		init_grant_table();
		init_authenticators_table();
	}
	if(document.location.href.includes("apps")){
		init_apps_table();
	}
   }

   function init_grant_table(refresh = false){
	    api_call(urls["API_GRANT_LIST"]["method"], urls["API_GRANT_LIST"]["url"], function(msg){
		if (refresh){
		    $("#grants_table").bootstrapTable('destroy' );
		}
        	    $("#grants_table").bootstrapTable( {data: msg.grants });
    	    });
   }
   function init_authenticators_table(refresh = false){
            api_call(urls["API_AUTHENTICATORS_LIST"]["method"], urls["API_AUTHENTICATORS_LIST"]["url"], function(msg){
                if (refresh){
                    $("#authenticators-table").bootstrapTable('destroy' );
                }
                    $("#authenticators-table").bootstrapTable( {data: msg });
            });
   }
   function init_apps_table(refresh = false){
            api_call(urls["API_CLIENTS_LIST"]["method"], urls["API_CLIENTS_LIST"]["url"], function(msg){
		var json = msg.clients;
		json.forEach(function(x){
			x["client_name"] = x.data["client_name"];
			x["definitionName"] = x.data["registration_client_uri"].match(/register\/([^]*)(?=\?)/)[1];
		});
                if (refresh){
                    $("#apps_table").bootstrapTable('destroy' );
                }
                    $("#apps_table").bootstrapTable( {data: json });
            });
   }

   $("#new-app-btn").click(function(e){
	var appname = $("#app-name").val();
	var redirecturl = $("#redirect-url").val();
	var data = {client_name: appname, redirect_uris: redirecturl.split('\n')}
	var url = urls["API_CLIENTS_REGISTER"]["url"].format({"definition": "AppsRegister"});
	var headers = {"Accept": "application/json","Content-type": "application/json"};
	api_call(urls["API_CLIENTS_REGISTER"]["method"], url, function(msg){
		console.log(msg);
		$('#new-app').trigger("reset");
		init_apps_table(true);
	},JSON.stringify(data), headers );
   });

$( document ).ready(function() {
    console.log( "ready!" );
    load_urls();
});
