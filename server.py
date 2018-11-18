from flask import Flask
from flask import session, redirect, url_for, render_template, Response, request
import json

app = Flask(__name__, static_url_path="/portal/static")
FLASK_SESSION_KEY = "CHANGEME"

app.config.update(
    SECRET_KEY=FLASK_SESSION_KEY
)

URLS ={
   "API_GRANT_LIST": {"url": "/mga/sps/mga/user/mgmt/grant" 		, "method": "GET"},
   "API_GRANT_DETAIL": {"url": "/mga/sps/mga/user/mgmt/grant/{id}"	, "method": "GET"},
   "API_GRANT_DELETE": {"url": "/mga/sps/mga/user/mgmt/grant/{id}"	, "method": "DELETE"},
   "API_GRANT_UPDATE": {"url": "/mga/sps/mga/user/mgmt/grant/{id}"	, "method": "PUT"},
   "API_AUTHENTICATORS_LIST": {"url": "/mga/sps/mmfa/user/mgmt/authenticators" , "method": "GET"},
   "API_AUTHENTICATORS_AUTHORIZE": 
       {"url": "/mga/sps/oauth/oauth20/authorize?client_id={client}&response_type=code&scope=mmfaAuthn" 
         , "method": "GET"},
   "API_AUTHENTICATOR_JSON": {"url": "/mga/sps/mmfa/user/mgmt/qr_code/json?code={code}&client_id={client}", "method": "GET"},
   "API_AUTHENTICATOR_QR":	{"url": "/mga/sps/mmfa/user/mgmt/qr_code?code={code}&client_id={client}", "method": "GET"},
   "API_AUTHENTICATOR_DETAIL": {"url":"/mga/sps/mmfa/user/mgmt/authenticators/{id}","method":"GET"},
   "API_AUTHENTICATOR_DELETE": {"url":"/mga/sps/mmfa/user/mgmt/authenticators/{id}","method":"DELETE"},
   "API_AUTH_MECHANISM_DELETE": {"url":"/mga/sps/mmfa/user/mgmt/auth_methods/{id}","method":"DELETE"},
   "API_CLIENTS_LIST": {"url": "/mga/sps/mga/user/mgmt/clients" 		, "method": "GET"},
   "API_CLIENTS_DELETE": {"url": "/mga/sps/oauth/oauth20/register/{definition}?client_id={id}" 		, "method": "DELETE"},
   "API_CLIENTS_DETAIL": {"url": "/mga/sps/oauth/oauth20/register/{definition}?client_id={id}" 		, "method": "GET"},
   "API_CLIENTS_REGISTER": {"url": "/mga/sps/oauth/oauth20/register/{definition}" 		, "method": "POST"}
 }



def flat_multi(multidict):
    flat = {}
    for key, values in multidict.items():
        flat[key] = values[0] if type(values) == list and len(values) == 1 \
                    else values
    return flat

@app.route('/portal/', methods=['GET'])
def index_page():
    return redirect(url_for('users_page'))

@app.route('/portal/user', methods=['GET'])
def users_page():
    return render_template("user.html", urls = json.dumps(URLS))

@app.route('/portal/apps', methods=['GET'])
def apps_page():
    return render_template("apps.html")

@app.route('/portal/get_urls', methods=['GET'])
def get_urls():
    return Response(json.dumps(URLS), content_type='appication/json')

@app.route('/portal/callback', methods=['GET','POST'])
def oAuth_callback():
    params = flat_multi(request.values)
    return Response(json.dumps(params), content_type='appication/json')


run = {
    "debug": True,
    "port": 6001,
    "host": '0.0.0.0',
    "threaded": True
}

if __name__== "__main__":
   app.run(debug=run["debug"], threaded=run["threaded"], host=run["host"], port=run["port"])
